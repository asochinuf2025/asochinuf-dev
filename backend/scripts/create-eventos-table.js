import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const crearTablaEventos = async () => {
  try {
    console.log('Creando tabla t_eventos...');

    // Primero eliminar tabla existente si existe
    await pool.query(`DROP TABLE IF EXISTS t_eventos CASCADE;`);

    await pool.query(`
      CREATE TABLE t_eventos (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        archivo_contenido BYTEA NOT NULL,
        archivo_nombre VARCHAR(255) NOT NULL,
        archivo_tipo VARCHAR(100) NOT NULL,
        archivo_tamaño INTEGER,
        miniatura BYTEA,
        categoria VARCHAR(100),
        fecha_evento DATE,
        hora_evento TIME,
        ubicacion VARCHAR(500),
        expositores TEXT,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP DEFAULT NOW(),
        visible BOOLEAN DEFAULT true,
        usuario_creacion INTEGER REFERENCES t_usuarios(id) ON DELETE SET NULL
      );
    `);
    console.log('✓ Tabla t_eventos creada');

    // Índices para t_eventos
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON t_eventos(categoria);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_eventos_visible ON t_eventos(visible);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_eventos_fecha_creacion ON t_eventos(fecha_creacion);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_eventos_fecha_evento ON t_eventos(fecha_evento);`);
    console.log('✓ Índices en t_eventos creados');

    console.log('\n✅ Tabla t_eventos creada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al crear tabla t_eventos:', error);
    process.exit(1);
  }
};

crearTablaEventos();
