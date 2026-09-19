import { db, pool } from '../config/config.js';

export { db, pool };

const createSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS albums(
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      thumbnail VARCHAR(255) NOT NULL,
      thumbnail_public_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS songs(
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      thumbnail VARCHAR(255) NOT NULL,
      thumbnail_public_id VARCHAR(255),
      audio VARCHAR(255) NOT NULL,
      audio_public_id VARCHAR(255),
      album_id INT REFERENCES albums(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export default createSchema;

// Write your query functions here
// export const createAdmin = async (data) => { ... };
// export const findAdminByEmail = async (email: string) => { ... };
// export const findAdminById = async (id: string) => { ... };