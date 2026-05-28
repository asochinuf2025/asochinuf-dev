import dotenv from 'dotenv';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const dbHost = (() => { try { return new URL(DATABASE_URL).hostname; } catch { return ''; } })();
const sslEnabled = !/localhost|127\.0\.0\.1/i.test(dbHost);

const pgPool = new Pool({
  connectionString: DATABASE_URL,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
});

const pool = {
  query: async (text, params = []) => {
    try {
      return await pgPool.query(text, params);
    } catch (error) {
      console.error('[db] Error en consulta:', error.message);
      throw error;
    }
  },
  connect: async () => pgPool.connect(),
};

export default pool;
