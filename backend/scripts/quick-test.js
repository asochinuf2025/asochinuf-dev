import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

/**
 * Script rápido para probar conexión a ambas BDs
 * Detecta automáticamente si es Neon (WebSocket) o Railway (TCP)
 *
 * Uso: node scripts/quick-test.js
 */

const NEON_URL = process.env.DATABASE_URL;
const RAILWAY_URL = process.env.RAILWAY_DATABASE_URL;

const testDatabase = async (url, name) => {
  if (!url) {
    console.log(`❌ ${name}: URL no configurada`);
    return false;
  }

  try {
    let result;
    const hostname = new URL(url).hostname || '';
    const isNeon = /neon\.tech/i.test(hostname);

    if (isNeon) {
      // NEON: usar WebSocket
      neonConfig.wsEndpoint = (host) => `wss://${host}/sql`;
      neonConfig.webSocketConstructor = ws;

      const sql = neon(url);
      result = await Promise.race([
        sql('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = $1', ['public']),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
      ]);
    } else {
      // RAILWAY: usar TCP directo
      const pgPool = new Pool({
        connectionString: url,
        ssl: false, // Deshabilitar SSL para Railway
        connectionTimeoutMillis: 15000,
      });

      const queryResult = await Promise.race([
        pgPool.query('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = $1', ['public']),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
      ]);

      result = [queryResult.rows[0]];
      await pgPool.end();
    }

    console.log(`✅ ${name}: Conectado exitosamente`);

    const tableCount = result[0].count;
    console.log(`   ${tableCount} tablas encontradas`);

    if (tableCount > 0) {
      let userCount;

      if (isNeon) {
        const sql = neon(url);
        const res = await sql('SELECT COUNT(*) as count FROM t_usuarios');
        userCount = res[0].count;
      } else {
        const pgPool = new Pool({
          connectionString: url,
          ssl: false, // Deshabilitar SSL para Railway
          connectionTimeoutMillis: 15000,
        });
        const res = await pgPool.query('SELECT COUNT(*) as count FROM t_usuarios');
        userCount = res.rows[0].count;
        await pgPool.end();
      }

      console.log(`   ${userCount} usuarios\n`);
    } else {
      console.log(`   (BD vacía)\n`);
    }

    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}\n`);
    return false;
  }
};

const main = async () => {
  console.log('═════════════════════════════════════════════');
  console.log('   PRUEBA DE CONEXIÓN: NEON vs RAILWAY');
  console.log('═════════════════════════════════════════════\n');

  const neonOk = await testDatabase(NEON_URL, 'Neon');
  const railwayOk = await testDatabase(RAILWAY_URL, 'Railway');

  console.log('═════════════════════════════════════════════');
  if (neonOk && railwayOk) {
    console.log('✅ Ambas BDs están listas para migrar');
    process.exit(0);
  } else if (neonOk) {
    console.log('⚠️  Neon OK, Railway sin conectar');
    console.log('   Si aún no creaste BD en Railway:');
    console.log('   Ejecuta: node scripts/init-db-railway.js');
    process.exit(1);
  } else if (railwayOk) {
    console.log('⚠️  Railway OK, Neon sin conectar');
    process.exit(1);
  } else {
    console.log('❌ Ninguna BD conecta');
    console.log('   Verifica .env y URLs');
    process.exit(1);
  }
};

main();
