import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    if (user.accountStatus === 'DELETED') {
      throw new ForbiddenException('Account has been deleted');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, ipAddress?: string, userAgent?: string) {
    // CRITICAL SECURITY ENFORCEMENT: Reject any payload containing mobileNumber
    if ('mobileNumber' in (dto as any) || 'mobile_number' in (dto as any)) {
      throw new BadRequestException('Registered mobile number is permanent and cannot be changed.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.accountStatus === 'DELETED') {
      throw new ForbiddenException('Cannot update profile for deleted or non-existent account');
    }

    // Email uniqueness check if email is being updated
    if (dto.email && dto.email.toLowerCase().trim() !== user.email?.toLowerCase()) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });
      if (existingEmail) {
        throw new ConflictException('Email address is already in use by another account');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName !== undefined ? dto.fullName.trim() : undefined,
        email: dto.email !== undefined ? dto.email.toLowerCase().trim() : undefined,
        profilePhoto: dto.profilePhoto !== undefined ? dto.profilePhoto : undefined,
      },
    });

    await this.auditService.log({
      userId,
      action: 'PROFILE_UPDATED',
      ipAddress,
      userAgent,
      metadata: {
        updatedFields: Object.keys(dto),
      },
    });

    return this.sanitizeUser(updatedUser);
  }

  async deleteAccount(userId: string, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.accountStatus === 'DELETED') {
      throw new NotFoundException('User account not found or already deleted');
    }

    // Soft delete user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: 'DELETED',
      },
    });

    // Revoke all active sessions
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
      action: 'ACCOUNT_DELETED',
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: 'Account deleted successfully.',
    };
  }

  private sanitizeUser(user: any) {
    return {
      id: user.id,
      mobileNumber: user.mobileNumber,
      email: user.email,
      fullName: user.fullName,
      profilePhoto: user.profilePhoto,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
