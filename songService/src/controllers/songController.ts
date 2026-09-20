import type { Request, Response } from 'express';
import { Readable } from 'node:stream';
import { pool } from '../config/config.js';
import { TryCatch } from '../TryCatch/TryCatch.js';
import { ApiStatusType } from '../Api_responseStatus/ApiStatusType.js';
import redis from '../config/redis.js';

type songRow = Record<string, any>;
type albumRow = Record<string, any>;

const CACHE_EXPIRATION = 1800; // 30 minutes in seconds

const SONG_LIST_COLUMNS = 'id, title, description, thumbnail, audio, album_id, created_at';
const ALBUM_LIST_COLUMNS = 'id, title, description, thumbnail, created_at';

export const songCacheKey = (songId: number | string): string => `v2:song:${songId}`;
export const albumSongsCacheKey = (albumId: number | string): string => `v2:songs:album:${albumId}`;
export const albumCacheKey = 'v2:albums';
export const songsCacheKey = 'v2:songs';

// @upstash/redis is a stateless REST client: it has no `isReady` flag and every
// call is a fire-and-forget HTTP request. If Redis is unreachable it throws,
// so we isolate all cache I/O behind try/catch and always degrade to Postgres.
async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get<string>(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key: string, value: unknown): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), { ex: CACHE_EXPIRATION });
  } catch {
    // Redis down — skip caching, DB is the source of truth.
  }
}

export const getAllSongs = TryCatch(async (_req: Request, res: Response) => {
  const cached = await cacheGet<songRow[]>(songsCacheKey);
  if (cached) {
    console.log('Cache hit for songs');
    return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Songs fetched successfully', status: ApiStatusType.SUCCESS.message, songs: cached });
  }
  console.log('Cache miss for songs');

  const result = await pool.query(`SELECT ${SONG_LIST_COLUMNS} FROM songs ORDER BY created_at DESC`);
  await cacheSet(songsCacheKey, result.rows);

  return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Songs fetched successfully', status: ApiStatusType.SUCCESS.message, songs: result.rows });
});

export const getAllAlbums = TryCatch(async (_req: Request, res: Response) => {
  const cached = await cacheGet<albumRow[]>(albumCacheKey);
  if (cached) {
    console.log('Cache hit for albums');
    return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Albums fetched successfully', status: ApiStatusType.SUCCESS.message, albums: cached });
  }
  console.log('Cache miss for albums');

  const result = await pool.query(`SELECT ${ALBUM_LIST_COLUMNS} FROM albums ORDER BY created_at DESC`);
  await cacheSet(albumCacheKey, result.rows);

  return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Albums fetched successfully', status: ApiStatusType.SUCCESS.message, albums: result.rows });
});

export const getAllSongsOfAlbum = TryCatch(async (req: Request, res: Response) => {
  const albumId = Number(req.params.albumId);
  if (!Number.isInteger(albumId) || albumId <= 0) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Invalid album id', status: ApiStatusType.BAD_REQUEST.message });
  }

  const cacheKey = albumSongsCacheKey(albumId);
  const cached = await cacheGet<songRow[]>(cacheKey);
  if (cached) {
    console.log(`Cache hit for songs of album ${albumId}`);
    return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Songs fetched successfully', status: ApiStatusType.SUCCESS.message, songs: cached });
  }
  console.log(`Cache miss for songs of album ${albumId}`);

  const album = await pool.query('SELECT id FROM albums WHERE id = $1', [albumId]);
  if (album.rows.length === 0) {
    return res.status(ApiStatusType.NOT_FOUND.code).json({ message: 'Album not found', status: ApiStatusType.NOT_FOUND.message });
  }

  const result = await pool.query(`SELECT ${SONG_LIST_COLUMNS} FROM songs WHERE album_id = $1 ORDER BY created_at DESC`, [albumId]);
  await cacheSet(cacheKey, result.rows);

  return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Songs fetched successfully', status: ApiStatusType.SUCCESS.message, songs: result.rows });
});

export const getSingleSong = TryCatch(async (req: Request, res: Response) => {
  const songId = Number(req.params.songId);
  if (!Number.isInteger(songId) || songId <= 0) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Invalid song id', status: ApiStatusType.BAD_REQUEST.message });
  }

  const cacheKey = songCacheKey(songId);
  const cached = await cacheGet<songRow>(cacheKey);
  if (cached) {
    console.log(`Cache hit for song ${songId}`);
    return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Song fetched successfully', status: ApiStatusType.SUCCESS.message, song: cached });
  }
  console.log(`Cache miss for song ${songId}`);

  const result = await pool.query(`SELECT ${SONG_LIST_COLUMNS} FROM songs WHERE id = $1`, [songId]);
  if (result.rows.length === 0) {
    return res.status(ApiStatusType.NOT_FOUND.code).json({ message: 'Song not found', status: ApiStatusType.NOT_FOUND.message });
  }

  await cacheSet(cacheKey, result.rows[0]);

  return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Song fetched successfully', status: ApiStatusType.SUCCESS.message, song: result.rows[0] });
});

export const downloadSong = TryCatch(async (req: Request, res: Response) => {
  const songId = Number(req.params.songId);
  if (!Number.isInteger(songId) || songId <= 0) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Invalid song id', status: ApiStatusType.BAD_REQUEST.message });
  }

  const result = await pool.query('SELECT audio, title FROM songs WHERE id = $1', [songId]);
  if (result.rows.length === 0) {
    return res.status(ApiStatusType.NOT_FOUND.code).json({ message: 'Song not found', status: ApiStatusType.NOT_FOUND.message });
  }

  const { audio, title } = result.rows[0] as { audio: string; title: string };
  if (!audio) {
    return res.status(ApiStatusType.NOT_FOUND.code).json({ message: 'Audio not found for this song', status: ApiStatusType.NOT_FOUND.message });
  }

  let remote: Awaited<ReturnType<typeof fetch>>;
  try {
    remote = await fetch(audio, {
      headers: req.headers.range ? { Range: req.headers.range as string } : {},
    });
  } catch {
    return res.status(ApiStatusType.SERVER_ERROR.code).json({ message: 'Failed to fetch audio from source', status: ApiStatusType.SERVER_ERROR.message });
  }

  if (!remote.ok) {
    return res.status(ApiStatusType.SERVER_ERROR.code).json({ message: 'Failed to fetch audio from source', status: ApiStatusType.SERVER_ERROR.message });
  }

  const safeTitle = (title ?? 'song').replace(/[^\w\s-]/gi, '') || 'song';
  res.setHeader('Content-Type', remote.headers.get('content-type') ?? 'audio/mpeg');
  res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.mp3"`);
  const contentLength = remote.headers.get('content-length');
  if (contentLength) res.setHeader('Content-Length', contentLength);
  res.setHeader('Accept-Ranges', 'bytes');

  if (req.headers.range && remote.status === 206) {
    res.status(206);
    const contentRange = remote.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);
  }

  if (!remote.body) {
    return res.status(ApiStatusType.SERVER_ERROR.code).json({ message: 'Failed to stream audio', status: ApiStatusType.SERVER_ERROR.message });
  }

  Readable.fromWeb(remote.body as import('node:stream/web').ReadableStream).pipe(res);
});

// ---- Cache invalidation (called from write paths) ----
export async function invalidateSongCache(albumId?: number, songId?: number): Promise<void> {
  const keys = [songsCacheKey, albumCacheKey];
  if (albumId) {
    keys.push(albumSongsCacheKey(albumId));
  }
  if (songId) {
    keys.push(songCacheKey(songId));
  }
  await Promise.allSettled(
    keys.map(async (key) => {
      try {
        await redis.del(key);
      } catch {
        // Redis unreachable — stale entries expire naturally via CACHE_EXPIRATION.
      }
    }),
  );
}
