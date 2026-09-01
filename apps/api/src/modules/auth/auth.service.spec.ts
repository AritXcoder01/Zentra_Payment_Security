import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RateLimiterService } from '../../common/utils/rate-limiter.util';
import { OTP_PROVIDER_TOKEN } from './providers/otp-provider.interface';
import { MockOtpProvider } from './providers/mock-otp.provider';

describe('AuthService & Authentication Security Tests', () => {
  let authService: AuthService;
  let prismaService: any;
  let otpProvider: MockOtpProvider;
  let rateLimiterService: any;
  let jwtService: any;

  const mockUser = {
    id: 'usr_123',
    mobileNumber: '+919876543210',
    email: 'user@example.com',
    fullName: 'Test User',
    accountStatus: 'ACTIVE',
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };

  const mockOtpRequest = {
    id: 'otp_123',
    mobileNumber: '+919876543210',
    attempts: 0,
    expiresAt: new Date(Date.now() + 300000),
    status: 'PENDING',
  };

  beforeEach(async () => {
    prismaService = {
      otpRequest: {
        create: jest.fn().mockResolvedValue(mockOtpRequest),
        findFirst: jest.fn().mockResolvedValue(mockOtpRequest),
        update: jest.fn().mockResolvedValue(mockOtpRequest),
      },
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.mobileNumber === '+919876543210' || where.id === 'usr_123') return Promise.resolve(mockUser);
          return Promise.resolve(null);
        }),
        create: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue(mockUser),
      },
      session: {
        create: jest.fn().mockResolvedValue({ id: 'sess_123' }),
        findFirst: jest.fn().mockResolvedValue({
          id: 'sess_123',
          userId: 'usr_123',
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 3600000),
        }),
        update: jest.fn().mockResolvedValue({ status: 'REVOKED' }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    rateLimiterService = {
      checkOtpRateLimit: jest.fn().mockResolvedValue(undefined),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock_jwt_token'),
      verifyAsync: jest.fn().mockImplementation((token) => {
        if (token === 'valid_reg_token') {
          return Promise.resolve({ mobileNumber: '+919876543211', purpose: 'REGISTRATION' });
        }
        throw new Error('Invalid token');
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultVal?: any) => {
              if (key === 'NODE_ENV') return 'development';
              if (key === 'OTP_VALIDITY_SECONDS') return 300;
              if (key === 'MOCK_OTP_CODE') return '123456';
              return defaultVal;
            }),
          },
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: RateLimiterService,
          useValue: rateLimiterService,
        },
        {
          provide: OTP_PROVIDER_TOKEN,
          useClass: MockOtpProvider,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    otpProvider = module.get(OTP_PROVIDER_TOKEN);
  });

  // Scenario 3: Request OTP Success & Demo OTP
  it('Scenario 3: Should successfully initiate OTP request and include demoOtp in dev mode', async () => {
    const res = await authService.requestOtp({ mobileNumber: '+919876543210' }, '127.0.0.1');
    expect(res.success).toBe(true);
    expect(res.demoOtp).toBe('123456');
    expect(prismaService.otpRequest.create).toHaveBeenCalled();
  });

  // Scenario 4 & 5: Mock & Provider behavior
  it('Scenario 4 & 5: Mock OTP Provider send and verify behavior', async () => {
    const sendRes = await otpProvider.sendOtp('+919876543210');
    expect(sendRes.success).toBe(true);
    expect(sendRes.demoOtp).toBe('123456');

    const verifyPass = await otpProvider.verifyOtp('+919876543210', '123456');
    expect(verifyPass.success).toBe(true);

    const verifyFail = await otpProvider.verifyOtp('+919876543210', '000000');
    expect(verifyFail.success).toBe(false);
  });

  // Production Guard Test
  it('Production Safety Guard: Should throw error if MockOtpProvider initialized in production', () => {
    const prodConfig = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        return undefined;
      }),
    };
    expect(() => new MockOtpProvider(prodConfig as any)).toThrow(HttpException);
  });

  // Scenario 6: OTP Verification Success for Returning User
  it('Scenario 6 & 12: OTP Verification success logs returning user in', async () => {
    const res = await authService.verifyOtp({ mobileNumber: '+919876543210', otp: '123456' }, '127.0.0.1');
    expect(res.isNewUser).toBe(false);
    expect(res.tokens?.accessToken).toBe('mock_jwt_token');
    expect(res.user?.mobileNumber).toBe('+919876543210');
  });

  // Scenario 7: OTP Verification Failure
  it('Scenario 7: OTP Verification failure throws UnauthorizedException', async () => {
    await expect(
      authService.verifyOtp({ mobileNumber: '+919876543210', otp: '999999' }, '127.0.0.1'),
    ).rejects.toThrow(UnauthorizedException);
    expect(prismaService.otpRequest.update).toHaveBeenCalled();
  });

  // Scenario 8: Expired OTP
  it('Scenario 8: Expired OTP throws UnauthorizedException', async () => {
    prismaService.otpRequest.findFirst.mockResolvedValueOnce({
      ...mockOtpRequest,
      expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
    });

    await expect(
      authService.verifyOtp({ mobileNumber: '+919876543210', otp: '123456' }, '127.0.0.1'),
    ).rejects.toThrow('OTP has expired');
  });

  // Scenario 9: OTP Attempt Limit
  it('Scenario 9: Exceeding 3 failed attempts invalidates OTP request', async () => {
    prismaService.otpRequest.findFirst.mockResolvedValueOnce({
      ...mockOtpRequest,
      attempts: 3,
    });

    await expect(
      authService.verifyOtp({ mobileNumber: '+919876543210', otp: '123456' }, '127.0.0.1'),
    ).rejects.toThrow('Maximum OTP verification attempts exceeded');
  });

  // Scenario 10 & 11: Rate Limiting Enforcement
  it('Scenario 10 & 11: Rate limiter throws 429 Too Many Requests on limit hit', async () => {
    rateLimiterService.checkOtpRateLimit.mockRejectedValueOnce(
      new HttpException('Please wait 60 seconds', HttpStatus.TOO_MANY_REQUESTS),
    );

    await expect(
      authService.requestOtp({ mobileNumber: '+919876543210' }, '127.0.0.1'),
    ).rejects.toThrow(HttpException);
  });

  // Scenario 13: New User Registration Flow
  it('Scenario 13: OTP verification for unregistered number returns registration token', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce(null);

    const res = await authService.verifyOtp({ mobileNumber: '+919876543211', otp: '123456' }, '127.0.0.1');
    expect(res.isNewUser).toBe(true);
    expect(res.registrationToken).toBe('mock_jwt_token');
  });

  // Scenario 14: Registration without valid verification token fails
  it('Scenario 14: Registration completion fails with invalid token', async () => {
    jwtService.verifyAsync.mockRejectedValueOnce(new Error('Invalid token'));

    await expect(
      authService.completeRegistration(
        { registrationToken: 'invalid_token', email: 'new@example.com', fullName: 'New User' },
        '127.0.0.1',
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  // Scenario 15: Duplicate Email Registration Fails
  it('Scenario 15: Duplicate email address throws ConflictException', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce(null) // mobile check -> free
      .mockResolvedValueOnce(mockUser); // email check -> taken

    await expect(
      authService.completeRegistration(
        { registrationToken: 'valid_reg_token', email: 'user@example.com', fullName: 'New User' },
        '127.0.0.1',
      ),
    ).rejects.toThrow(ConflictException);
  });

  // Scenario 18: Refresh Token Rotation
  it('Scenario 18: Refresh session rotates refresh token and issues new credentials', async () => {
    const res = await authService.refreshSession({ refreshToken: 'valid_raw_refresh_token' }, '127.0.0.1');
    expect(res.accessToken).toBe('mock_jwt_token');
    expect(prismaService.session.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'REVOKED' }) }),
    );
  });

  // Scenario 19: Revoked Refresh Token Fails
  it('Scenario 19: Revoked or invalid refresh token throws UnauthorizedException', async () => {
    prismaService.session.findFirst.mockResolvedValueOnce(null);

    await expect(
      authService.refreshSession({ refreshToken: 'revoked_token' }, '127.0.0.1'),
    ).rejects.toThrow(UnauthorizedException);
  });

  // Scenario 20: Logout Flow
  it('Scenario 20: Logout revokes session successfully', async () => {
    const res = await authService.logout('raw_token', 'usr_123', '127.0.0.1');
    expect(res.success).toBe(true);
    expect(prismaService.session.updateMany).toHaveBeenCalled();
  });

  // Scenario 21: Deleted Account Cannot Login
  it('Scenario 21: Deleted user account throws UnauthorizedException during login', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce({
      ...mockUser,
      accountStatus: 'DELETED',
    });

    await expect(
      authService.verifyOtp({ mobileNumber: '+919876543210', otp: '123456' }, '127.0.0.1'),
    ).rejects.toThrow('Account has been deleted');
  });
});
