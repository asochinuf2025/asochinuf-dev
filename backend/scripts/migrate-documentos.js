import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrardDocumentos = async () => {
  try {
    console.log('🔄 Iniciando migración de tabla t_documentos...\n');

    // 1. Hacer backup de datos existentes (si los hay)
    console.log('1️⃣ Verificando si existen documentos para hacer backup...');
    const backupResult = await pool.query('SELECT * FROM t_documentos');
    const documentosExistentes = backupResult.rows;

    if (documentosExistentes.length > 0) {
      console.log(`   ✓ Encontrados ${documentosExistentes.length} documentos existentes`);
      console.log('   ⚠️  NOTA: Los datos anteriores se perderán. Asegúrate de haber hecho backup.');
    } else {
      console.log('   ✓ No hay documentos previos');
    }

    // 2. Eliminar tabla antigua
    console.log('\n2️⃣ Eliminando tabla t_documentos antigua...');
    await pool.query('DROP TABLE IF EXISTS t_documentos CASCADE;');
    console.log('   ✓ Tabla antigua eliminada');

    // 3. Crear tabla nueva con estructura mejorada
    console.log('\n3️⃣ Creando tabla t_documentos nueva...');
    await pool.query(`
      CREATE TABLE t_documentos (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        archivo_contenido BYTEA NOT NULL,
        archivo_nombre VARCHAR(255) NOT NULL,
        archivo_tipo VARCHAR(100) NOT NULL,
        archivo_tamaño INTEGER,
        miniatura BYTEA,
        categoria VARCHAR(100),
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP DEFAULT NOW(),
        visible BOOLEAN DEFAULT true,
        usuario_creacion INTEGER REFERENCES t_usuarios(id) ON DELETE SET NULL
      );
    `);
    console.log('   ✓ Tabla t_documentos creada exitosamente');

    // 4. Crear índices
    console.log('\n4️⃣ Creando índices...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON t_documentos(categoria);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_documentos_visible ON t_documentos(visible);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_documentos_fecha_creacion ON t_documentos(fecha_creacion);');
    console.log('   ✓ Índices creados');

    // 5. Mostrar resultado
    console.log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('\n📋 Nueva estructura de t_documentos:');
    console.log('   • id (SERIAL PRIMARY KEY)');
    console.log('   • titulo (VARCHAR 255) - Título del documento');
    console.log('   • descripcion (TEXT) - Descripción opcional');
    console.log('   • archivo_contenido (BYTEA) - Contenido binario del PDF/DOC');
    console.log('   • archivo_nombre (VARCHAR 255) - Nombre del archivo original');
    console.log('   • archivo_tipo (VARCHAR 100) - Tipo MIME (application/pdf, etc)');
    console.log('   • archivo_tamaño (INTEGER) - Tamaño en bytes');
    console.log('   • miniatura (BYTEA) - Imagen PNG generada automáticamente');
    console.log('   • categoria (VARCHAR 100) - Categoría del documento');
    console.log('   • fecha_creacion (TIMESTAMP) - Fecha de creación');
    console.log('   • fecha_actualizacion (TIMESTAMP) - Fecha de última actualización');
    console.log('   • visible (BOOLEAN) - Visibilidad del documento');
    console.log('   • usuario_creacion (INTEGER FK) - Usuario que lo creó');
    console.log('\n✨ Ahora puedes:');
    console.log('   • Subir PDFs que generarán miniaturas automáticamente');
    console.log('   • Guardar documentos directamente en la BD sin Cloudinary');
    console.log('   • Descargar archivos desde /api/documentos/:id?download=true');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  }
};

migrardDocumentos();
