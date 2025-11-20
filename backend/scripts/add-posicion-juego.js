import pool from '../config/database.js';

const agregarPosicionJuego = async () => {
  try {
    console.log('Agregando columna posicion_juego a t_pacientes...');

    // Agregar columna si no existe
    await pool.query(`
      ALTER TABLE t_pacientes
      ADD COLUMN IF NOT EXISTS posicion_juego VARCHAR(50)
    `);

    console.log('✓ Columna posicion_juego agregada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al agregar columna:', error.message);
    process.exit(1);
  }
};

agregarPosicionJuego();
