import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const agregarCamposAlCurso = async () => {
  try {
    console.log('Agregando campos a la tabla t_cursos...\n');

    // Agregar columna lo_que_aprenderas si no existe
    await pool.query(`
      ALTER TABLE t_cursos
      ADD COLUMN IF NOT EXISTS lo_que_aprenderas TEXT DEFAULT NULL;
    `);
    console.log('✅ Campo "lo_que_aprenderas" agregado exitosamente');

    // Agregar columna requisitos si no existe
    await pool.query(`
      ALTER TABLE t_cursos
      ADD COLUMN IF NOT EXISTS requisitos TEXT DEFAULT NULL;
    `);
    console.log('✅ Campo "requisitos" agregado exitosamente');

    console.log('\n✨ Migración completada exitosamente!');
    console.log('   - lo_que_aprenderas: TEXT, NULL permitido');
    console.log('   - requisitos: TEXT, NULL permitido\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al agregar campos:', error.message);
    process.exit(1);
  }
};

agregarCamposAlCurso();
