import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const fixPagosCuotas = async () => {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('   FIX: Limpiar tabla t_pagos_cuotas');
    console.log('═══════════════════════════════════════════\n');

    // 1. Mostrar datos actuales
    console.log('📊 Estado actual de la tabla:');
    const currentData = await pool.query(
      'SELECT id, cuota_usuario_id, monto_pagado, metodo_pago, fecha_pago FROM t_pagos_cuotas ORDER BY id'
    );
    console.log(`   Total de registros: ${currentData.rows.length}\n`);
    currentData.rows.forEach(row => {
      console.log(`   ID ${row.id}: cuota_usuario_id=${row.cuota_usuario_id}, monto=${row.monto_pagado}, metodo=${row.metodo_pago}`);
    });

    // 2. Eliminar todos los registros (limpiar tabla)
    console.log('\n🗑️  Eliminando todos los registros...');
    await pool.query('DELETE FROM t_pagos_cuotas');
    console.log('   ✓ Registros eliminados');

    // 3. Resetear la secuencia del auto-incremento
    console.log('\n🔄 Reseteando secuencia de auto-incremento...');
    await pool.query('ALTER SEQUENCE t_pagos_cuotas_id_seq RESTART WITH 1');
    console.log('   ✓ Secuencia reseteada');

    // 4. Verificar que la tabla está vacía
    console.log('\n✅ Verificando tabla limpia...');
    const newData = await pool.query('SELECT COUNT(*) FROM t_pagos_cuotas');
    console.log(`   Total de registros: ${newData.rows[0].count}`);

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ Tabla t_pagos_cuotas limpiada correctamente');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al limpiar tabla:', error);
    process.exit(1);
  }
};

fixPagosCuotas();
