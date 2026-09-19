import multer from 'multer';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import type { Request } from 'express';

const UPLOAD_DIR = path.resolve('uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (/^(audio\/|image\/)/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio and image files are allowed'));
  }
};

const uploadFile = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
}).single('file');

export default uploadFile;