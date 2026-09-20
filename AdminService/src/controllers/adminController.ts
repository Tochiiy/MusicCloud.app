import type { Request, Response } from 'express';
import { unlinkSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { pool } from '../database/adminModel.js';
import cloudinary from '../cloudinaryBlob/cloudinary.js';
import axios from 'axios';
import { albumSchema, songSchema } from '../validators/adminValidator.js';
import { ApiStatusType } from '../Api_responseStatus/ApiStatusType.js';
import { tryCatch as TryCatch } from '../TryCatch.ts/TryCatch.js';
import { getFileType } from '../cloudinaryBlob/file-typeParser.js';
import { invalidateSongCache, invalidateAlbumListCache } from '../config/redis.js';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:6100';

async function deleteCloudinaryAsset(
  publicId: string | undefined,
  resourceType: 'image' | 'video',
): Promise<void> {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Failed to clean up Cloudinary asset:', error);
  }
}

export const getAllUsers = TryCatch(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization as string;

  const { data } = await axios.get(`${USER_SERVICE_URL}/api/v1/user/users`, {
    headers: { Authorization: authHeader },
  });

  return res.status(ApiStatusType.SUCCESS.code).json({ message: data.message, status: ApiStatusType.SUCCESS.message, users: data.users });
});

export const addAlbum = TryCatch(async (_req: Request, res: Response) => {
  const file = _req.file;

  if (!file) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'File is required', status: ApiStatusType.BAD_REQUEST.message });
  }

  try {
    const { title, description } = albumSchema.parse(_req.body);

    // Content sniff: verify the real file type, not the client-declared mimetype.
    const { mime } = await getFileType(await readFile(file.path));
    if (!mime.startsWith('image/')) {
      return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'File is not a valid image', status: ApiStatusType.BAD_REQUEST.message });
    }

    const cloud = await cloudinary.uploader.upload(file.path, {
      folder: 'albums',
      resource_type: 'auto',
    });

    if (!cloud || !cloud.secure_url) {
      return res.status(ApiStatusType.SERVER_ERROR.code).json({ message: 'Failed to upload file', status: ApiStatusType.SERVER_ERROR.message });
    }

    const existingAlbum = await pool.query('SELECT * FROM albums WHERE title = $1', [title]);
    if (existingAlbum.rows.length > 0) {
      await deleteCloudinaryAsset(cloud.public_id, 'image');
      return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Album with this title already exists', status: ApiStatusType.BAD_REQUEST.message });
    }

    try {
      const result = await pool.query(
        'INSERT INTO albums (title, description, thumbnail, thumbnail_public_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, description, cloud.secure_url, cloud.public_id],
      );

      const newAlbum = result.rows[0];

      await invalidateAlbumListCache();

      return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Album added successfully', status: ApiStatusType.SUCCESS.message, album: newAlbum });
    } catch (error) {
      await deleteCloudinaryAsset(cloud.public_id, 'image');
      throw error;
    }
  } finally {
    unlinkSync(file.path);
  }
});

export const addSong = TryCatch(async (_req: Request, res: Response) => {
  const file = _req.file;

  if (!file) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'File is required', status: ApiStatusType.BAD_REQUEST.message });
  }

  try {
    const { title, description, album: albumId } = songSchema.parse(_req.body);

    // Content sniff: verify the real file type, not the client-declared mimetype.
    const { mime } = await getFileType(await readFile(file.path));
    if (!mime.startsWith('audio/')) {
      return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'File is not a valid audio file', status: ApiStatusType.BAD_REQUEST.message });
    }

    const albumResult = await pool.query('SELECT * FROM albums WHERE id = $1', [albumId]);
    if (albumResult.rows.length === 0) {
      return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Album not found', status: ApiStatusType.BAD_REQUEST.message });
    }

    const albumThumbnail = albumResult.rows[0].thumbnail;

    const cloud = await cloudinary.uploader.upload(file.path, {
      folder: 'songs',
      resource_type: 'auto',
    });

    if (!cloud || !cloud.secure_url) {
      return res.status(ApiStatusType.SERVER_ERROR.code).json({ message: 'Failed to upload file', status: ApiStatusType.SERVER_ERROR.message });
    }

    try {
      const result = await pool.query(
        'INSERT INTO songs (title, description, thumbnail, audio, audio_public_id, album_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, description, albumThumbnail, cloud.secure_url, cloud.public_id, albumResult.rows[0].id],
      );

      const newSong = result.rows[0];

      await invalidateSongCache(albumResult.rows[0].id as number);

      return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Song added successfully', status: ApiStatusType.SUCCESS.message, song: newSong });
    } catch (error) {
      await deleteCloudinaryAsset(cloud.public_id, 'video');
      throw error;
    }
  } finally {
    unlinkSync(file.path);
  }
});

export const addThumbnail = TryCatch(async (_req: Request, res: Response) => {
  const file = _req.file;

  if (!file) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'File is required', status: ApiStatusType.BAD_REQUEST.message });
  }

  try {
    const songId = Number(_req.params.songId);
    if (!Number.isInteger(songId) || songId <= 0) {
      return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Invalid song id', status: ApiStatusType.BAD_REQUEST.message });
    }

    // Content sniff: verify the real file type, not the client-declared mimetype.
    const { mime } = await getFileType(await readFile(file.path));
    if (!mime.startsWith('image/')) {
      return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'File is not a valid image', status: ApiStatusType.BAD_REQUEST.message });
    }

    const song = await pool.query('SELECT * FROM songs WHERE id = $1', [songId]);
    if (song.rows.length === 0) {
      return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Song not found', status: ApiStatusType.BAD_REQUEST.message });
    }

    const cloud = await cloudinary.uploader.upload(file.path, {
      folder: 'thumbnails',
      resource_type: 'auto',
    });

    if (!cloud || !cloud.secure_url) {
      return res.status(ApiStatusType.SERVER_ERROR.code).json({ message: 'Failed to upload file', status: ApiStatusType.SERVER_ERROR.message });
    }

    const oldPublicId = song.rows[0].thumbnail_public_id;

    try {
      const result = await pool.query(
        'UPDATE songs SET thumbnail = $1, thumbnail_public_id = $2 WHERE id = $3 RETURNING *',
        [cloud.secure_url, cloud.public_id, songId],
      );

      const updatedSong = result.rows[0];

      if (!updatedSong) {
        await deleteCloudinaryAsset(cloud.public_id, 'image');
        return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Song not found', status: ApiStatusType.BAD_REQUEST.message });
      }

      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'image' });
      }

      await invalidateSongCache(undefined, songId);

      return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Thumbnail uploaded successfully', status: ApiStatusType.SUCCESS.message, thumbnailUrl: cloud.secure_url });
    } catch (error) {
      await deleteCloudinaryAsset(cloud.public_id, 'image');
      throw error;
    }
  } finally {
    unlinkSync(file.path);
  }
});

export const deleteAlbum = TryCatch(async (_req: Request, res: Response) => {
  const albumId = Number(_req.params.albumId);
  if (!Number.isInteger(albumId) || albumId <= 0) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Invalid album id', status: ApiStatusType.BAD_REQUEST.message });
  }

  const album = await pool.query('SELECT * FROM albums WHERE id = $1', [albumId]);
  if (album.rows.length === 0) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Album not found', status: ApiStatusType.BAD_REQUEST.message });
  }

  const albumThumbnailPublicId = album.rows[0].thumbnail_public_id;

  const songsResult = await pool.query(
    'SELECT audio_public_id, thumbnail_public_id FROM songs WHERE album_id = $1',
    [albumId],
  );

  await pool.query('DELETE FROM albums WHERE id = $1', [albumId]);

  const destroyJobs = [];
  if (albumThumbnailPublicId) destroyJobs.push(cloudinary.uploader.destroy(albumThumbnailPublicId, { resource_type: 'image' }));
  for (const song of songsResult.rows) {
    if (song.audio_public_id) destroyJobs.push(cloudinary.uploader.destroy(song.audio_public_id, { resource_type: 'video' }));
    if (song.thumbnail_public_id) destroyJobs.push(cloudinary.uploader.destroy(song.thumbnail_public_id, { resource_type: 'image' }));
  }
  await Promise.allSettled(destroyJobs);

  await invalidateSongCache(albumId);

  return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Album deleted successfully', status: ApiStatusType.SUCCESS.message });
});

export const deleteSong = TryCatch(async (_req: Request, res: Response) => {
  const songId = Number(_req.params.songId);
  if (!Number.isInteger(songId) || songId <= 0) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Invalid song id', status: ApiStatusType.BAD_REQUEST.message });
  }
  
  const song = await pool.query('SELECT * FROM songs WHERE id = $1', [songId]); 
  if (song.rows.length === 0) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Song not found', status: ApiStatusType.BAD_REQUEST.message });
  }

  const { audio_public_id: audioPublicId, thumbnail_public_id: thumbnailPublicId, album_id: songAlbumId } = song.rows[0];

  await pool.query('DELETE FROM songs WHERE id = $1', [songId]);

  const cleanup = [];
  if (audioPublicId) cleanup.push(cloudinary.uploader.destroy(audioPublicId, { resource_type: 'video' }));
  if (thumbnailPublicId) cleanup.push(cloudinary.uploader.destroy(thumbnailPublicId, { resource_type: 'image' }));
  await Promise.allSettled(cleanup);

  await invalidateSongCache(songAlbumId as number, songId);

  return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Song deleted successfully', status: ApiStatusType.SUCCESS.message });
});