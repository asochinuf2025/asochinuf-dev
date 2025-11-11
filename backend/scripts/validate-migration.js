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
 * Script para validar la migración Neon → Railway
 *
 * Compara el total de registros en ambas BDs
 *
 * INSTRUCCIONES:
 * 1. Asegurate que ambas URLs están en .env
 * 2. Ejecuta: node scripts/validate-migration.js
 */

const NEON_URL = process.env.DATABASE_URL;
const RAILWAY_URL = process.env.RAILWAY_DATABASE_URL;

if (!NEON_URL || !RAILWAY_URL) {
  console.error('❌ ERROR: Faltan variables de entorno');
  console.error('Necesitas en .env:');
  console.error('  - DATABASE_URL (Neon)');
  console.error('  - RAILWAY_DATABASE_URL (Railway)');
  process.exit(1);
}

let neonPool;
let railwayPool;

const connect = async () => {
  console.log('🔌 Conectando a las bases de datos...\n');

  try {
    neonPool = new Pool({
      connectionString: NEON_URL,
      ssl: { rejectUnauthorized: false },
    });

    railwayPool = new Pool({
      connectionString: RAILWAY_URL,
      ssl: { rejectUnauthorized: false },
    });

    await neonPool.query('SELECT NOW()');
    await railwayPool.query('SELECT NOW()');

    console.log('✓ Conectado a Neon');
    console.log('✓ Conectado a Railway\n');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
};

const validateTables = async () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   VALIDACIÓN DE MIGRACIÓN: NEON ↔ RAILWAY');
  console.log('═══════════════════════════════════════════════════════\n');

  const tables = [
    't_usuarios',
    't_pacientes',
    't_clientes',
    't_nutricionistas',
    't_cursos',
    't_inscripciones',
    't_planteles',
    't_categorias',
    't_sesion_mediciones',
    't_informe_antropometrico',
    't_excel_uploads',
    't_recovery_tokens',
    't_cuotas_mensuales',
    't_cuotas_usuario',
    't_pagos_cuotas',
  ];

  let totalMatch = 0;
  let totalMismatch = 0;

  console.log('Comparando registros por tabla:\n');
  console.log('Tabla                          | Neon | Railway | ✓/✗');
  console.log('─────────────────────────────────────────────────────');

  for (const table of tables) {
    try {
      const neonResult = await neonPool.query(`SELECT COUNT(*) as count FROM ${table};`);
      const railwayResult = await railwayPool.query(`SELECT COUNT(*) as count FROM ${table};`);

      const neonCount = neonResult.rows[0].count;
      const railwayCount = railwayResult.rows[0].count;

      const match = neonCount === railwayCount;
      const status = match ? '✓' : '✗ MISMATCH';

      if (match) {
        totalMatch++;
      } else {
        totalMismatch++;
      }

      const paddedTable = table.padEnd(28);
      console.log(
        `${paddedTable} | ${String(neonCount).padStart(4)} | ${String(railwayCount).padStart(7)} | ${status}`
      );
    } catch (error) {
      console.log(`${table.padEnd(28)} | ERROR | ${error.message}`);
      totalMismatch++;
    }
  }

  console.log('─────────────────────────────────────────────────────\n');

  return { totalMatch, totalMismatch };
};

const validateIntegrity = async () => {
  console.log('Validaciones de Integridad Referencial:\n');

  try {
    // Verificar usuarios con pacientes
    console.log('🔍 Validando referencias t_usuarios → t_clientes...');
    const clientesCheck = await railwayPool.query(`
      SELECT COUNT(*) as count
      FROM t_clientes c
      WHERE NOT EXISTS (SELECT 1 FROM t_usuarios u WHERE u.id = c.usuario_id)
    `);
    if (clientesCheck.rows[0].count === 0) {
      console.log('   ✓ Todas las referencias son válidas\n');
    } else {
      console.log(`   ✗ ${clientesCheck.rows[0].count} referencias rotas\n`);
    }

    // Verificar nutricionistas
    console.log('🔍 Validando referencias t_usuarios → t_nutricionistas...');
    const nutriCheck = await railwayPool.query(`
      SELECT COUNT(*) as count
      FROM t_nutricionistas n
      WHERE NOT EXISTS (SELECT 1 FROM t_usuarios u WHERE u.id = n.usuario_id)
    `);
    if (nutriCheck.rows[0].count === 0) {
      console.log('   ✓ Todas las referencias son válidas\n');
    } else {
      console.log(`   ✗ ${nutriCheck.rows[0].count} referencias rotas\n`);
    }

    // Verificar informes antropométricos
    console.log('🔍 Validando referencias t_informe_antropometrico...');
    const informeCheck = await railwayPool.query(`
      SELECT COUNT(*) as count
      FROM t_informe_antropometrico i
      WHERE NOT EXISTS (SELECT 1 FROM t_pacientes p WHERE p.id = i.paciente_id)
      OR NOT EXISTS (SELECT 1 FROM t_sesion_mediciones s WHERE s.id = i.sesion_id)
    `);
    if (informeCheck.rows[0].count === 0) {
      console.log('   ✓ Todas las referencias son válidas\n');
    } else {
      console.log(`   ✗ ${informeCheck.rows[0].count} referencias rotas\n`);
    }
  } catch (error) {
    console.log(`❌ Error validando integridad: ${error.message}\n`);
  }
};

const validateDataSamples = async () => {
  console.log('Muestras de Datos:\n');

  try {
    // Último usuario
    const lastUser = await railwayPool.query(`
      SELECT email, tipo_perfil FROM t_usuarios
      ORDER BY fecha_registro DESC LIMIT 1
    `);
    if (lastUser.rows.length > 0) {
      console.log('📝 Último usuario registrado:');
      console.log(`   Email: ${lastUser.rows[0].email}`);
      console.log(`   Tipo: ${lastUser.rows[0].tipo_perfil}\n`);
    }

    // Total de pacientes
    const pacientesCount = await railwayPool.query(`
      SELECT COUNT(*) as count FROM t_pacientes
    `);
    console.log(`👥 Total de pacientes: ${pacientesCount.rows[0].count}`);

    // Total de mediciones
    const medicionesCount = await railwayPool.query(`
      SELECT COUNT(*) as count FROM t_informe_antropometrico
    `);
    console.log(`📊 Total de mediciones: ${medicionesCount.rows[0].count}\n`);
  } catch (error) {
    console.log(`⚠️  No se pudo obtener muestras: ${error.message}\n`);
  }
};

const disconnect = async () => {
  if (neonPool) await neonPool.end();
  if (railwayPool) await railwayPool.end();
};

const main = async () => {
  const connected = await connect();
  if (!connected) {
    await disconnect();
    process.exit(1);
  }

  const { totalMatch, totalMismatch } = await validateTables();
  await validateIntegrity();
  await validateDataSamples();

  console.log('═══════════════════════════════════════════════════════');
  if (totalMismatch === 0) {
    console.log(`✅ MIGRACIÓN EXITOSA - ${totalMatch}/${totalMatch + totalMismatch} tablas coinciden`);
  } else {
    console.log(`⚠️  ADVERTENCIA - ${totalMatch}/${totalMatch + totalMismatch} tablas coinciden`);
    console.log(`   ${totalMismatch} tabla(s) con discrepancias`);
  }
  console.log('═══════════════════════════════════════════════════════\n');

  await disconnect();
  process.exit(totalMismatch === 0 ? 0 : 1);
};

main();
