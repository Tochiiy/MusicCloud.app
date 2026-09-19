import express from 'express';
import dotenv from 'dotenv';
import type { ErrorRequestHandler } from 'express';
import cors from 'cors';
import connectDB from './config/config.js';
import routes from './routes/routes.js';
import swaggerSpec from './config/swagger.js';
import swaggerUi from 'swagger-ui-express';
import { ApiStatusType } from './Api_responseStatus/ApiStatusType.js';
import { startApiHealthCheck } from './cron_jobs/apiCheck.js';
import redis from './config/redis.js';

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

app.use('/api/v1', routes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => {
  res.send('Health check passed');
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  return res.status(ApiStatusType.SERVER_ERROR.code).json({ message: 'Internal Server Error', status: ApiStatusType.SERVER_ERROR.message });
};

app.use(errorHandler);

connectDB();
startApiHealthCheck();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Song service running on port ${PORT}`);
});