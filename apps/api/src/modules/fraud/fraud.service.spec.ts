import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FraudService } from './fraud.service';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PaymentMode } from '@prisma/client';

describe('FraudService Unit Tests (Step 12A)', () => {
  let service: FraudService;
  let prisma: any;
  let audit: any;

  const mockCategory = { id: 'cat_123', code: 'UPI_FRAUD', name: 'UPI Fraud' };
  const mockReport1 = {
    id: 'rep_123',
    userId: 'usr_123',
    fraudCategoryId: 'cat_123',
    paymentMode: PaymentMode.UPI,
    amount: 2500,
    createdAt: new Date('2026-08-31T10:00:00.000Z'),
    fraudCategory: mockCategory,
  };

  const mockReport2 = {
    id: 'rep_124',
    userId: 'usr_123',
    fraudCategoryId: 'cat_123',
    paymentMode: PaymentMode.CARD,
    amount: 5000,
    createdAt: new Date('2026-08-31T12:00:00.000Z'),
    fraudCategory: mockCategory,
  };

  beforeEach(async () => {
    prisma = {
      fraudCategory: {
        findMany: jest.fn().mockResolvedValue([mockCategory]),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.OR && where.OR.some((w: any) => w.code === 'UPI_FRAUD' || w.id === 'cat_123')) return Promise.resolve(mockCategory);
          return Promise.resolve(null);
        }),
        upsert: jest.fn().mockResolvedValue(mockCategory),
      },
      fraudReport: {
        create: jest.fn().mockResolvedValue(mockReport1),
        findMany: jest.fn().mockResolvedValue([mockReport2, mockReport1]),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'rep_123' && where.userId === 'usr_123') return Promise.resolve(mockReport1);
          return Promise.resolve(null);
        }),
      },
      transaction: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'tx_own' && where.userId === 'usr_123') return Promise.resolve({ id: 'tx_own' });
          return Promise.resolve(null);
        }),
      },
      officialResource: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    audit = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FraudService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<FraudService>(FraudService);
  });

  it('1. Create valid fraud report', async () => {
    const res = await service.createReport('usr_123', {
      fraudCategory: 'UPI_FRAUD',
      paymentMode: PaymentMode.UPI,
      amount: 2500,
      incidentDate: '2026-08-26',
      description: 'Collect request scam received via PhonePe',
    });
    expect(res.id).toBe('rep_123');
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'FRAUD_REPORT_CREATED', userId: 'usr_123' }),
    );
  });

  it('2. Invalid fraud category throws BadRequestException', async () => {
    await expect(
      service.createReport('usr_123', {
        fraudCategory: 'INVALID_CODE',
        paymentMode: PaymentMode.UPI,
        amount: 2500,
        incidentDate: '2026-08-26',
        description: 'Test description',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('3. Cross-user related transaction throws ForbiddenException', async () => {
    await expect(
      service.createReport('usr_123', {
        fraudCategory: 'UPI_FRAUD',
        paymentMode: PaymentMode.UPI,
        amount: 2500,
        incidentDate: '2026-08-26',
        description: 'Test description',
        relatedTransactionId: 'tx_other_user',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('4. Cross-user report access rejected with NotFoundException (404)', async () => {
    await expect(service.findOneReport('usr_other', 'rep_123')).rejects.toThrow(NotFoundException);
  });

  it('5. Guidance Engine generates deterministic rules-based action plan', () => {
    const guidance = service.generateDeterministicGuidance('UNAUTHORIZED_TRANSACTION', PaymentMode.UPI);
    expect(guidance.severity).toBe('HIGH');
    expect(guidance.immediateActions).toContain('Update your UPI PIN, banking app passwords, and email credentials right away.');
    expect(guidance.safetyRecommendations).toContain('Remember: Entering your UPI PIN is ONLY for transferring money OUT of your account, NEVER for receiving money.');
  });

  it('6. User report history fetches only authenticated user reports sorted by createdAt DESC', async () => {
    const reports = await service.findAllReports('usr_123');
    expect(reports).toHaveLength(2);
    expect(prisma.fraudReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'usr_123' },
        orderBy: { createdAt: 'desc' },
      }),
    );
  });
});
