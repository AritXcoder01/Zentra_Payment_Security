import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../../providers/database/prisma.service';
import { RedisService } from '../../providers/redis/redis.service';

@Module({
  controllers: [HealthController],
  providers: [PrismaService, RedisService],
})
export class HealthModule {}
