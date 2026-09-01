import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('UsersService & Mobile Immutability Tests', () => {
  let usersService: UsersService;
  let prismaService: any;

  const mockUser = {
    id: 'usr_123',
    mobileNumber: '+919876543210',
    email: 'user@example.com',
    fullName: 'Test User',
    profilePhoto: null,
    accountStatus: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'usr_123') return Promise.resolve(mockUser);
          return Promise.resolve(null);
        }),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...mockUser, ...data })),
      },
      session: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('Scenario 16: Should update profile fullName and email successfully', async () => {
    const updated = await usersService.updateProfile('usr_123', {
      fullName: 'Updated Name',
      email: 'updated@example.com',
    });
    expect(updated.fullName).toBe('Updated Name');
    expect(updated.email).toBe('updated@example.com');
  });

  it('Scenario 17: MUST REJECT any attempt to update mobileNumber', async () => {
    await expect(
      usersService.updateProfile('usr_123', { mobileNumber: '+919999999999' } as any),
    ).rejects.toThrow(BadRequestException);

    await expect(
      usersService.updateProfile('usr_123', { mobile_number: '+919999999999' } as any),
    ).rejects.toThrow('Registered mobile number is permanent and cannot be changed.');
  });

  it('Should soft delete user account and revoke active sessions', async () => {
    const res = await usersService.deleteAccount('usr_123');
    expect(res.success).toBe(true);
    expect(prismaService.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { accountStatus: 'DELETED' } }),
    );
    expect(prismaService.session.updateMany).toHaveBeenCalled();
  });
});
