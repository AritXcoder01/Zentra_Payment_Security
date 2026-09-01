import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('SessionsService Unit Tests (Step 9)', () => {
  let service: SessionsService;
  let prisma: any;
  let audit: any;

  const mockSession1 = {
    id: 'sess_1',
    userId: 'usr_123',
    refreshTokenHash: 'hash_secret_never_exposed',
    status: 'ACTIVE',
    createdAt: new Date(),
    lastUsedAt: new Date(),
    expiresAt: new Date(Date.now() + 86400000),
    device: null,
  };

  const mockSession2 = {
    id: 'sess_2',
    userId: 'usr_123',
    refreshTokenHash: 'hash_secret_2',
    status: 'ACTIVE',
    createdAt: new Date(),
    lastUsedAt: new Date(),
    expiresAt: new Date(Date.now() + 86400000),
    device: null,
  };

  beforeEach(async () => {
    prisma = {
      session: {
        findMany: jest.fn().mockResolvedValue([mockSession1, mockSession2]),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'sess_1' && where.userId === 'usr_123') return Promise.resolve(mockSession1);
          return Promise.resolve(null);
        }),
        update: jest.fn().mockResolvedValue({ ...mockSession1, status: 'REVOKED' }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    audit = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('1. User only sees own sessions and refreshTokenHash is NEVER returned', async () => {
    const res = await service.findAllForUser('usr_123', 'sess_1');
    expect(res).toHaveLength(2);
    expect(res[0].currentSession).toBe(true);
    expect(res[1].currentSession).toBe(false);
    expect(res[0]).not.toHaveProperty('refreshTokenHash');
    expect(res[1]).not.toHaveProperty('refreshTokenHash');
  });

  it('2. Revoke own session successfully and logs SESSION_REVOKED audit event', async () => {
    const res = await service.revokeSession('usr_123', 'sess_1');
    expect(res.success).toBe(true);
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'SESSION_REVOKED', userId: 'usr_123' }),
    );
  });

  it('3. Cannot revoke another user session (NotFoundException)', async () => {
    await expect(service.revokeSession('usr_other', 'sess_1')).rejects.toThrow(NotFoundException);
  });

  it('4. Revoke other sessions preserves current session', async () => {
    const res = await service.revokeOthers('usr_123', 'sess_1');
    expect(res.success).toBe(true);
    expect(res.count).toBe(1);
    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: { userId: 'usr_123', status: 'ACTIVE', id: { not: 'sess_1' } },
      data: expect.objectContaining({ status: 'REVOKED' }),
    });
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'OTHER_SESSIONS_REVOKED', userId: 'usr_123' }),
    );
  });
});
