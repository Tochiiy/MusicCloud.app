# MusicCloudApp Review Recommendations

This document contains recommended fixes only. No application code is changed by this document. Review each section before applying it.

## Priority Order

1. Fix the `userService` TypeScript build failure.
2. Fix deep-link song state so the player follows `/song/:id`.
3. Normalize unauthorized API response shapes.
4. Clean up Cloudinary uploads when database writes fail.
5. Improve the download flow for large audio files.
6. Add pagination when the catalog grows.
7. Rotate exposed credentials before deployment.

## 1. Fix the `userService` Build Failure

The current playlist/like toggle implementation returns a plain object type, while `sanitizeUser()` expects a Mongoose document with `toObject()`.

File: `userService/src/controllers/controllers.ts`

Replace the current `ToggleResult` and `sanitizeUser` types with:

```ts
type UserObject = Record<string, unknown>;

type UserLike = UserObject & {
  toObject?: () => UserObject;
};

const sanitizeUser = (user: UserLike): SanitizedUser => {
  const rawUser =
    typeof user.toObject === 'function'
      ? user.toObject()
      : user;

  const { password: _password, ...safeUser } = rawUser;
  return safeUser;
};
```

Update `toggleArrayField` to return a compatible type:

```ts
const toggleArrayField = async (
  userId: string,
  field: 'playlist' | 'likedSongs',
  songId: string,
): Promise<UserLike | null> => {
  return User.findOneAndUpdate(
    { _id: userId },
    [
      {
        $set: {
          [field]: {
            $cond: [
              { $in: [songId, `$${field}`] },
              { $setDifference: [`$${field}`, [songId]] },
              { $setUnion: [`$${field}`, [songId]] },
            ],
          },
        },
      },
    ],
    { new: true, updatePipeline: true } as any,
  ) as Promise<UserLike | null>;
};
```

Validation command:

```powershell
cd userService
npm run build
```

## 2. Fix Deep-Link Player State

Current risk: `fetchSongById()` can fetch a song for the song page but does not update the global player state.

File: `frontend/src/context/SongContext.tsx`

Replace `fetchSongById` with:

```tsx
const fetchSongById = useCallback(async (id: number): Promise<Song | null> => {
  const localSong = songs.find((item) => item.id === id);

  if (localSong) {
    setSong(localSong);
    setSelectedSong(localSong.id);
    return localSong;
  }

  try {
    const { data } = await axios.get<{ song: Song }>(
      `${server}/api/v1/songs/${id}`,
    );

    setSong(data.song);
    setSelectedSong(data.song.id);

    return data.song;
  } catch {
    return null;
  }
}, [songs]);
```

If `fetchSingleSong()` is still used by the player, keep it synchronized too:

```tsx
const fetchSingleSong = useCallback(async (id: number): Promise<Song | null> => {
  const selected =
    songs.find((item) => item.id === id) ??
    (song?.id === id ? song : null);

  setSong(selected);
  setSelectedSong(selected?.id ?? null);

  return selected;
}, [song, songs]);
```

Validation command:

```powershell
cd frontend
npm run build
npm run lint
```

## 3. Normalize Unauthorized Responses

Current risk: some auth middleware responses return the entire status object instead of the status message string.

Current pattern to replace:

```ts
status: ApiStatusType.UNAUTHORIZED
```

Recommended pattern:

```ts
status: ApiStatusType.UNAUTHORIZED.message
```

Apply this in:

- `userService/src/middleware/isAuth.ts`
- `AdminService/src/middleware/isAuth.ts`
- `AdminService/src/middleware/authorizeRole.ts`

Expected response shape:

```json
{
  "status": "Unauthorized",
  "message": "Invalid token"
}
```

## 4. Clean Up Failed Cloudinary Uploads

Current risk: Cloudinary upload succeeds, but the database insert fails. The uploaded file then remains unused in Cloudinary.

File: `AdminService/src/controllers/adminController.ts`

Add a helper:

```ts
async function deleteCloudinaryAsset(
  publicId: string | undefined,
  resourceType: 'image' | 'video',
): Promise<void> {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error('Failed to clean up Cloudinary asset:', error);
  }
}
```

Protect the album database insert:

```ts
const cloud = await cloudinary.uploader.upload(file.path, {
  folder: 'albums',
  resource_type: 'auto',
});

try {
  const result = await pool.query(
    `INSERT INTO albums
      (title, description, thumbnail, thumbnail_public_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, cloud.secure_url, cloud.public_id],
  );

  await invalidateAlbumListCache();

  return res.status(ApiStatusType.SUCCESS.code).json({
    message: 'Album added successfully',
    status: ApiStatusType.SUCCESS.message,
    album: result.rows[0],
  });
} catch (error) {
  await deleteCloudinaryAsset(cloud.public_id, 'image');
  throw error;
}
```

Apply the same cleanup pattern to song uploads. For thumbnail replacement, delete the newly uploaded asset if the database update fails.

## 5. Download Optimization

### Current situation

The backend already streams audio correctly:

```ts
Readable.fromWeb(
  remote.body as import('node:stream/web').ReadableStream
).pipe(res);
```

The frontend currently loads the entire audio response into memory:

```ts
const blob = await response.blob();
```

For large files, this increases browser memory usage and delays downloads.

### Recommended frontend helper

Create:

File: `frontend/src/utils/downloadSong.ts`

```ts
const server =
  import.meta.env.VITE_SONG_SERVER_URL || 'http://localhost:8000';

export function downloadSong(songId: number): void {
  const link = document.createElement('a');

  link.href = `${server}/api/v1/songs/${songId}/download`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  document.body.appendChild(link);
  link.click();
  link.remove();
}
```

Then replace repeated `fetch`, `blob`, and `URL.createObjectURL` blocks in:

- `frontend/src/components/SongCard.tsx`
- `frontend/src/pages/Song.tsx`
- `frontend/src/pages/Album.tsx`
- `frontend/src/pages/PlayList.tsx`
- `frontend/src/pages/LikedSongs.tsx`

Use:

```tsx
import { downloadSong } from '../utils/downloadSong';
```

Then:

```tsx
const handleDownload = () => {
  downloadSong(song.id);
};
```

Keep the download endpoint public if public downloads are intended. If authentication is added to the endpoint, use an authenticated `fetch` or Axios request instead of a direct anchor because the anchor will not include the Bearer token.

### Optional backend stream handling

For stronger stream error handling:

```ts
import { pipeline } from 'node:stream/promises';
```

Then:

```ts
try {
  await pipeline(
    Readable.fromWeb(
      remote.body as import('node:stream/web').ReadableStream,
    ),
    res,
  );
} catch (error) {
  console.error('Audio stream failed:', error);

  if (!res.headersSent) {
    res.status(ApiStatusType.SERVER_ERROR.code).json({
      message: 'Failed to stream audio',
      status: ApiStatusType.SERVER_ERROR.message,
    });
  }
}
```

## 6. Pagination Later

The song service now selects explicit columns, which is good. However, these endpoints still return the entire catalog:

- `GET /api/v1/songs`
- `GET /api/v1/albums`
- `GET /api/v1/admin/users`

When the catalog grows, add pagination or cursor-based loading to reduce:

- Response payload size
- Database work
- Frontend rendering work
- Initial page load time

This should be a later API change because it affects both backend and frontend contracts.

## 7. Security Before Deployment

Rotate any credentials that have been exposed during development, including:

- MongoDB credentials
- Cloudinary API credentials
- JWT secrets
- Upstash Redis tokens

Keep `.env` files ignored and provide safe `.env.example` files containing placeholders only.

## Current Validation Status

At the time of this review:

- AdminService build passed.
- songService build passed.
- Frontend build passed.
- Frontend lint passed.
- userService build failed because of the `IUser` / `sanitizeUser` type mismatch described in section 1.

Do not apply all recommendations at once. Apply section 1 first, run its build, and then review the next change separately.
