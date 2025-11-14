import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const setupLigas = async () => {
  try {
    console.log('🔧 Configurando tablas de ligas...\n');

    // ========== TABLA t_ligas ==========
    console.log('Creando tabla t_ligas...');

    await pool.query(`
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
    `);
    console.log('✓ Tabla t_ligas creada/verificada');

    // Insertar ligas según especificación
    const ligas = [
      // Liga Masculina Adulta (categoria_id = 1)
      { nombre: 'Primera A', categoria_id: 1, orden: 1 },
      { nombre: 'Primera B', categoria_id: 1, orden: 2 },
      { nombre: 'Segunda Profesional', categoria_id: 1, orden: 3 },
      { nombre: 'Tercera A', categoria_id: 1, orden: 4 },
      { nombre: 'Tercera B', categoria_id: 1, orden: 5 },

      // Futbol Formativo Masculino (categoria_id = 2)
      { nombre: 'Sub21', categoria_id: 2, orden: 1 },
      { nombre: 'Sub18', categoria_id: 2, orden: 2 },
      { nombre: 'Sub16', categoria_id: 2, orden: 3 },
      { nombre: 'Sub15', categoria_id: 2, orden: 4 },

      // Campeonato Infantil (categoria_id = 3)
      { nombre: 'Sub14', categoria_id: 3, orden: 1 },
      { nombre: 'Sub13', categoria_id: 3, orden: 2 },
      { nombre: 'Sub12', categoria_id: 3, orden: 3 },
      { nombre: 'Sub11', categoria_id: 3, orden: 4 },

      // Liga Femenina (categoria_id = 4)
      { nombre: 'Campeonato Primera División', categoria_id: 4, orden: 1 },
      { nombre: 'Liga Ascenso', categoria_id: 4, orden: 2 },
      { nombre: 'Femenino Juvenil', categoria_id: 4, orden: 3 },

      // Futsal (categoria_id = 5)
      { nombre: 'Campeonato Primera', categoria_id: 5, orden: 1 },
      { nombre: 'Campeonato Ascenso', categoria_id: 5, orden: 2 },
      { nombre: 'Campeonato Futsal Femenino', categoria_id: 5, orden: 3 },
      { nombre: 'Campeonato Futsal Sub20', categoria_id: 5, orden: 4 },
      { nombre: 'Campeonato Futsal Sub17', categoria_id: 5, orden: 5 },
      { nombre: 'Campeonato Futsal Nacional', categoria_id: 5, orden: 6 },

      // Futbol Playa (categoria_id = 6)
      { nombre: 'División Principal', categoria_id: 6, orden: 1 }
    ];

    console.log(`Insertando ${ligas.length} ligas...`);
    let insertados = 0;
    let duplicados = 0;

    for (const liga of ligas) {
      try {
        await pool.query(
          `INSERT INTO t_ligas (nombre, categoria_id, orden, activo)
           VALUES ($1, $2, $3, true)
           ON CONFLICT (nombre, categoria_id) DO NOTHING`,
          [liga.nombre, liga.categoria_id, liga.orden]
        );
        insertados++;
      } catch (err) {
        if (err.message.includes('unique')) {
          duplicados++;
        } else {
          throw err;
        }
      }
    }

    console.log(`✓ ${insertados} ligas insertadas, ${duplicados} ya existían\n`);

    // Índices para t_ligas
    console.log('Creando índices para t_ligas...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_ligas_categoria_id ON t_ligas(categoria_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_ligas_orden ON t_ligas(orden);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_ligas_activo ON t_ligas(activo);`);
    console.log('✓ Índices en t_ligas creados\n');

    // ========== TABLA t_plantel_categoria ==========
    console.log('Creando tabla t_plantel_categoria...');

    await pool.query(`
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
    `);
    console.log('✓ Tabla t_plantel_categoria creada/verificada');

    // Índices para t_plantel_categoria
    console.log('Creando índices para t_plantel_categoria...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_plantel_categoria_plantel_id ON t_plantel_categoria(plantel_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_plantel_categoria_categoria_id ON t_plantel_categoria(categoria_id);`);
    console.log('✓ Índices en t_plantel_categoria creados\n');

    // ========== ACTUALIZAR t_sesion_mediciones ==========
    console.log('Verificando tabla t_sesion_mediciones...');

    // Verificar si la columna liga_id ya existe
    const columnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 't_sesion_mediciones'
      AND column_name = 'liga_id'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('Agregando columna liga_id a t_sesion_mediciones...');

      // Primero, necesitamos hacer la migración sin perder datos
      // Creamos una tabla temporal con la nueva estructura
      await pool.query(`
        CREATE TABLE t_sesion_mediciones_temp AS
        SELECT * FROM t_sesion_mediciones;
      `);

      // Eliminamos la tabla original
      await pool.query(`DROP TABLE t_sesion_mediciones CASCADE;`);

      // Creamos la tabla con la nueva estructura
      await pool.query(`
        CREATE TABLE t_sesion_mediciones (
          id SERIAL PRIMARY KEY,
          plantel_id INTEGER NOT NULL REFERENCES t_planteles(id) ON DELETE RESTRICT,
          categoria_id INTEGER NOT NULL REFERENCES t_categorias(id) ON DELETE RESTRICT,
          liga_id INTEGER REFERENCES t_ligas(id) ON DELETE RESTRICT,
          fecha_sesion DATE NOT NULL,
          nutricionista_id INTEGER REFERENCES t_usuarios(id) ON DELETE SET NULL,
          archivo_hash VARCHAR(64) NOT NULL,
          cantidad_registros INTEGER NOT NULL,
          fecha_carga TIMESTAMP DEFAULT NOW(),
          UNIQUE(plantel_id, categoria_id, liga_id, fecha_sesion, archivo_hash)
        );
      `);

      // Restauramos los datos (liga_id será NULL para registros antiguos)
      await pool.query(`
        INSERT INTO t_sesion_mediciones (id, plantel_id, categoria_id, fecha_sesion, nutricionista_id, archivo_hash, cantidad_registros, fecha_carga)
        SELECT id, plantel_id, categoria_id, fecha_sesion, nutricionista_id, archivo_hash, cantidad_registros, fecha_carga
        FROM t_sesion_mediciones_temp
        ORDER BY id;
      `);

      // Eliminamos la tabla temporal
      await pool.query(`DROP TABLE t_sesion_mediciones_temp;`);

      console.log('✓ Columna liga_id agregada a t_sesion_mediciones');
    } else {
      console.log('✓ Columna liga_id ya existe en t_sesion_mediciones');
    }

    // Crear índices si no existen
    console.log('Creando índices para t_sesion_mediciones...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sesion_plantel ON t_sesion_mediciones(plantel_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sesion_categoria ON t_sesion_mediciones(categoria_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sesion_liga ON t_sesion_mediciones(liga_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sesion_fecha ON t_sesion_mediciones(fecha_sesion);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sesion_nutricionista ON t_sesion_mediciones(nutricionista_id);`);
    console.log('✓ Índices en t_sesion_mediciones creados\n');

    console.log('\n========================================');
    console.log('✓ CONFIGURACIÓN COMPLETADA CORRECTAMENTE');
    console.log('========================================\n');
    console.log('Tablas/funcionalidades actualizadas:');
    console.log('  • t_ligas (23 ligas predefinidas)');
    console.log('  • t_plantel_categoria (relación plantel-categoría)');
    console.log('  • t_sesion_mediciones (con liga_id)\n');
    console.log('Próximos pasos:');
    console.log('  1. Asignar categorías a planteles vía API o admin panel');
    console.log('  2. Probar flujo en ExcelSection\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error durante la configuración:', error);
    console.error('\nDetalles:', error.message);
    process.exit(1);
  }
};

setupLigas();
