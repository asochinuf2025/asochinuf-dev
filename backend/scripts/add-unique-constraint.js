import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script para agregar constraint UNIQUE a id_mercado_pago
 * en la tabla t_pagos_cuotas
 *
 * Uso: node scripts/add-unique-constraint.js
 */

async function addUniqueConstraint() {
  try {
    console.log('🔄 Iniciando migración...\n');

    // Primero, verificar si la constraint ya existe
    const constraintCheck = await pool.query(
      `SELECT constraint_name
       FROM information_schema.table_constraints
       WHERE table_name='t_pagos_cuotas'
       AND constraint_name='unique_id_mercado_pago'`
    );

    if (constraintCheck.rows.length > 0) {
      console.log('✅ La constraint UNIQUE ya existe en id_mercado_pago');
      console.log('   No hay nada que migrar.\n');
      process.exit(0);
    }

    console.log('📋 Verificando datos en t_pagos_cuotas...');

    // Verificar si hay duplicados de id_mercado_pago
    const duplicateCheck = await pool.query(
      `SELECT id_mercado_pago, COUNT(*) as count
       FROM t_pagos_cuotas
       WHERE id_mercado_pago IS NOT NULL
       GROUP BY id_mercado_pago
       HAVING COUNT(*) > 1`
    );

    if (duplicateCheck.rows.length > 0) {
      console.log('⚠️  Se encontraron valores duplicados en id_mercado_pago:');
      duplicateCheck.rows.forEach(row => {
        console.log(`   - ID: ${row.id_mercado_pago} (aparece ${row.count} veces)`);
      });
      console.log('\n❌ No se puede agregar constraint UNIQUE mientras existan duplicados.');
      console.log('   Por favor, limpia los registros duplicados manualmente.\n');
      process.exit(1);
    }

    console.log('✅ No hay duplicados encontrados.\n');

    // Agregar la constraint UNIQUE
    console.log('🔨 Agregando constraint UNIQUE a id_mercado_pago...');
    await pool.query(
      `ALTER TABLE t_pagos_cuotas
       ADD CONSTRAINT unique_id_mercado_pago UNIQUE (id_mercado_pago)`
    );

    console.log('✅ Constraint UNIQUE agregada exitosamente.\n');

    // Verificar que se agregó correctamente
    const finalCheck = await pool.query(
      `SELECT constraint_name
       FROM information_schema.table_constraints
       WHERE table_name='t_pagos_cuotas'
       AND constraint_name='unique_id_mercado_pago'`
    );

    if (finalCheck.rows.length > 0) {
      console.log('🎉 Migración completada exitosamente!');
      console.log('   Ahora los ID de Mercado Pago no pueden duplicarse.\n');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error durante la migración:');
    console.error(error.message);
    console.error('\nDetalles:');
    console.error(error);
    process.exit(1);
  }
}

addUniqueConstraint();
