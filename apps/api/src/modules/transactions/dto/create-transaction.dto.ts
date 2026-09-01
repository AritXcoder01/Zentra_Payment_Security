import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
  Matches,
  NotEquals,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TransactionType, TransactionSource } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: 'DEBIT' })
  @IsEnum(TransactionType)
  transactionType!: TransactionType;

  @ApiProperty({ example: '1500.75', description: 'Positive financial transaction amount string e.g. "1500.75"' })
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      if (isNaN(value) || value <= 0) return '';
      return value.toString();
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  @IsString()
  @Matches(/^(?:[1-9]\d{0,9}|0)(?:\.\d{1,2})?$/, {
    message: 'Amount must be a positive decimal string with max 10 integer digits and max 2 decimal places (e.g. "1500.75")',
  })
  @NotEquals('0', { message: 'Amount must be greater than zero' })
  @NotEquals('0.0', { message: 'Amount must be greater than zero' })
  @NotEquals('0.00', { message: 'Amount must be greater than zero' })
  amount!: string;

  @ApiPropertyOptional({ example: 'INR', default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'UPI/1234567890/PAY' })
  @IsOptional()
  @IsString()
  transactionReference?: string;

  @ApiPropertyOptional({ example: 'Starbucks Coffee' })
  @IsOptional()
  @IsString()
  merchantName?: string;

  @ApiPropertyOptional({ example: 'starbucks@upi' })
  @IsOptional()
  @IsString()
  merchantVpa?: string;

  @ApiPropertyOptional({ example: 'XX1234' })
  @IsOptional()
  @IsString()
  accountMask?: string;

  @ApiProperty({ example: '2026-08-26T14:30:00Z' })
  @IsDateString()
  transactionDate!: string;

  @ApiPropertyOptional({ enum: TransactionSource, default: 'MANUAL' })
  @IsOptional()
  @IsEnum(TransactionSource)
  source?: TransactionSource;
}
