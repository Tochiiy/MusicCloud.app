import { User, BlacklistedToken } from '../database/model.js';
import { registerUserSchema, loginUserSchema } from '../zod_validator/validators/userValidator.js';
import { ApiStatusType } from '../Api_responseStatus/ApiStatusType.js';
import bcrypt from 'bcrypt';
import { signedToken, verifyToken } from '../signedToken/jwtAuth.js';
import { tryCatch as TryCatch } from '../TryCatch.ts/TryCatch.js';
import { cacheGet, cacheSet, cacheDel, userProfileKey, usersListKey } from '../config/redis.js';
import type { Request, Response } from 'express';

type SanitizedUser = Record<string, unknown>;

interface ToggleResult {
  playlist?: string[];
  likedSongs?: string[];
  name?: string;
  email?: string;
  role?: string;
  _id?: string;
  password?: string;
  toObject: () => Record<string, unknown>;
}

const sanitizeUser = (user: { toObject: () => Record<string, unknown> }): SanitizedUser => {
  const { password: _password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

const registerUser = TryCatch(async (_req: Request, res: Response) => {
  const { name, email, password } = registerUserSchema.parse(_req.body);

  const user = await User.findOne({ email });

  if (user) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'User already exists', status: ApiStatusType.BAD_REQUEST.message });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save();
  } catch (error) {
    const mongoError = error as { code?: number };
    if (mongoError?.code === 11000) {
      return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'User already exists', status: ApiStatusType.BAD_REQUEST.message });
    }
    throw error;
  }

  await cacheDel(usersListKey);

  const token = signedToken({ _id: newUser._id.toString() });

  const userWithoutPassword = sanitizeUser(newUser);

  return res.status(ApiStatusType.CREATED.code).json({ message: 'User registered successfully', status: ApiStatusType.CREATED.message, token, user: userWithoutPassword });
});

const loginUser = TryCatch(async (_req: Request, res: Response) => {
  const { email, password } = loginUserSchema.parse(_req.body);

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'User not found', status: ApiStatusType.BAD_REQUEST.message });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Invalid password', status: ApiStatusType.BAD_REQUEST.message });
  }

  const token = signedToken({ _id: user._id.toString() });

  const userWithoutPassword = sanitizeUser(user);

  return res.status(ApiStatusType.SUCCESS.code).json({ message: 'User logged in successfully', status: ApiStatusType.SUCCESS.message, token, user: userWithoutPassword });
});

const myProfile = TryCatch(async (_req: Request, res: Response) => {
    const userInfo = _req.user;
    const userId = typeof userInfo === 'object' && userInfo !== null ? (userInfo as { _id?: unknown })._id as string | undefined : undefined;

    if (!userId) {
      return res.status(ApiStatusType.UNAUTHORIZED.code).json({ message: 'Unauthorized', status: ApiStatusType.UNAUTHORIZED.message });
    }

    const cacheKey = userProfileKey(userId);
    const cached = await cacheGet<SanitizedUser>(cacheKey);
    if (cached) {
      return res.status(ApiStatusType.SUCCESS.code).json({ message: 'User profile retrieved successfully', status: ApiStatusType.SUCCESS.message, user: cached });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(ApiStatusType.NOT_FOUND.code).json({ message: 'User not found', status: ApiStatusType.NOT_FOUND.message });
    }

    const userWithoutPassword = sanitizeUser(user);
    await cacheSet(cacheKey, userWithoutPassword);

    return res.status(ApiStatusType.SUCCESS.code).json({ message: 'User profile retrieved successfully', status: ApiStatusType.SUCCESS.message, user: userWithoutPassword });
  });

// Atomically toggles a string membership array (playlist | likedSongs) using an
// aggregation pipeline update on a single document. This avoids the read-modify-write
// race that could previously leave duplicate ids when two requests hit at once.
const toggleArrayField = async (userId: string, field: 'playlist' | 'likedSongs', songId: string) => {
  const updatedUser = (await User.findOneAndUpdate(
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
    ] as any,
    { new: true, updatePipeline: true } as any,
  )) as ToggleResult | null;
  return updatedUser;
};

const addToPlayList = TryCatch(async (_req: Request, res: Response) => {
    const userId = typeof _req.user === 'object' && _req.user !== null ? (_req.user as { _id?: string })._id : undefined;

    if (!userId) {
      return res.status(ApiStatusType.UNAUTHORIZED.code).json({ message: 'Unauthorized', status: ApiStatusType.UNAUTHORIZED.message });
    }

    const songId = _req.body?.id as string | undefined;
    if (!songId) {
      return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Song id is required', status: ApiStatusType.BAD_REQUEST.message });
    }

    const updatedUser = await toggleArrayField(userId, 'playlist', songId);
    if (!updatedUser) {
      return res.status(ApiStatusType.NOT_FOUND.code).json({ message: 'User not found', status: ApiStatusType.NOT_FOUND.message });
    }

    await cacheDel(userProfileKey(userId), usersListKey);

    const isSaved = (updatedUser.playlist ?? []).includes(songId);
    const message = isSaved ? 'Song added to playlist successfully' : 'Song removed from playlist successfully';

    const userWithoutPassword = sanitizeUser(updatedUser);
    return res.status(ApiStatusType.SUCCESS.code).json({ message, status: ApiStatusType.SUCCESS.message, user: userWithoutPassword });
  });

const toggleLike = TryCatch(async (_req: Request, res: Response) => {
  const userId = typeof _req.user === 'object' && _req.user !== null ? (_req.user as { _id?: string })._id : undefined;

  if (!userId) {
    return res.status(ApiStatusType.UNAUTHORIZED.code).json({ message: 'Unauthorized', status: ApiStatusType.UNAUTHORIZED.message });
  }

  const songId = _req.body?.id as string | undefined;
  if (!songId) {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Song id is required', status: ApiStatusType.BAD_REQUEST.message });
  }

  const updatedUser = await toggleArrayField(userId, 'likedSongs', songId);
  if (!updatedUser) {
    return res.status(ApiStatusType.NOT_FOUND.code).json({ message: 'User not found', status: ApiStatusType.NOT_FOUND.message });
  }

  await cacheDel(userProfileKey(userId), usersListKey);

  const isLiked = (updatedUser.likedSongs ?? []).includes(songId);
  const message = isLiked ? 'Song liked successfully' : 'Song unliked successfully';

  const userWithoutPassword = sanitizeUser(updatedUser);
  return res.status(ApiStatusType.SUCCESS.code).json({ message, status: ApiStatusType.SUCCESS.message, user: userWithoutPassword });
});

const getLikesSummary = TryCatch(async (_req: Request, res: Response) => {
  const userInfo = _req.user;
  const userId = typeof userInfo === 'object' && userInfo !== null ? (userInfo as { _id?: unknown })._id as string | undefined : undefined;

  if (!userId) {
    return res.status(ApiStatusType.UNAUTHORIZED.code).json({ message: 'Unauthorized', status: ApiStatusType.UNAUTHORIZED.message });
  }

  const requester = await User.findById(userId);
  if (!requester || requester.role !== 'admin') {
    return res.status(ApiStatusType.FORBIDDEN.code).json({ message: 'Forbidden', status: ApiStatusType.FORBIDDEN.message });
  }

  // Aggregation pipeline: unwind + group avoids loading every user into memory
  // and computes per-song counts directly on the server.
  const rows = await User.aggregate<{ _id: string; count: number }>([
    { $match: { likedSongs: { $exists: true, $ne: [] } } },
    { $unwind: '$likedSongs' },
    { $group: { _id: '$likedSongs', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const likes = rows.map((row) => ({ songId: row._id, count: row.count }));

  return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Likes summary retrieved successfully', status: ApiStatusType.SUCCESS.message, likes });
});

const getAllUsers = TryCatch(async (_req: Request, res: Response) => {
  const userInfo = _req.user;
  const userId = typeof userInfo === 'object' && userInfo !== null ? (userInfo as { _id?: unknown })._id as string | undefined : undefined;

  if (!userId) {
    return res.status(ApiStatusType.UNAUTHORIZED.code).json({ message: 'Unauthorized', status: ApiStatusType.UNAUTHORIZED.message });
  }

  const requester = await User.findById(userId);
  if (!requester || requester.role !== 'admin') {
    return res.status(ApiStatusType.FORBIDDEN.code).json({ message: 'Forbidden', status: ApiStatusType.FORBIDDEN.message });
  }

  const cached = await cacheGet<SanitizedUser[]>(usersListKey);
  if (cached) {
    return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Users retrieved successfully', status: ApiStatusType.SUCCESS.message, users: cached });
  }

  const users = await User.find().select('-password').sort({ createdAt: -1 });
  await cacheSet(usersListKey, users);

  return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Users retrieved successfully', status: ApiStatusType.SUCCESS.message, users });
});

const logoutUser = TryCatch(async (_req: Request, res: Response) => {
    const authHeader = _req.headers.authorization as string | undefined;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      return res.status(ApiStatusType.UNAUTHORIZED.code).json({ message: 'No token provided', status: ApiStatusType.UNAUTHORIZED.message });
    }

    let decoded: string | { exp?: number } | null = null;
    try {
      decoded = verifyToken(token) as string | { exp?: number };
    } catch {
      return res.status(ApiStatusType.UNAUTHORIZED.code).json({ message: 'Invalid or expired token', status: ApiStatusType.UNAUTHORIZED.message });
    }

    const expiresAt = typeof decoded === 'object' && decoded !== null && typeof decoded.exp === 'number'
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    try {
      await BlacklistedToken.create({ token, expiresAt });
    } catch (error) {
      const mongoError = error as { code?: number };
      if (mongoError?.code === 11000) {
        return res.status(ApiStatusType.SUCCESS.code).json({ message: 'User logged out successfully', status: ApiStatusType.SUCCESS.message });
      }
      throw error;
    }

    return res.status(ApiStatusType.SUCCESS.code).json({ message: 'User logged out successfully', status: ApiStatusType.SUCCESS.message });
  });

export { registerUser, loginUser, addToPlayList, toggleLike, getLikesSummary, getAllUsers, logoutUser, myProfile };