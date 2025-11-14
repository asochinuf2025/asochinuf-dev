-- ========================================
-- SETUP LIGAS - Script SQL
-- ========================================
-- Este script configura la estructura de Ligas
-- directamente en PostgreSQL
-- Es seguro ejecutarlo múltiples veces
-- ========================================

-- ========== TABLA t_ligas ==========
CREATE TABLE IF NOT EXISTS t_ligas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  categoria_id INTEGER NOT NULL,
  descripcion VARCHAR(255),
  orden INTEGER,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (categoria_id) REFERENCES t_categorias(id) ON DELETE CASCADE,
  UNIQUE(nombre, categoria_id)
);

-- Insertar ligas según especificación
-- Liga Masculina Adulta (categoria_id = 1)
INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Primera A', 1, 1, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Primera B', 1, 2, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Segunda Profesional', 1, 3, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Tercera A', 1, 4, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Tercera B', 1, 5, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

-- Futbol Formativo Masculino (categoria_id = 2)
INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Sub21', 2, 1, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Sub18', 2, 2, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Sub16', 2, 3, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Sub15', 2, 4, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

-- Campeonato Infantil (categoria_id = 3)
INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Sub14', 3, 1, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Sub13', 3, 2, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Sub12', 3, 3, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Sub11', 3, 4, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

-- Liga Femenina (categoria_id = 4)
INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Campeonato Primera División', 4, 1, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Liga Ascenso', 4, 2, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Femenino Juvenil', 4, 3, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

-- Futsal (categoria_id = 5)
INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Campeonato Primera', 5, 1, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Campeonato Ascenso', 5, 2, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Campeonato Futsal Femenino', 5, 3, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Campeonato Futsal Sub20', 5, 4, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Campeonato Futsal Sub17', 5, 5, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('Campeonato Futsal Nacional', 5, 6, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

-- Futbol Playa (categoria_id = 6)
INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
VALUES ('División Principal', 6, 1, true)
ON CONFLICT (nombre, categoria_id) DO NOTHING;

-- Crear índices para t_ligas
CREATE INDEX IF NOT EXISTS idx_ligas_categoria_id ON t_ligas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_ligas_orden ON t_ligas(orden);
CREATE INDEX IF NOT EXISTS idx_ligas_activo ON t_ligas(activo);

-- ========== TABLA t_plantel_categoria ==========
CREATE TABLE IF NOT EXISTS t_plantel_categoria (
  id SERIAL PRIMARY KEY,
  plantel_id INTEGER NOT NULL,
  categoria_id INTEGER NOT NULL,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (plantel_id) REFERENCES t_planteles(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES t_categorias(id) ON DELETE CASCADE,
  UNIQUE(plantel_id, categoria_id)
);

-- Crear índices para t_plantel_categoria
CREATE INDEX IF NOT EXISTS idx_plantel_categoria_plantel_id ON t_plantel_categoria(plantel_id);
CREATE INDEX IF NOT EXISTS idx_plantel_categoria_categoria_id ON t_plantel_categoria(categoria_id);

-- ========== ACTUALIZAR t_sesion_mediciones ==========
-- Si liga_id no existe, lo agregamos
ALTER TABLE t_sesion_mediciones
ADD COLUMN IF NOT EXISTS liga_id INTEGER REFERENCES t_ligas(id) ON DELETE RESTRICT;

-- Crear índice para liga_id si no existe
CREATE INDEX IF NOT EXISTS idx_sesion_liga ON t_sesion_mediciones(liga_id);

-- Asegurarse que el UNIQUE constraint incluya liga_id
-- Nota: Si el constraint anterior existe sin liga_id, necesitarás:
-- ALTER TABLE t_sesion_mediciones DROP CONSTRAINT NOMBREDELCONSTRAINT;
-- Y luego ejecutar:
-- ALTER TABLE t_sesion_mediciones
-- ADD UNIQUE (plantel_id, categoria_id, liga_id, fecha_sesion, archivo_hash);

-- ========================================
-- VERIFICACIÓN
-- ========================================
-- Verifica que todo se creó correctamente:

SELECT 'Verificación de t_ligas' as check_name;
SELECT COUNT(*) as total_ligas FROM t_ligas;

SELECT 'Verificación de t_plantel_categoria' as check_name;
SELECT COUNT(*) as total_plantel_categoria FROM t_plantel_categoria;

SELECT 'Verificación de t_sesion_mediciones.liga_id' as check_name;
SELECT column_name
FROM information_schema.columns
WHERE table_name = 't_sesion_mediciones'
AND column_name = 'liga_id';

SELECT 'Ligas por categoría:' as breakdown;
SELECT c.nombre as categoria, COUNT(l.id) as total_ligas
FROM t_categorias c
LEFT JOIN t_ligas l ON c.id = l.categoria_id
WHERE c.activo = true
GROUP BY c.nombre, c.orden
ORDER BY c.orden;
