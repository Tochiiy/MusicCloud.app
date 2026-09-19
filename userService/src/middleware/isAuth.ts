import { verifyToken } from '../signedToken/jwtAuth.js';
import type { Request, Response, NextFunction } from 'express';
import { ApiStatusType } from '../Api_responseStatus/ApiStatusType.js';

const isAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization as string | undefined;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      res.status(ApiStatusType.UNAUTHORIZED.code).json({ status: ApiStatusType.UNAUTHORIZED, message: 'No token provided' });
      return;
    }

    req.user = verifyToken(token);
    next();
  } catch (error) {
    res.status(ApiStatusType.UNAUTHORIZED.code).json({ status: ApiStatusType.UNAUTHORIZED, message: 'Invalid token' });
  }
};

export default isAuth;