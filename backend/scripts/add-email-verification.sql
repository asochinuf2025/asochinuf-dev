-- ============================================================
-- Script para agregar verificación de email a la BD existente
-- No es invasivo - solo agrega columnas y tablas nuevas
-- ============================================================

-- 1. Agregar columnas a t_usuarios (si no existen)
-- Esta columna indica si el usuario ha verificado su email
ALTER TABLE t_usuarios
ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false;

-- Esta columna es para almacenar el ID de Google OAuth
ALTER TABLE t_usuarios
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

-- 2. Crear tabla de tokens de verificación de email
-- Los tokens son hasheados por seguridad
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

-- 3. Crear índices para optimización de búsquedas
CREATE INDEX IF NOT EXISTS idx_verification_tokens_usuario_id
ON t_verification_tokens(usuario_id);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_token_hash
ON t_verification_tokens(token_hash);

-- 4. Marcar usuarios existentes como verificados
-- (para no bloquear acceso a usuarios ya registrados)
UPDATE t_usuarios
SET email_verificado = true
WHERE email_verificado IS NULL OR email_verificado = false;

-- 5. Verificar el resultado
SELECT
  (SELECT COUNT(*) FROM t_usuarios) as total_usuarios,
  (SELECT COUNT(*) FROM t_usuarios WHERE email_verificado = true) as usuarios_verificados,
  (SELECT COUNT(*) FROM t_usuarios WHERE email_verificado = false) as usuarios_no_verificados,
  (SELECT COUNT(*) FROM t_verification_tokens) as tokens_verificacion;
