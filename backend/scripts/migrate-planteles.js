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
 * Script para migrar planteles desde Neon a Railway
 * También agrega las columnas ciudad y region a Railway
 */

const NEON_URL = process.env.DATABASE_URL;
const RAILWAY_URL = process.env.RAILWAY_DATABASE_URL;

if (!NEON_URL || !RAILWAY_URL) {
  console.error('❌ Faltan URLs en .env');
  process.exit(1);
}

// Conectar a Neon (WebSocket)
neonConfig.wsEndpoint = (host) => `wss://${host}/sql`;
neonConfig.webSocketConstructor = ws;
const neonSql = neon(NEON_URL);

// Conectar a Railway (TCP)
const railwayPool = new Pool({
  connectionString: RAILWAY_URL,
  ssl: false,
  connectionTimeoutMillis: 15000,
});

(async () => {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('   MIGRANDO PLANTELES: NEON → RAILWAY');
    console.log('═══════════════════════════════════════════\n');

    // 1. Agregar columnas a Railway si no existen
    console.log('1️⃣  Agregando columnas ciudad y region...');
    try {
      await railwayPool.query('ALTER TABLE t_planteles ADD COLUMN ciudad VARCHAR(100)');
      console.log('   ✓ Columna ciudad agregada');
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.log('   ✓ Columna ciudad ya existe');
      }
    }

    try {
      await railwayPool.query('ALTER TABLE t_planteles ADD COLUMN region VARCHAR(100)');
      console.log('   ✓ Columna region agregada\n');
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.log('   ✓ Columna region ya existe\n');
      }
    }

    // 2. Obtener planteles desde Neon
    console.log('2️⃣  Obteniendo planteles desde Neon...');
    const planteles = await neonSql('SELECT * FROM t_planteles');
    console.log(`   ✓ ${planteles.length} planteles encontrados\n`);

    // 3. Remover constraint de division para migración
    console.log('3️⃣  Removiendo constraint de division...');
    try {
      await railwayPool.query('ALTER TABLE t_planteles DROP CONSTRAINT t_planteles_division_check');
      console.log('   ✓ Constraint removido\n');
    } catch (e) {
      console.log('   ⚠️  Constraint no encontrado\n');
    }

    // 4. Limpiar planteles en Railway
    console.log('4️⃣  Limpiando planteles existentes en Railway...');
    await railwayPool.query('DELETE FROM t_planteles');
    console.log('   ✓ Planteles eliminados\n');

    // 5. Insertar planteles en Railway
    console.log('5️⃣  Insertando planteles...');
    for (const plantel of planteles) {
      await railwayPool.query(
        `INSERT INTO t_planteles (id, nombre, division, ciudad, region, activo, fecha_creacion, usuario_creacion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          plantel.id,
          plantel.nombre,
          plantel.division,
          plantel.ciudad || null,
          plantel.region || null,
          plantel.activo,
          plantel.fecha_creacion,
          plantel.usuario_creacion || null
        ]
      );
    }
    console.log(`   ✓ ${planteles.length} planteles insertados\n`);

    // 6. Resetear secuencia
    console.log('6️⃣  Reseteando secuencia...');
    const maxId = await railwayPool.query('SELECT MAX(id) FROM t_planteles');
    const newSeq = (maxId.rows[0].max || 0) + 1;
    await railwayPool.query(`SELECT setval('t_planteles_id_seq', ${newSeq})`);
    console.log('   ✓ Secuencia reseteada\n');

    console.log('═══════════════════════════════════════════');
    console.log('✅ PLANTELES MIGRADOS EXITOSAMENTE');
    console.log('═══════════════════════════════════════════\n');

    await railwayPool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await railwayPool.end();
    process.exit(1);
  }
})();
