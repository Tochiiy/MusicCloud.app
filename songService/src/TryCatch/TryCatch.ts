import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiStatusType } from '../Api_responseStatus/ApiStatusType.js';

export const tryCatch = (fn: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'Validation error', status: ApiStatusType.BAD_REQUEST.message, error: error.issues });
        return;
      }
      res.status(ApiStatusType.SERVER_ERROR.code).json({ message: 'Internal Server Error', status: ApiStatusType.SERVER_ERROR.message, error: error instanceof Error ? error.message : String(error) });
      return;
    }
  };
};

export { tryCatch as TryCatch };
