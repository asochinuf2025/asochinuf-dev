import pool from '../config/database.js';

const seedMoreData = async () => {
  try {
    console.log('🌱 Insertando más datos antropométricos de prueba...');

    // Obtener categoría y liga
    const categoriasResult = await pool.query('SELECT id FROM t_categorias LIMIT 1');
    const categoriaId = categoriasResult.rows[0]?.id;

    const ligasResult = await pool.query('SELECT id FROM t_ligas LIMIT 1');
    const ligaId = ligasResult.rows[0]?.id;

    const nutricionistaResult = await pool.query(
      `SELECT id FROM t_usuarios WHERE tipo_perfil = 'nutricionista' LIMIT 1`
    );
    const nutricionistaId = nutricionistaResult.rows[0]?.id;

    if (!categoriaId || !ligaId || !nutricionistaId) {
      throw new Error('Faltan datos necesarios');
    }

    // Planteles con diferentes regiones
    const plantelesConRegion = [
      { nombre: 'Iquique', region: 'Región de Tarapacá', zona: 'Norte' },
      { nombre: 'La Serena', region: 'Región de Coquimbo', zona: 'Norte' },
      { nombre: 'Valparaíso', region: 'Región de Valparaíso', zona: 'Centro' },
      { nombre: 'Concepción', region: 'Región del Biobío', zona: 'Sur' },
      { nombre: 'Temuco', region: 'Región de La Araucanía', zona: 'Sur' },
      { nombre: 'Puerto Montt', region: 'Región de Los Lagos', zona: 'Sur' }
    ];

    // Obtener o crear planteles
    const planteles = {};
    for (const p of plantelesConRegion) {
      let plantelId;
      const existente = await pool.query(
        `SELECT id FROM t_planteles WHERE nombre = $1`,
        [p.nombre]
      );

      if (existente.rows.length > 0) {
        plantelId = existente.rows[0].id;
      } else {
        const resultado = await pool.query(
          `INSERT INTO t_planteles (nombre, division, ciudad, region)
           VALUES ($1, 'Primera Division', $2, $3)
           RETURNING id`,
          [p.nombre, p.nombre, p.region]
        );
        plantelId = resultado.rows[0].id;
      }
      planteles[p.zona] = plantelId;
      console.log(`✓ Plantel ${p.nombre} (${p.zona}): ${plantelId}`);
    }

    // Crear más pacientes
    const posiciones = ['Portero', 'Defensa', 'Centrocampista', 'Delantero'];
    let pacienteNum = 100;

    // Datos para cada zona
    const zonesData = [
      { zona: 'Norte', cantidad: 6 },
      { zona: 'Centro', cantidad: 6 },
      { zona: 'Sur', cantidad: 8 }
    ];

    for (const zoneData of zonesData) {
      const plantelId = planteles[zoneData.zona];

      // Crear sesión para esta zona
      const sesionResult = await pool.query(
        `INSERT INTO t_sesion_mediciones (plantel_id, categoria_id, liga_id, fecha_sesion, nutricionista_id, archivo_hash, cantidad_registros)
         VALUES ($1, $2, $3, NOW()::DATE, $4, $5, $6)
         RETURNING id`,
        [plantelId, categoriaId, ligaId, nutricionistaId, `seed_zona_${zoneData.zona}_${Date.now()}`, zoneData.cantidad]
      );
      const sesionId = sesionResult.rows[0].id;

      // Insertar pacientes y mediciones para esta zona
      for (let i = 0; i < zoneData.cantidad; i++) {
        const posicion = posiciones[i % posiciones.length];
        const cedula = `999${zoneData.zona.substring(0, 1)}${String(i).padStart(4, '0')}`;

        // Insertar paciente
        const pacienteResult = await pool.query(
          `INSERT INTO t_pacientes (nombre, apellido, cedula, fecha_nacimiento, posicion_juego)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (cedula) DO UPDATE SET nombre = $1, apellido = $2
           RETURNING id`,
          [`Jugador${pacienteNum}`, `Zona${zoneData.zona}`, cedula, '2000-01-15', posicion]
        );
        const pacienteId = pacienteResult.rows[0].id;

        // Insertar medición
        const peso = 68 + Math.random() * 10;
        const talla = 175 + Math.random() * 10;
        const imc = (peso / ((talla / 100) ** 2)).toFixed(2);

        await pool.query(
          `INSERT INTO t_informe_antropometrico
           (sesion_id, paciente_id, fecha_medicion, peso, talla, imc, nutricionista_id)
           VALUES ($1, $2, NOW()::DATE, $3, $4, $5, $6)`,
          [sesionId, pacienteId, peso, talla, imc, nutricionistaId]
        );

        pacienteNum++;
      }

      console.log(`✓ Insertados ${zoneData.cantidad} jugadores para zona ${zoneData.zona}`);
    }

    console.log('✅ Carga de datos completada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedMoreData();
