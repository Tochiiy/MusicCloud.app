import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError } from 'zod';

export const tryCatch = (fn: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: 'Validation error', status: 'Bad Request', error: error.issues });
        return;
      }
      res.status(500).json({ message: 'Internal Server Error', error: error instanceof Error ? error.message : String(error) });
      return;
    }
  };
};