# Frontend API Contract

This file describes the real request and response contract used by the current backend services.

## Required frontend packages

Install these in the frontend app:

```bash
npm install axios
```

Optional if using FormData uploads:

```bash
npm install form-data
```

## Base URLs

- Song service: http://localhost:8000/api/v1
- Admin service: http://localhost:7000/api/v1/admin
- User service: http://localhost:6100/api/v1

## Auth header

Use this header for protected admin and user routes:

```http
Authorization: Bearer <token>
```

# Song Service Endpoints

## 1) GET /songs

Fetch all songs.

### Response example

```json
{
  "message": "Songs fetched successfully",
  "status": "Success",
  "songs": [
    {
      "id": 1,
      "title": "E2E Song",
      "description": "audio test",
      "thumbnail": "https://res.cloudinary.com/.../thumbnails/....png",
      "audio": "https://res.cloudinary.com/.../songs/...wav",
      "album_id": 1,
      "created_at": "2026-09-18T23:39:42.501Z",
      "thumbnail_public_id": null,
      "audio_public_id": null
    }
  ]
}
```

## 2) GET /albums

Fetch all albums.

### Response example

```json
{
  "message": "Albums fetched successfully",
  "status": "Success",
  "albums": [
    {
      "id": 1,
      "title": "E2E Album 053928",
      "description": "created by e2e",
      "thumbnail": "https://res.cloudinary.com/.../albums/...png",
      "created_at": "2026-09-18T23:39:31.068Z",
      "thumbnail_public_id": null
    }
  ]
}
```

## 3) GET /albums/:albumId/songs

Fetch all songs for a specific album.

### Path params

- albumId: number

### Response example

```json
{
  "message": "Songs fetched successfully",
  "status": "Success",
  "songs": [
    {
      "id": 1,
      "title": "E2E Song",
      "description": "audio test",
      "thumbnail": "https://res.cloudinary.com/...",
      "audio": "https://res.cloudinary.com/...",
      "album_id": 1,
      "created_at": "2026-09-18T23:39:42.501Z",
      "thumbnail_public_id": null,
      "audio_public_id": null
    }
  ]
}
```

## 4) GET /songs/:songId

Fetch a single song by id.

### Path params

- songId: number

### Response example

```json
{
  "message": "Song fetched successfully",
  "status": "Success",
  "song": {
    "id": 1,
    "title": "E2E Song",
    "description": "audio test",
    "thumbnail": "https://res.cloudinary.com/...",
    "audio": "https://res.cloudinary.com/...",
    "album_id": 1,
    "created_at": "2026-09-18T23:39:42.501Z",
    "thumbnail_public_id": null,
    "audio_public_id": null
  }
}
```

## 4b) GET /songs/:songId/download

Streams the song's audio file through the backend, so the browser can download it without hitting the media host's CORS rules.

### Path params

- songId: number

### Response

The raw audio bytes with:

```http
Content-Type: audio/mpeg
Content-Disposition: attachment; filename="<title>.mp3"
```

Supports byte ranges (`Range`/206) for seeking.

# Admin Service Endpoints

All admin endpoints require login + admin role.

## 5) POST /album/new

Create a new album.

### Headers

```http
Authorization: Bearer <token>
```

### Request type

multipart/form-data

### Fields

- file: image file
- title: string
- description: string

### Response example

```json
{
  "message": "Album added successfully",
  "status": "Success",
  "album": {
    "id": 1,
    "title": "My Album",
    "description": "Album description",
    "thumbnail": "https://res.cloudinary.com/...",
    "thumbnail_public_id": "...",
    "created_at": "2026-09-18T00:00:00.000Z"
  }
}
```

## 6) POST /song/new

Create a new song.

### Headers

```http
Authorization: Bearer <token>
```

### Request type

multipart/form-data

### Fields

- file: audio file
- title: string
- description: string
- album: number

### Response example

```json
{
  "message": "Song added successfully",
  "status": "Success",
  "song": {
    "id": 1,
    "title": "My Song",
    "description": "Song description",
    "thumbnail": "https://res.cloudinary.com/...",
    "audio": "https://res.cloudinary.com/...",
    "album_id": 1,
    "created_at": "2026-09-18T00:00:00.000Z",
    "thumbnail_public_id": null,
    "audio_public_id": "..."
  }
}
```

## 7) POST /song/thumbnail/:songId

Upload a new thumbnail for a song.

### Headers

```http
Authorization: Bearer <token>
```

### Path params

- songId: number

### Request type

multipart/form-data

### Fields

- file: image file

### Response example

```json
{
  "message": "Thumbnail uploaded successfully",
  "status": "Success",
  "thumbnailUrl": "https://res.cloudinary.com/..."
}
```

## 8) DELETE /album/:albumId

Delete an album and all associated uploaded files.

### Headers

```http
Authorization: Bearer <token>
```

### Path params

- albumId: number

### Response example

```json
{
  "message": "Album deleted successfully",
  "status": "Success"
}
```

## 9) DELETE /song/:songId

Delete a song and all associated uploaded files.

### Headers

```http
Authorization: Bearer <token>
```

### Path params

- songId: number

### Response example

```json
{
  "message": "Song deleted successfully",
  "status": "Success"
}
```

## 10) GET /users

List all registered users (admin only). Admin service proxies to the user service.

### Headers

```http
Authorization: Bearer <token>
```

### Response example

```json
{
  "message": "Users retrieved successfully",
  "status": "Success",
  "users": [
    {
      "_id": "65f...",
      "name": "Mary",
      "email": "mary@musiccloud.app",
      "role": "admin",
      "playlist": [],
      "createdAt": "2026-09-18T00:00:00.000Z"
    }
  ]
}
```

# User Service Endpoints

## 11) POST /user/register

Register a user.

### Request body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Response example

```json
{
  "message": "User registered successfully",
  "status": "Success",
  "token": "<jwt>",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "playlist": []
  }
}
```

## 12) POST /user/login

Login a user.

### Request body

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Response example

```json
{
  "message": "User logged in successfully",
  "status": "Success",
  "token": "<jwt>",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "playlist": []
  }
}
```

## 13) GET /user/profile

Fetch the current logged-in user profile.

### Headers

```http
Authorization: Bearer <token>
```

### Response example

```json
{
  "message": "User profile retrieved successfully",
  "status": "Success",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "playlist": []
  }
}
```

## 14) POST /user/playlist

Toggle a song in the logged-in user's playlist. If the song id is already in the playlist it is removed, otherwise it is added.

### Headers

```http
Authorization: Bearer <token>
```

### Request body

```json
{
  "id": "42"
}
```

### Response example

```json
{
  "message": "Song added to playlist successfully",
  "status": "Success",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "playlist": ["42"]
  }
}
```

Removing again responds with `"message": "Song removed from playlist successfully"`.

## 14b) POST /user/like

Toggle a like (love) on a song for the logged-in user. If the song id is already liked it is unliked, otherwise it is liked.

### Headers

```http
Authorization: Bearer <token>
```

### Request body

```json
{
  "id": "42"
}
```

### Response example

```json
{
  "message": "Song liked successfully",
  "status": "Success",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "playlist": ["42"],
    "likedSongs": ["42"]
  }
}
```

Unliking again responds with `"message": "Song unliked successfully"`. The user object returned always reflects the new `likedSongs` state, so the frontend stores it directly.

## 14c) GET /user/likes/summary

Admin-only. Returns the number of users who liked each song, ranked by count descending.

### Headers

```http
Authorization: Bearer <token>
```

### Response example

```json
{
  "message": "Likes summary retrieved successfully",
  "status": "Success",
  "likes": [
    {
      "songId": "42",
      "count": 3
    },
    {
      "songId": "12",
      "count": 1
    }
  ]
}
```

Non-admin callers get `403`. Joining the `songId` values with the song service's song list is done client-side to render titles.

## 15) POST /user/logout

Log out the current user and revoke the token server-side. The token is blacklisted until its natural expiry, after which it is dropped from the database. The frontend still clears `localStorage` afterwards as a fallback.

### Headers

```http
Authorization: Bearer <token>
```

### Response example

```json
{
  "message": "User logged out successfully",
  "status": "Success"
}
```

# Frontend integration notes

- Song read endpoints are live and working.
- All services now allow browser requests through CORS.
- Admin write routes require a valid JWT and admin role.
- File upload endpoints must use multipart/form-data.
- Song and album responses already contain the exact fields needed by a music frontend.
- The backend returns Cloudinary URLs directly, so the frontend can render media without extra processing.
