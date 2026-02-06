import { NextResponse } from 'next/server';
import Redis from 'ioredis';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasRedisUrl: !!process.env.REDIS_URL,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    redisUrlFormat: process.env.REDIS_URL ? 'present' : 'missing',
    redisConnection: 'not tested',
    error: null as string | null,
  };

  // Test Redis connection
  if (process.env.REDIS_URL) {
    let redis: Redis | null = null;
    try {
      redis = new Redis(process.env.REDIS_URL, {
        connectTimeout: 5000,
        maxRetriesPerRequest: 1,
      });

      // Try to ping Redis
      await redis.ping();
      diagnostics.redisConnection = 'success';

      await redis.quit();
    } catch (error: any) {
      diagnostics.redisConnection = 'failed';
      diagnostics.error = error.message;

      if (redis) {
        try {
          await redis.quit();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }

  const statusCode = diagnostics.redisConnection === 'success' ? 200 : 500;

  return NextResponse.json(diagnostics, { status: statusCode });
}
