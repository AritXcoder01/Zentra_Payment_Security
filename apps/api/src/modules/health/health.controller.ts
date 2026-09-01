import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { PrismaService } from '../../providers/database/prisma.service';
import { RedisService } from '../../providers/redis/redis.service';
import { ApiResponse, HealthCheckResponse, ServiceStatus } from '@zentra/shared';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'API & Infrastructure Dependency Health Check' })
  @SwaggerResponse({ status: 200, description: 'Service health status' })
  async getHealth(): Promise<ApiResponse<HealthCheckResponse>> {
    const dbPing = await this.prismaService.ping();
    const redisPing = await this.redisService.ping();

    const dbStatus = dbPing.healthy ? ServiceStatus.HEALTHY : ServiceStatus.UNHEALTHY;
    const redisStatus = redisPing.healthy ? ServiceStatus.HEALTHY : ServiceStatus.UNHEALTHY;

    const overallStatus =
      dbPing.healthy && redisPing.healthy
        ? ServiceStatus.HEALTHY
        : ServiceStatus.DEGRADED;

    const healthData: HealthCheckResponse = {
      status: overallStatus,
      service: 'zentra-api',
      version: '0.1.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      dependencies: {
        database: {
          status: dbStatus,
          latencyMs: dbPing.latencyMs,
        },
        redis: {
          status: redisStatus,
          latencyMs: redisPing.latencyMs,
        },
      },
    };

    return {
      success: overallStatus === ServiceStatus.HEALTHY,
      statusCode: 200,
      message: 'Health status check completed',
      data: healthData,
      timestamp: new Date().toISOString(),
    };
  }
}
