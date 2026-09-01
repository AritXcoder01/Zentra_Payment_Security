import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { TransactionType } from '@prisma/client';

describe('TransactionsService Unit Tests (Step 9 & 14A)', () => {
  let service: TransactionsService;
  let prisma: any;
  let audit: any;

  const mockTx = {
    id: 'tx_123',
    userId: 'usr_123',
    transactionType: TransactionType.DEBIT,
    amount: '1500.00',
    currency: 'INR',
    merchantName: 'Starbucks',
    transactionDate: new Date(),
    source: 'MANUAL',
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: jest.fn().mockResolvedValue(mockTx),
        findMany: jest.fn().mockResolvedValue([mockTx]),
        count: jest.fn().mockResolvedValue(1),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'tx_123' && where.userId === 'usr_123') return Promise.resolve(mockTx);
          return Promise.resolve(null);
        }),
        groupBy: jest.fn().mockResolvedValue([
          { transactionType: TransactionType.DEBIT, _sum: { amount: 1500 }, _count: { id: 1 } },
          { transactionType: TransactionType.CREDIT, _sum: { amount: 5000 }, _count: { id: 1 } },
        ]),
      },
    };

    audit = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('1. Authenticated transaction creation', async () => {
    const res = await service.create('usr_123', {
      transactionType: TransactionType.DEBIT,
      amount: '1500.00',
      transactionDate: new Date().toISOString(),
    });
    expect(res.id).toBe('tx_123');
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'TRANSACTION_CREATED', userId: 'usr_123' }),
    );
  });

  it('2. GET only returns current user transactions', async () => {
    const res = await service.findAll('usr_123', { page: 1, limit: 10 });
    expect(res.items).toHaveLength(1);
    expect(prisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'usr_123' }) }),
    );
  });

  it('3. Cross-user transaction access rejected with NotFoundException', async () => {
    await expect(service.findOne('usr_other', 'tx_123')).rejects.toThrow(NotFoundException);
  });

  it('4. Summary correctly calculates credit/debit totals', async () => {
    const res = await service.getSummary('usr_123');
    expect(res.moneyOut).toBe(1500);
    expect(res.moneyIn).toBe(5000);
    expect(res.transactionCount).toBe(2);
  });
});
