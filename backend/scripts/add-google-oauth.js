import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const agregarGoogleOAuth = async () => {
  try {
    console.log('🔄 Agregando soporte para Google OAuth...\n');

    // Verificar si la columna ya existe
    const checkColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='t_usuarios' AND column_name='google_id'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('ℹ️ La columna google_id ya existe en t_usuarios');
      return;
    }

    // Hacer password_hash nullable (para usuarios OAuth)
    console.log('📝 Haciendo password_hash nullable...');
    await pool.query(`
      ALTER TABLE t_usuarios
      ALTER COLUMN password_hash DROP NOT NULL
    `);
    console.log('✓ password_hash ahora es nullable\n');

    // Agregar columna google_id
    console.log('📝 Agregando columna google_id...');
    await pool.query(`
      ALTER TABLE t_usuarios
      ADD COLUMN google_id VARCHAR(255) UNIQUE
    `);
    console.log('✓ Columna google_id agregada\n');

    // Agregar índice para google_id
    console.log('📝 Creando índice para google_id...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_usuarios_google_id ON t_usuarios(google_id)
    `);
    console.log('✓ Índice creado\n');

    console.log('✅ Google OAuth configurado exitosamente!');
    console.log('\nProximos pasos:');
    console.log('1. Agregar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET a .env');
    console.log('2. Reiniciar el servidor: npm run dev');
    console.log('3. Instalar @react-oauth/google en frontend: yarn add @react-oauth/google');

  } catch (error) {
    console.error('❌ Error al configurar Google OAuth:', error.message);
    process.exit(1);
  }
};

agregarGoogleOAuth();
