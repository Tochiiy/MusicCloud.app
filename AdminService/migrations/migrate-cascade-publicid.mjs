import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to .env');
}

const db = neon(DATABASE_URL);

const run = async () => {
  console.log('Running migration...');

  await db`ALTER TABLE albums ADD COLUMN IF NOT EXISTS thumbnail_public_id VARCHAR(255)`;

  await db`ALTER TABLE songs ADD COLUMN IF NOT EXISTS thumbnail_public_id VARCHAR(255)`;
  await db`ALTER TABLE songs ADD COLUMN IF NOT EXISTS audio_public_id VARCHAR(255)`;

  await db`ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_album_id_fkey`;
  await db`ALTER TABLE songs ADD CONSTRAINT songs_album_id_fkey FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE`;

  const check = await db`SELECT
      column_name, data_type FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name IN ('thumbnail_public_id', 'audio_public_id')`;

  const fk = await db`SELECT
      confdeltype FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace AND conname = 'songs_album_id_fkey'`;

  console.log('songs columns:', JSON.stringify(check));
  console.log('FK delete action (should be c):', JSON.stringify(fk));
  console.log('Migration done.');
};

run().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});