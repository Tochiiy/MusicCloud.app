import axios from 'axios';
import type { Request, Response, NextFunction } from 'express';
import { ApiStatusType } from '../Api_responseStatus/ApiStatusType.js';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
if (!USER_SERVICE_URL) {
  throw new Error('USER_SERVICE_URL is not set. Add it to .env');
}

const isAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization as string | undefined;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      res.status(ApiStatusType.UNAUTHORIZED.code).json({ status: ApiStatusType.UNAUTHORIZED, message: 'No token provided' });
      return;
    }

    const { data } = await axios.get(`${USER_SERVICE_URL}/api/v1/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    req.user = data.user;
    next();
  } catch (error) {
    res.status(ApiStatusType.UNAUTHORIZED.code).json({ status: ApiStatusType.UNAUTHORIZED, message: 'Invalid token' });
  }
};

export default isAuth;