import express from 'express';
import dotenv from 'dotenv';
import type { ErrorRequestHandler } from 'express';
import cors from 'cors';
import connectDB from './config/config.js';
import createSchema from './database/adminModel.js';
import { startApiHealthCheck } from './cron_jobs/apiCheck.js';
import adminRoutes from './routes/adminRoutes.js';
import swaggerSpec from './config/swagger.js';
import swaggerUi from 'swagger-ui-express';
import { ApiStatusType } from './Api_responseStatus/ApiStatusType.js';

dotenv.config();

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception (recovering):', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection (recovering):', reason);
});

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api/v1/admin', adminRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => {
  res.send('Health check passed');
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const code = (err as { code?: string })?.code;
  if (code === 'LIMIT_FILE_SIZE') {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message: 'File too large', status: ApiStatusType.BAD_REQUEST.message });
  }
  const message = err instanceof Error ? err.message : String(err);
  if (message === 'Only audio and image files are allowed') {
    return res.status(ApiStatusType.BAD_REQUEST.code).json({ message, status: ApiStatusType.BAD_REQUEST.message });
  }
  console.error(err);
  return res.status(ApiStatusType.SERVER_ERROR.code).json({ message: 'Internal Server Error', status: ApiStatusType.SERVER_ERROR.message });
};

app.use(errorHandler);

connectDB().then(() => {
  createSchema();
}).catch((error) => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
startApiHealthCheck();

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`);
});