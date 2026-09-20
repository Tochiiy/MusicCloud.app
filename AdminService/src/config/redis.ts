import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;

// Cache keys must mirror the ones owned by songService (see
// songService/src/controllers/songController.ts). songService caches read
// responses for up to 30 minutes; whenever AdminService writes to the shared
// Postgres database it deletes those keys so the very next read is fresh.
export const songsCacheKey = 'v2:songs';
export const albumCacheKey = 'v2:albums';
export const songCacheKey = (songId: number): string => `v2:song:${songId}`;
export const albumSongsCacheKey = (albumId: number): string => `v2:songs:album:${albumId}`;

// @upstash/redis is a fire-and-forget REST client: if Redis is unreachable it
// throws, so we isolate deletes behind try/catch and treat them as best-effort
// (stale entries expire naturally via songService's CACHE_EXPIRATION).
export async function invalidateSongCache(albumId?: number, songId?: number): Promise<void> {
  const keys = [songsCacheKey, albumCacheKey];
  if (albumId) {
    keys.push(albumSongsCacheKey(albumId));
  }
  if (songId) {
    keys.push(songCacheKey(songId));
  }
  // Dedupe: when both albumId and songId are provided, keys can't overlap, but
  // keep the set unique in case the shapes change later.
  const uniqueKeys = [...new Set(keys)];
  await Promise.allSettled(
    uniqueKeys.map(async (key) => {
      try {
        await redis.del(key);
      } catch {
        // Redis unreachable — stale entries expire naturally.
      }
    }),
  );
}

export async function invalidateSongsCache(): Promise<void> {
  await invalidateSongCache();
}

export async function invalidateAlbumListCache(): Promise<void> {
  await Promise.allSettled([
    (async () => {
      try {
        await redis.del(albumCacheKey);
      } catch {
        // best-effort
      }
    })(),
  ]);
}

export async function invalidateSongListCache(): Promise<void> {
  await Promise.allSettled([
    (async () => {
      try {
        await redis.del(songsCacheKey);
      } catch {
        // best-effort
      }
    })(),
  ]);
}