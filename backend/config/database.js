import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: envPath });
}

const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV;

console.log('[db] DATABASE_URL:', DATABASE_URL ? 'Configurada' : 'NO CONFIGURADA');
console.log('[db] NODE_ENV:', NODE_ENV || 'sin definir');

if (!DATABASE_URL) {
  console.error('[db] ERROR: DATABASE_URL no está configurada');
  throw new Error('DATABASE_URL environment variable is required');
}

let dbHost = '';
try {
  dbHost = new URL(DATABASE_URL).hostname || '';
} catch {
  dbHost = '';
}

// Determinar si es Neon o Railway
const isNeon = /neon\.tech/i.test(dbHost);
const isRailway = /railway|rlwy\.net/i.test(dbHost);

console.log('[db] Detectado:', isNeon ? 'NEON' : isRailway ? 'RAILWAY' : 'OTRO');

let pool;

if (isNeon) {
  // NEON usa WebSocket (Neon SDK)
  console.log('[db] Usando Neon SDK (WebSocket)');

  neonConfig.wsEndpoint = (host) => `wss://${host}/sql`;
  neonConfig.webSocketConstructor = ws;

  const sql = neon(DATABASE_URL);

  const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`[db] Intento ${attempt} falló, reintentando en ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  pool = {
    query: async (text, params = []) => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout after 30s')), 30000)
        );

        const result = await Promise.race([sql(text, params), timeoutPromise]);

        return {
          rows: result,
          rowCount: result.length,
        };
      } catch (error) {
        console.error('[db] Error en la consulta Neon:', error.message);
        throw error;
      }
    },
    connect: async () =>
      retryWithBackoff(async () => {
        const result = await sql('SELECT NOW()');
        return result;
      }),
  };
} else {
  // RAILWAY usa TCP directo (pg.Pool)
  console.log('[db] Usando pg.Pool (TCP directo - Railway)');

  const sslEnabled = !/localhost|127\.0\.0\.1/i.test(dbHost);

  const pgPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
  });

  pool = {
    query: async (text, params = []) => {
      try {
        return await pgPool.query(text, params);
      } catch (error) {
        console.error('[db] Error en consulta PG:', error.message);
        throw error;
      }
    },
    connect: async () => pgPool.connect(),
  };
}

export default pool;
