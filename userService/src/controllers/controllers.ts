import { User, BlacklistedToken } from '../database/model.js';
import { registerUserSchema, loginUserSchema } from '../zod_validator/validators/userValidator.js';
import { ApiStatusType } from '../Api_responseStatus/ApiStatusType.js';
import bcrypt from 'bcrypt';
import { signedToken, verifyToken } from '../signedToken/jwtAuth.js';
import { tryCatch as TryCatch } from '../TryCatch.ts/TryCatch.js';
import type { Request, Response } from 'express';

const registerUser = TryCatch(async (_req: Request, res: Response) => {
  // Implement user registration logic here

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

  const token = signedToken({ _id: newUser._id.toString() });

  const { password: _password, ...userWithoutPassword } = newUser.toObject();

  return res.status(ApiStatusType.SUCCESS.code).json({ message: 'User registered successfully', status: ApiStatusType.SUCCESS.message, token, user: userWithoutPassword });
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

  const { password: _password, ...userWithoutPassword } = user.toObject();

  return res.status(ApiStatusType.SUCCESS.code).json({ message: 'User logged in successfully', status: ApiStatusType.SUCCESS.message, token, user: userWithoutPassword });
});




const myProfile = TryCatch(async (_req: Request, res: Response) => {
    const userInfo = _req.user;
    const userId = typeof userInfo === 'object' && userInfo !== null ? (userInfo as { _id?: unknown })._id as string | undefined : undefined;

    if (!userId) {
      return res.status(ApiStatusType.UNAUTHORIZED.code).json({ message: 'Unauthorized', status: ApiStatusType.UNAUTHORIZED.message });
    }
  
    const user = await User.findById(userId);
  
    if (!user) {
      return res.status(ApiStatusType.NOT_FOUND.code).json({ message: 'User not found', status: ApiStatusType.NOT_FOUND.message });
    }

    const { password: _password, ...userWithoutPassword } = user.toObject();
  
    return res.status(ApiStatusType.SUCCESS.code).json({ message: 'User profile retrieved successfully', status: ApiStatusType.SUCCESS.message, user: userWithoutPassword });
  });

  const addToPlayList = TryCatch(async (_req: Request, res: Response) => {
    const userId = typeof _req.user === 'object' && _req.user !== null ? (_req.user as { _id?: string })._id : undefined;

    if (!userId) {
      return res.status(ApiStatusType.UNAUTHORIZED.code).json({ message: 'Unauthorized', status: ApiStatusType.UNAUTHORIZED.message });
    }

    const songId = _req.body?.id as string | undefined;
    if (!songId) {
      return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Song id is required', status: ApiStatusType.BAD_REQUEST.message });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(ApiStatusType.NOT_FOUND.code).json({ message: 'User not found', status: ApiStatusType.NOT_FOUND.message });
    }

    const index = user.playlist.indexOf(songId);
    let message = 'Song added to playlist successfully';
    if (index !== -1) {
      user.playlist.splice(index, 1);
      message = 'Song removed from playlist successfully';
    } else {
      user.playlist.push(songId);
    }

    await user.save();

    const { password: _password, ...userWithoutPassword } = user.toObject();
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

  const user = await User.findById(userId);
  if (!user) {
    return res.status(ApiStatusType.NOT_FOUND.code).json({ message: 'User not found', status: ApiStatusType.NOT_FOUND.message });
  }

  const index = user.likedSongs.indexOf(songId);
  let message = 'Song liked successfully';
  if (index !== -1) {
    user.likedSongs.splice(index, 1);
    message = 'Song unliked successfully';
  } else {
    user.likedSongs.push(songId);
  }

  await user.save();

  const { password: _password, ...userWithoutPassword } = user.toObject();
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

  const users = await User.find({ likedSongs: { $exists: true, $ne: [] } }).select('likedSongs');

  const counts: Record<string, number> = {};
  for (const user of users) {
    for (const songId of user.likedSongs ?? []) {
      counts[songId] = (counts[songId] ?? 0) + 1;
    }
  }

  const likes = Object.entries(counts)
    .map(([songId, count]) => ({ songId, count }))
    .sort((a, b) => b.count - a.count);

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

  const users = await User.find().select('-password').sort({ createdAt: -1 });

  return res.status(ApiStatusType.SUCCESS.code).json({ message: 'Users retrieved successfully', status: ApiStatusType.SUCCESS.message, users });
});

const logoutUser = TryCatch(async (_req: Request, res: Response) => {
    const authHeader = _req.headers.authorization as string | undefined;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      return res.status(ApiStatusType.UNAUTHORIZED.code).json({ message: 'No token provided', status: ApiStatusType.UNAUTHORIZED.message });
    }

    const decoded = verifyToken(token) as { exp?: number } | string | undefined;
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

