import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('AlertsService Unit Tests (Step 9)', () => {
  let service: AlertsService;
  let prisma: any;
  let audit: any;

  const mockAlert = { id: 'alt_123', userId: 'usr_123', isRead: false, title: 'Test Alert' };

  beforeEach(async () => {
    prisma = {
      securityAlert: {
        findMany: jest.fn().mockResolvedValue([mockAlert]),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'alt_123' && where.userId === 'usr_123') return Promise.resolve(mockAlert);
          return Promise.resolve(null);
        }),
        update: jest.fn().mockResolvedValue({ ...mockAlert, isRead: true }),
      },
    };

    audit = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
  });

  it('1. User only sees own alerts', async () => {
    const res = await service.findAllForUser('usr_123');
    expect(res).toHaveLength(1);
    expect(prisma.securityAlert.findMany).toHaveBeenCalledWith({
      where: { userId: 'usr_123' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('2. Mark own alert read is idempotent and logs audit event', async () => {
    const res = await service.markAsRead('usr_123', 'alt_123');
    expect(res.success).toBe(true);
    expect(prisma.securityAlert.update).toHaveBeenCalledWith({
      where: { id: 'alt_123' },
      data: { isRead: true },
    });
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'SECURITY_ALERT_READ', userId: 'usr_123' }),
    );
  });

  it('3. Cross-user alert access throws NotFoundException', async () => {
    await expect(service.markAsRead('usr_other', 'alt_123')).rejects.toThrow(NotFoundException);
  });
});
