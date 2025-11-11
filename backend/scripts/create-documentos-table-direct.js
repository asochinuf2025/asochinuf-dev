import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const crearTablaDocumentos = async () => {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('   Creando tabla t_documentos');
    console.log('═══════════════════════════════════════════\n');

    // 1. Crear tabla
    console.log('📋 Creando tabla t_documentos...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_documentos (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        archivo_url VARCHAR(255) NOT NULL,
        categoria VARCHAR(100),
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP DEFAULT NOW(),
        visible BOOLEAN DEFAULT true,
        usuario_creacion INTEGER REFERENCES t_usuarios(id) ON DELETE SET NULL
      );
    `);
    console.log('✓ Tabla t_documentos creada correctamente\n');

    // 2. Crear índices
    console.log('🔍 Creando índices...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON t_documentos(categoria);`);
    console.log('  ✓ Índice idx_documentos_categoria creado');

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_documentos_visible ON t_documentos(visible);`);
    console.log('  ✓ Índice idx_documentos_visible creado');

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_documentos_fecha_creacion ON t_documentos(fecha_creacion);`);
    console.log('  ✓ Índice idx_documentos_fecha_creacion creado\n');

    // 3. Verificar que la tabla existe
    console.log('✅ Verificando tabla...');
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 't_documentos'
    `);

    if (result.rows.length > 0) {
      console.log('✓ Tabla t_documentos verificada en la base de datos\n');
    } else {
      throw new Error('La tabla no se creó correctamente');
    }

    console.log('═══════════════════════════════════════════');
    console.log('✅ TABLA t_documentos CREADA EXITOSAMENTE');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear tabla:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  }
};

crearTablaDocumentos();
