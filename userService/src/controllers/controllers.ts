import { User } from '../database/model.js';
import { registerUserSchema, loginUserSchema } from '../zod_validator/validators/userValidator.js';
import { ApiStatusType } from '../Api_responseStatus/ApiStatusType.js';
import bcrypt from 'bcrypt';
import { signedToken, } from '../signedToken/jwtAuth.js';
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

export { registerUser, loginUser, myProfile }; 

