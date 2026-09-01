import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService, AuditService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
