import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

process.env.USE_PG_POOL = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

console.log('[init-db.railway] Ejecutando init-db con cliente pg...');

const run = async () => {
  await import('./init-db.js');
};

run();
