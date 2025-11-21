import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const agregarVerificacionEmail = async () => {
  try {
    console.log('🔄 Iniciando actualización de base de datos...\n');

    // 1. Agregar columnas a t_usuarios (solo si no existen)
    console.log('1️⃣ Agregando columnas a t_usuarios...');
    try {
      await pool.query(`
        ALTER TABLE t_usuarios
        ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false
      `);
      console.log('   ✓ Columna email_verificado agregada');
    } catch (error) {
      console.log('   ℹ️  email_verificado ya existe');
    }

    try {
      await pool.query(`
        ALTER TABLE t_usuarios
        ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)
      `);
      console.log('   ✓ Columna google_id agregada');
    } catch (error) {
      console.log('   ℹ️  google_id ya existe');
    }

    // 2. Crear tabla t_verification_tokens
    console.log('\n2️⃣ Creando tabla t_verification_tokens...');
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS t_verification_tokens (
          id SERIAL PRIMARY KEY,
          usuario_id INTEGER NOT NULL,
          token_hash VARCHAR(255) NOT NULL UNIQUE,
          fecha_expiracion TIMESTAMP NOT NULL,
          usado BOOLEAN DEFAULT false,
          fecha_uso TIMESTAMP,
          fecha_creacion TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
        );
      `);
      console.log('   ✓ Tabla t_verification_tokens creada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ℹ️  Tabla t_verification_tokens ya existe');
      } else {
        throw error;
      }
    }

    // 3. Crear índices
    console.log('\n3️⃣ Creando índices...');
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_verification_tokens_usuario_id
        ON t_verification_tokens(usuario_id)
      `);
      console.log('   ✓ Índice usuario_id creado');
    } catch (error) {
      console.log('   ℹ️  Índice usuario_id ya existe');
    }

    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_verification_tokens_token_hash
        ON t_verification_tokens(token_hash)
      `);
      console.log('   ✓ Índice token_hash creado');
    } catch (error) {
      console.log('   ℹ️  Índice token_hash ya existe');
    }

    // 4. Actualizar usuarios existentes (solo si no tienen email_verificado)
    console.log('\n4️⃣ Actualizando usuarios existentes...');
    const resultadoActualizacion = await pool.query(`
      UPDATE t_usuarios
      SET email_verificado = true
      WHERE email_verificado IS NULL OR email_verificado = false
      RETURNING id
    `);
    console.log(`   ✓ ${resultadoActualizacion.rowCount} usuarios marcados como verificados`);

    // 5. Verificar estado final
    console.log('\n5️⃣ Verificando estado final...');
    const verificacion = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM t_usuarios) as total_usuarios,
        (SELECT COUNT(*) FROM t_usuarios WHERE email_verificado = true) as usuarios_verificados,
        (SELECT COUNT(*) FROM t_usuarios WHERE email_verificado = false) as usuarios_no_verificados,
        (SELECT COUNT(*) FROM t_verification_tokens) as tokens_verificacion
    `);

    const stats = verificacion.rows[0];
    console.log(`   • Total de usuarios: ${stats.total_usuarios}`);
    console.log(`   • Usuarios verificados: ${stats.usuarios_verificados}`);
    console.log(`   • Usuarios no verificados: ${stats.usuarios_no_verificados}`);
    console.log(`   • Tokens de verificación: ${stats.tokens_verificacion}`);

    console.log('\n✅ ¡Actualización completada exitosamente!\n');
    console.log('📝 Resumen de cambios:');
    console.log('   • Columna email_verificado agregada a t_usuarios');
    console.log('   • Columna google_id agregada a t_usuarios');
    console.log('   • Tabla t_verification_tokens creada');
    console.log('   • Índices para optimización creados');
    console.log('   • Usuarios existentes marcados como verificados\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la actualización:', error.message);
    console.error('\nDetalles técnicos:', error);
    process.exit(1);
  }
};

agregarVerificacionEmail();
