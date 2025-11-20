import pool from '../config/database.js';

const agregarSesionMedicionLink = async () => {
  try {
    console.log('Agregando columna sesion_medicion_id a t_pacientes...');

    // Agregar columna si no existe
    await pool.query(`
      ALTER TABLE t_pacientes
      ADD COLUMN IF NOT EXISTS sesion_medicion_id INTEGER
    `);

    // Agregar foreign key si no existe
    await pool.query(`
      ALTER TABLE t_pacientes
      ADD CONSTRAINT fk_pacientes_sesion_medicion
      FOREIGN KEY (sesion_medicion_id) REFERENCES t_sesion_mediciones(id) ON DELETE SET NULL
    `);

    // Crear índice para mejorar joins
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pacientes_sesion_medicion_id ON t_pacientes(sesion_medicion_id)
    `);

    console.log('✓ Columna sesion_medicion_id agregada exitosamente');
    console.log('✓ Foreign key creado');
    console.log('✓ Índice creado');
    process.exit(0);
  } catch (error) {
    console.error('Error al agregar columna:', error.message);
    // Si el error es que ya existe el foreign key, no es problema
    if (error.message.includes('already exists')) {
      console.log('✓ La restricción ya existe');
      process.exit(0);
    }
    process.exit(1);
  }
};

agregarSesionMedicionLink();
