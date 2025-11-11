-- Script SQL para crear tabla t_documentos en Railway
-- Ejecutar en la consola SQL de Railway

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

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON t_documentos(categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_visible ON t_documentos(visible);
CREATE INDEX IF NOT EXISTS idx_documentos_fecha_creacion ON t_documentos(fecha_creacion);

-- Mensaje de confirmación
SELECT 'Tabla t_documentos creada exitosamente' AS mensaje;
