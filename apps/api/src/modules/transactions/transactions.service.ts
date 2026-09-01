import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { TransactionType, Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(userId: string, dto: CreateTransactionDto, ipAddress?: string, userAgent?: string) {
    const decimalAmount = new Prisma.Decimal(dto.amount.toString());

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        transactionType: dto.transactionType,
        amount: decimalAmount,
        currency: dto.currency || 'INR',
        transactionReference: dto.transactionReference || null,
        merchantName: dto.merchantName || null,
        merchantVpa: dto.merchantVpa || null,
        accountMask: dto.accountMask || null,
        transactionDate: new Date(dto.transactionDate),
        source: dto.source || 'MANUAL',
      },
    });

    await this.auditService.log({
      userId,
      action: 'TRANSACTION_CREATED',
      ipAddress,
      userAgent,
      metadata: {
        transactionId: transaction.id,
        amount: dto.amount.toString(),
        type: dto.transactionType,
      },
    });

    return transaction;
  }

  async findAll(userId: string, query: QueryTransactionsDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.type) {
      where.transactionType = query.type;
    }

    if (query.search) {
      where.OR = [
        { merchantName: { contains: query.search, mode: 'insensitive' } },
        { transactionReference: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.from || query.to) {
      where.transactionDate = {};
      if (query.from) where.transactionDate.gte = new Date(query.from);
      if (query.to) where.transactionDate.lte = new Date(query.to);
    }

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSummary(userId: string) {
    const aggregates = await this.prisma.transaction.groupBy({
      by: ['transactionType'],
      where: { userId },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    let moneyIn = 0;
    let moneyOut = 0;
    let transactionCount = 0;

    for (const group of aggregates) {
      const sum = group._sum.amount ? Number(group._sum.amount) : 0;
      const count = group._count.id || 0;
      transactionCount += count;

      if (group.transactionType === TransactionType.CREDIT) {
        moneyIn += sum;
      } else if (group.transactionType === TransactionType.DEBIT) {
        moneyOut += sum;
      }
    }

    return {
      moneyIn,
      moneyOut,
      transactionCount,
    };
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }
}
