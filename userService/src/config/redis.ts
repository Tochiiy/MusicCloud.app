import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Key helpers
export const userProfileKey = (userId: string): string => `uv1:user:${userId}`;
export const usersListKey = 'uv1:users';
export const DEFAULT_TTL = 300;

// @upstash/redis is a stateless REST client: every call is an HTTP request that
// throws when Redis is unreachable. We isolate all cache I/O behind try/catch and
// always degrade to MongoDB (the source of truth).
async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get<string>(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttl });
  } catch {
    // Redis down — skip caching, DB is the source of truth.
  }
}

async function cacheDel(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Redis down — stale entries expire naturally.
  }
}

export { cacheGet, cacheSet, cacheDel };