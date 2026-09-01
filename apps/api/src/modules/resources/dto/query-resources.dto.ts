import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMode, ResourceType } from '@prisma/client';

export class QueryResourcesDto {
  @ApiPropertyOptional({ description: 'Filter by fraud category code or ID' })
  @IsOptional()
  @IsString()
  fraudCategory?: string;

  @ApiPropertyOptional({ enum: PaymentMode })
  @IsOptional()
  @IsEnum(PaymentMode)
  paymentMode?: PaymentMode;

  @ApiPropertyOptional({ enum: ResourceType })
  @IsOptional()
  @IsEnum(ResourceType)
  resourceType?: ResourceType;
}
