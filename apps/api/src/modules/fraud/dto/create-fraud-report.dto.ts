import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
} from 'class-validator';
import { PaymentMode } from '@prisma/client';

export class CreateFraudReportDto {
  @ApiProperty({ example: 'UPI_FRAUD', description: 'Category code or ID' })
  @IsString()
  fraudCategory!: string;

  @ApiProperty({ enum: PaymentMode, example: 'UPI' })
  @IsEnum(PaymentMode)
  paymentMode!: PaymentMode;

  @ApiProperty({ example: 2500.0, description: 'Incident financial amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @ApiProperty({ example: '2026-08-26' })
  @IsDateString()
  incidentDate!: string;

  @ApiProperty({ example: 'Scammer sent a fake collect request pretending to be a buyer.' })
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiPropertyOptional({ example: 'UPI/1234567890/PAY' })
  @IsOptional()
  @IsString()
  transactionReference?: string;

  @ApiPropertyOptional({ example: 'tx_uuid_here' })
  @IsOptional()
  @IsString()
  relatedTransactionId?: string;
}
