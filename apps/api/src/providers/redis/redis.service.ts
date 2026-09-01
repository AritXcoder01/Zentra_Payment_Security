import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface IRedisService {
  ping(): Promise<{ healthy: boolean; latencyMs: number }>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<'OK'>;
  del(key: string): Promise<number>;
}

@Injectable()
export class RedisService implements IRedisService, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying
        return Math.min(times * 200, 1000);
      },
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err?.message || err);
    });

    try {
      await this.client.connect();
      this.logger.log('Successfully connected to Redis instance');
    } catch (error: any) {
      this.logger.error('Failed to connect to Redis', error?.message || error);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
      this.logger.log('Disconnected from Redis');
    }
  }

  async ping(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      if (this.client.status !== 'ready' && this.client.status !== 'connecting') {
        return { healthy: false, latencyMs: Date.now() - start };
      }
      const res = await this.client.ping();
      return { healthy: res === 'PONG', latencyMs: Date.now() - start };
    } catch (error) {
      return { healthy: false, latencyMs: Date.now() - start };
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }
}
