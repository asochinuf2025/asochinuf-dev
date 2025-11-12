import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const fixCuotasSequence = async () => {
  try {
    console.log('🔧 Reparando secuencia de t_cuotas_mensuales...\n');

    // Obtener el máximo ID actual
    const result = await pool.query(`SELECT MAX(id) as max_id FROM t_cuotas_mensuales`);
    const maxId = result.rows[0].max_id || 0;

    console.log(`📊 ID máximo actual: ${maxId}`);

    // Resetear la secuencia
    await pool.query(`SELECT setval('t_cuotas_mensuales_id_seq', ${maxId + 1})`);

    console.log(`✅ Secuencia actualizada a: ${maxId + 1}`);
    console.log('✓ Problema resuelto. Ahora puedes crear nuevas cuotas sin error de duplicate key.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error reparando la secuencia:', error);
    process.exit(1);
  }
};

fixCuotasSequence();
