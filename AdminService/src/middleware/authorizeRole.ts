import type { Request, Response, NextFunction } from 'express';
import { ApiStatusType } from '../Api_responseStatus/ApiStatusType.js';

const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;

    if (!role || !roles.includes(role)) {
      res.status(ApiStatusType.FORBIDDEN.code).json({ status: ApiStatusType.FORBIDDEN.message, message: 'Forbidden' });
      return;
    }

    next();
  };
};

export default authorizeRole;