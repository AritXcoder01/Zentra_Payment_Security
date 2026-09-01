import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RateLimiterService } from '../../common/utils/rate-limiter.util';
import { IOtpProvider, OTP_PROVIDER_TOKEN } from './providers/otp-provider.interface';
import { normalizeMobileNumber } from '@zentra/shared';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterCompleteDto } from './dto/register-complete.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    private readonly rateLimiterService: RateLimiterService,
    @Inject(OTP_PROVIDER_TOKEN) private readonly otpProvider: IOtpProvider,
  ) {}

  /**
   * 1. Request OTP Flow
   */
  async requestOtp(dto: RequestOtpDto, ipAddress: string, userAgent?: string) {
    let normalizedMobile: string;
    try {
      normalizedMobile = normalizeMobileNumber(dto.mobileNumber);
    } catch (err: any) {
      throw new BadRequestException(err?.message || 'Invalid mobile number format');
    }

    // Apply Redis rate limits and resend cooldowns
    await this.rateLimiterService.checkOtpRateLimit(normalizedMobile, ipAddress);

    const validitySeconds = this.configService.get<number>('OTP_VALIDITY_SECONDS', 300);
    const expiresAt = new Date(Date.now() + validitySeconds * 1000);

    // Create tracking placeholder hash
    const placeholderHash = crypto
      .createHash('sha256')
      .update(`${normalizedMobile}:${Date.now()}`)
      .digest('hex');

    // Create DB tracking record
    await this.prisma.otpRequest.create({
      data: {
        mobileNumber: normalizedMobile,
        otpHash: placeholderHash,
        expiresAt,
        status: 'PENDING',
      },
    });

    // Send OTP via configured provider
    const sendResult = await this.otpProvider.sendOtp(normalizedMobile);

    await this.auditService.log({
      action: sendResult.success ? 'OTP_REQUESTED' : 'OTP_PROVIDER_FAILURE',
      ipAddress,
      userAgent,
      metadata: {
        mobileNumber: normalizedMobile,
        providerSuccess: sendResult.success,
      },
    });

    if (sendResult.success) {
      await this.auditService.log({
        action: 'OTP_PROVIDER_SUCCESS',
        ipAddress,
        userAgent,
        metadata: { mobileNumber: normalizedMobile },
      });
    }

    return {
      success: true,
      message: 'If this number can receive an OTP, a verification code has been sent.',
      ...(sendResult.demoOtp ? { demoOtp: sendResult.demoOtp } : {}),
    };
  }

  /**
   * 2. Verify OTP Flow
   */
  async verifyOtp(dto: VerifyOtpDto, ipAddress: string, userAgent?: string) {
    let normalizedMobile: string;
    try {
      normalizedMobile = normalizeMobileNumber(dto.mobileNumber);
    } catch (err: any) {
      throw new BadRequestException(err?.message || 'Invalid mobile number format');
    }

    const latestOtp = await this.prisma.otpRequest.findFirst({
      where: { mobileNumber: normalizedMobile },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestOtp) {
      throw new UnauthorizedException('No OTP request found for this mobile number');
    }

    if (latestOtp.attempts >= 3) {
      await this.prisma.otpRequest.update({
        where: { id: latestOtp.id },
        data: { status: 'MAX_ATTEMPTS_EXCEEDED' },
      });
      throw new UnauthorizedException('Maximum OTP verification attempts exceeded');
    }

    if (latestOtp.expiresAt < new Date()) {
      await this.prisma.otpRequest.update({
        where: { id: latestOtp.id },
        data: { status: 'EXPIRED' },
      });
      throw new UnauthorizedException('OTP has expired');
    }

    // Verify OTP with Provider
    const verifyResult = await this.otpProvider.verifyOtp(normalizedMobile, dto.otp);

    if (!verifyResult.success) {
      await this.prisma.otpRequest.update({
        where: { id: latestOtp.id },
        data: { attempts: { increment: 1 } },
      });

      await this.auditService.log({
        action: 'OTP_FAILED',
        ipAddress,
        userAgent,
        metadata: { mobileNumber: normalizedMobile },
      });

      throw new UnauthorizedException('Invalid or expired OTP code');
    }

    // Mark OTP as verified
    await this.prisma.otpRequest.update({
      where: { id: latestOtp.id },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
      },
    });

    await this.auditService.log({
      action: 'OTP_VERIFIED',
      ipAddress,
      userAgent,
      metadata: { mobileNumber: normalizedMobile },
    });

    // Check if returning user
    const existingUser = await this.prisma.user.findUnique({
      where: { mobileNumber: normalizedMobile },
    });

    if (existingUser) {
      if (existingUser.accountStatus === 'DELETED') {
        throw new UnauthorizedException('Account has been deleted');
      }

      // Create session for returning user
      const tokens = await this.createSessionForUser(existingUser.id, ipAddress, userAgent);

      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: { lastLoginAt: new Date() },
      });

      await this.auditService.log({
        userId: existingUser.id,
        action: 'LOGIN_SUCCESS',
        ipAddress,
        userAgent,
      });

      return {
        isNewUser: false,
        tokens,
        user: this.sanitizeUser(existingUser),
      };
    }

    // New user: Issue registration token
    const registrationTokenSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'zentra_dev_access_secret_min_32_chars_long',
    );
    const registrationToken = await this.jwtService.signAsync(
      { mobileNumber: normalizedMobile, purpose: 'REGISTRATION' },
      { secret: registrationTokenSecret, expiresIn: '15m' },
    );

    return {
      isNewUser: true,
      registrationToken,
      message: 'OTP verified. Please complete registration by providing your email and name.',
    };
  }

  /**
   * 3. Complete Registration Flow (New User)
   */
  async completeRegistration(dto: RegisterCompleteDto, ipAddress: string, userAgent?: string) {
    let payload: any;
    const registrationTokenSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'zentra_dev_access_secret_min_32_chars_long',
    );

    try {
      payload = await this.jwtService.verifyAsync(dto.registrationToken, {
        secret: registrationTokenSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired registration token');
    }

    if (!payload?.mobileNumber || payload?.purpose !== 'REGISTRATION') {
      throw new UnauthorizedException('Invalid registration token payload');
    }

    const mobileNumber = payload.mobileNumber;

    // Check if user already registered
    const existingMobileUser = await this.prisma.user.findUnique({
      where: { mobileNumber },
    });
    if (existingMobileUser) {
      throw new ConflictException('User already registered with this mobile number');
    }

    // Check email uniqueness
    const existingEmailUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existingEmailUser) {
      throw new ConflictException('Email address is already registered');
    }

    // Create User entity
    const newUser = await this.prisma.user.create({
      data: {
        mobileNumber,
        email: dto.email.toLowerCase().trim(),
        fullName: dto.fullName.trim(),
        accountStatus: 'ACTIVE',
      },
    });

    await this.auditService.log({
      userId: newUser.id,
      action: 'USER_CREATED',
      ipAddress,
      userAgent,
    });

    // Create session
    const tokens = await this.createSessionForUser(newUser.id, ipAddress, userAgent);

    await this.auditService.log({
      userId: newUser.id,
      action: 'LOGIN_SUCCESS',
      ipAddress,
      userAgent,
    });

    return {
      tokens,
      user: this.sanitizeUser(newUser),
    };
  }

  /**
   * 4. Refresh Token Rotation
   */
  async refreshSession(dto: RefreshTokenDto, ipAddress: string, userAgent?: string) {
    const tokenHash = this.hashToken(dto.refreshToken);

    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash: tokenHash,
        status: 'ACTIVE',
      },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old session
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user || user.accountStatus !== 'ACTIVE') {
      throw new UnauthorizedException('User account is no longer active');
    }

    // Issue new session
    const tokens = await this.createSessionForUser(user.id, ipAddress, userAgent);

    await this.auditService.log({
      userId: user.id,
      action: 'SESSION_REFRESHED',
      ipAddress,
      userAgent,
    });

    return tokens;
  }

  /**
   * 5. Logout Flow
   */
  async logout(refreshToken: string | undefined, userId: string, ipAddress: string, userAgent?: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.session.updateMany({
        where: {
          refreshTokenHash: tokenHash,
          userId,
        },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(),
        },
      });
    }

    // Also revoke active sessions for user if needed
    await this.prisma.session.updateMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    await this.auditService.log({
      userId,
      action: 'LOGOUT',
      ipAddress,
      userAgent,
    });

    await this.auditService.log({
      userId,
      action: 'SESSION_REVOKED',
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: 'Successfully logged out',
    };
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private async createSessionForUser(userId: string, ipAddress?: string, userAgent?: string) {
    const accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'zentra_dev_access_secret_min_32_chars_long',
    );

    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = this.hashToken(rawRefreshToken);
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        status: 'ACTIVE',
        expiresAt: refreshExpiresAt,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    const accessToken = await this.jwtService.signAsync(
      { sub: userId, sid: session.id, type: 'ACCESS' },
      { secret: accessSecret, expiresIn: '15m' },
    );

    await this.auditService.log({
      userId,
      action: 'SESSION_CREATED',
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      tokenType: 'Bearer',
      expiresInSeconds: 900,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private sanitizeUser(user: any) {
    return {
      id: user.id,
      mobileNumber: user.mobileNumber,
      email: user.email,
      fullName: user.fullName,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
