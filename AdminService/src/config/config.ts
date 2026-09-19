import { neon, Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_URL_POOLED = process.env.DATABASE_URL_POOLED;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to .env');
}

if (!DATABASE_URL_POOLED) {
  throw new Error('DATABASE_URL_POOLED is not set. Add it to .env');
}

export const db = neon(DATABASE_URL);
export const pool = new Pool({ connectionString: DATABASE_URL_POOLED });

pool.on('error', (error: unknown) => {
  console.error('Neon pool error (recovering):', error);
});

const connectDB = async () => {
  try {
    await pool.connect();
    await db`SELECT 1`;
    console.log('Connected to the database successfully');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

export default connectDB;