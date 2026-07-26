import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
  ) {}

  private redis: Redis | null = null;

  private getRedis(): Redis | null {
    if (!this.redis) {
      try {
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          lazyConnect: true,
        });
      } catch {
        return null;
      }
    }
    return this.redis;
  }

  async getHealth() {
    const checks: Record<string, string> = {};

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.postgres = 'ok';
    } catch {
      checks.postgres = 'error';
    }

    const redis = this.getRedis();
    if (redis) {
      try {
        await redis.connect();
        const pong = await redis.ping();
        checks.redis = pong === 'PONG' ? 'ok' : 'error';
        redis.disconnect();
      } catch {
        checks.redis = 'error';
      }
    } else {
      checks.redis = 'unavailable';
    }

    const allOk = Object.values(checks).every((v) => v === 'ok');

    return {
      status: allOk ? 'ok' : 'degraded',
      service: 'organa-api',
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
