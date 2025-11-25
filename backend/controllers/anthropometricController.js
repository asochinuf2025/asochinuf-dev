import pool from '../config/database.js';

/**
 * Obtener estadísticas antropométricas con filtros
 * Filtros: plantel_id, categoria_id, liga_id, region
 */
export const getAnthropometricStats = async (req, res) => {
  try {
    const { plantel_id, categoria_id, liga_id, zona, measurement_type } = req.query;

    // Tipos de medidas disponibles
    const measurementTypes = [
      'peso', 'talla', 'talla_sentado', 'diametro_biacromial',
      'diametro_torax', 'diametro_antpost_torax', 'diametro_biiliocristal',
      'diametro_bitrocanterea', 'diametro_humero', 'diametro_femur',
      'perimetro_brazo_relajado', 'perimetro_brazo_flexionado',
      'perimetro_muslo_anterior', 'perimetro_pantorrilla',
      'pliegue_triceps', 'pliegue_subescapular',
      'pliegue_supraespinal', 'pliegue_abdominal', 'pliegue_muslo_anterior',
      'pliegue_pantorrilla_medial', 'imc', 'suma_6_pliegues', 'suma_8_pliegues',
      'masa_adiposa_superior', 'masa_adiposa_media', 'masa_adiposa_inferior'
    ];

    const medida = measurementTypes.includes(measurement_type) ? measurement_type : 'imc';

    // Mapear zona a regiones
    const getRegionesFromZona = (zona) => {
      if (zona === 'Norte') {
        return ['Región de Arica y Parinacota', 'Región de Tarapacá', 'Región de Antofagasta', 'Región de Atacama', 'Región de Coquimbo'];
      } else if (zona === 'Centro') {
        return ['Región de Valparaíso', 'Región Metropolitana', 'Región del Libertador General Bernardo O\'Higgins', 'Región del Maule'];
      } else if (zona === 'Sur') {
        return ['Región de Ñuble', 'Región del Biobío', 'Región de La Araucanía', 'Región de Los Lagos', 'Región de Los Ríos', 'Región de Magallanes'];
      }
      return [];
    };

    // Construir query dinámicamente según filtros
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (plantel_id) {
      whereConditions.push(`sm.plantel_id = $${paramIndex}`);
      queryParams.push(parseInt(plantel_id));
      paramIndex++;
    }

    if (categoria_id) {
      whereConditions.push(`sm.categoria_id = $${paramIndex}`);
      queryParams.push(parseInt(categoria_id));
      paramIndex++;
    }

    if (liga_id) {
      whereConditions.push(`sm.liga_id = $${paramIndex}`);
      queryParams.push(parseInt(liga_id));
      paramIndex++;
    }

    if (zona) {
      const regiones = getRegionesFromZona(zona);
      if (regiones.length > 0) {
        const placeholders = regiones.map((_, i) => `$${paramIndex + i}`).join(',');
        whereConditions.push(`tp.region IN (${placeholders})`);
        queryParams.push(...regiones);
        paramIndex += regiones.length;
      }
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Query para obtener estadísticas
    const statsQuery = `
      SELECT
        ROUND(AVG(ia.${medida})::numeric, 2) as promedio,
        ROUND(MIN(ia.${medida})::numeric, 2) as minimo,
        ROUND(MAX(ia.${medida})::numeric, 2) as maximo,
        ROUND((MAX(ia.${medida}) - MIN(ia.${medida}))::numeric, 2) as rango,
        COUNT(DISTINCT ia.paciente_id) as total_jugadores,
        COUNT(*) as total_mediciones,
        ROUND(STDDEV_POP(ia.${medida})::numeric, 2) as desv_estandar
      FROM t_informe_antropometrico ia
      JOIN t_sesion_mediciones sm ON ia.sesion_id = sm.id
      JOIN t_planteles tp ON sm.plantel_id = tp.id
      ${whereClause}
    `;

    const statsResult = await pool.query(statsQuery, queryParams);
    const stats = statsResult.rows[0] || {
      promedio: 0, minimo: 0, maximo: 0, rango: 0,
      total_jugadores: 0, total_mediciones: 0, desv_estandar: 0
    };

    // Query para distribución por categorías (siempre mostrar cuando hay datos)
    let distribucionCategoria = [];
    const distQuery = `
      SELECT
        tc.nombre as categoria,
        COUNT(DISTINCT ia.paciente_id) as cantidad,
        ROUND(AVG(ia.${medida})::numeric, 2) as promedio
      FROM t_informe_antropometrico ia
      JOIN t_sesion_mediciones sm ON ia.sesion_id = sm.id
      JOIN t_categorias tc ON sm.categoria_id = tc.id
      JOIN t_planteles tp ON sm.plantel_id = tp.id
      ${whereClause}
      GROUP BY tc.id, tc.nombre
      ORDER BY cantidad DESC
    `;
    const distResult = await pool.query(distQuery, queryParams);
    distribucionCategoria = distResult.rows;

    // Query para distribución por planteles (SIEMPRE mostrar)
    let distribucionPlantel = [];
    const distPlantelQuery = `
      SELECT
        tp.nombre as plantel,
        COUNT(DISTINCT ia.paciente_id) as cantidad,
        ROUND(AVG(ia.${medida})::numeric, 2) as promedio
      FROM t_informe_antropometrico ia
      JOIN t_sesion_mediciones sm ON ia.sesion_id = sm.id
      JOIN t_planteles tp ON sm.plantel_id = tp.id
      ${whereClause}
      GROUP BY tp.id, tp.nombre
      ORDER BY cantidad DESC
      LIMIT 10
    `;
    const distPlantelResult = await pool.query(distPlantelQuery, queryParams);
    distribucionPlantel = distPlantelResult.rows;

    // Query para tendencia temporal (últimos 30 días)
    const tendenciaQuery = `
      SELECT
        DATE(ia.fecha_medicion) as fecha,
        COUNT(DISTINCT ia.paciente_id) as cantidad,
        ROUND(AVG(ia.${medida})::numeric, 2) as promedio
      FROM t_informe_antropometrico ia
      JOIN t_sesion_mediciones sm ON ia.sesion_id = sm.id
      JOIN t_planteles tp ON sm.plantel_id = tp.id
      ${whereClause}
      ${whereClause ? 'AND' : 'WHERE'} ia.fecha_medicion >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(ia.fecha_medicion)
      ORDER BY fecha ASC
    `;

    const tendenciaResult = await pool.query(tendenciaQuery, queryParams);
    const tendencia = tendenciaResult.rows;

    // Query para distribución por posición
    let distribucionPosicion = [];
    const posicionQuery = `
      SELECT
        COALESCE(tp_pac.posicion_juego, 'Sin especificar') as posicion,
        COUNT(DISTINCT ia.paciente_id) as cantidad,
        ROUND(AVG(ia.${medida})::numeric, 2) as promedio
      FROM t_informe_antropometrico ia
      JOIN t_sesion_mediciones sm ON ia.sesion_id = sm.id
      JOIN t_planteles tp ON sm.plantel_id = tp.id
      LEFT JOIN t_pacientes tp_pac ON ia.paciente_id = tp_pac.id
      ${whereClause}
      GROUP BY COALESCE(tp_pac.posicion_juego, 'Sin especificar')
      ORDER BY cantidad DESC
    `;

    const posicionResult = await pool.query(posicionQuery, queryParams);
    distribucionPosicion = posicionResult.rows;

    // Query para distribución por zona (sin filtro de zona para ver todas las zonas)
    let distribucionPorZona = [];
    // Construir whereClause sin el filtro de zona para esta query específica
    let zonaWhereConditions = [];
    let zonaQueryParams = [];
    let zonaParamIndex = 1;

    if (plantel_id) {
      zonaWhereConditions.push(`sm.plantel_id = $${zonaParamIndex}`);
      zonaQueryParams.push(parseInt(plantel_id));
      zonaParamIndex++;
    }
    if (categoria_id) {
      zonaWhereConditions.push(`sm.categoria_id = $${zonaParamIndex}`);
      zonaQueryParams.push(parseInt(categoria_id));
      zonaParamIndex++;
    }
    if (liga_id) {
      zonaWhereConditions.push(`sm.liga_id = $${zonaParamIndex}`);
      zonaQueryParams.push(parseInt(liga_id));
      zonaParamIndex++;
    }

    const zonaWhereClause = zonaWhereConditions.length > 0 ? 'WHERE ' + zonaWhereConditions.join(' AND ') : '';

    const zonaQuery = `
      SELECT
        CASE
          WHEN tp.region IN ('Región de Arica y Parinacota', 'Región de Tarapacá', 'Región de Antofagasta', 'Región de Atacama', 'Región de Coquimbo') THEN 'Norte'
          WHEN tp.region IN ('Región de Valparaíso', 'Región Metropolitana', 'Región del Libertador General Bernardo O''Higgins', 'Región del Maule') THEN 'Centro'
          WHEN tp.region IN ('Región de Ñuble', 'Región del Biobío', 'Región de La Araucanía', 'Región de Los Lagos', 'Región de Los Ríos', 'Región de Magallanes') THEN 'Sur'
          ELSE 'Otro'
        END as zona,
        COUNT(DISTINCT ia.paciente_id) as cantidad
      FROM t_informe_antropometrico ia
      JOIN t_sesion_mediciones sm ON ia.sesion_id = sm.id
      JOIN t_planteles tp ON sm.plantel_id = tp.id
      ${zonaWhereClause}
      GROUP BY zona
      ORDER BY cantidad DESC
    `;

    const zonaResult = await pool.query(zonaQuery, zonaQueryParams);
    distribucionPorZona = zonaResult.rows;

    // Obtener última fecha de carga (más reciente en t_sesion_mediciones)
    let ultimaActualizacion = null;
    try {
      // Construir whereClause específico para la query de fecha (sin referencias a ia)
      let fechaWhereConditions = [];
      let fechaParams = [];
      let fechaParamIndex = 1;

      if (plantel_id) {
        fechaWhereConditions.push(`sm.plantel_id = $${fechaParamIndex}`);
        fechaParams.push(parseInt(plantel_id));
        fechaParamIndex++;
      }

      if (categoria_id) {
        fechaWhereConditions.push(`sm.categoria_id = $${fechaParamIndex}`);
        fechaParams.push(parseInt(categoria_id));
        fechaParamIndex++;
      }

      if (liga_id) {
        fechaWhereConditions.push(`sm.liga_id = $${fechaParamIndex}`);
        fechaParams.push(parseInt(liga_id));
        fechaParamIndex++;
      }

      if (zona) {
        const regiones = getRegionesFromZona(zona);
        if (regiones.length > 0) {
          const placeholders = regiones.map((_, i) => `$${fechaParamIndex + i}`).join(',');
          fechaWhereConditions.push(`tp.region IN (${placeholders})`);
          fechaParams.push(...regiones);
          fechaParamIndex += regiones.length;
        }
      }

      const fechaWhereClause = fechaWhereConditions.length > 0
        ? 'WHERE ' + fechaWhereConditions.join(' AND ')
        : '';

      const fechaQuery = `
        SELECT MAX(sm.fecha_carga) as ultima_fecha
        FROM t_sesion_mediciones sm
        JOIN t_planteles tp ON sm.plantel_id = tp.id
        ${fechaWhereClause}
      `;
      const fechaResult = await pool.query(fechaQuery, fechaParams);
      if (fechaResult.rows[0]?.ultima_fecha) {
        ultimaActualizacion = fechaResult.rows[0].ultima_fecha;
      }
    } catch (err) {
      console.warn('Error al obtener última actualización:', err.message);
    }

    // Obtener planteles filtrados según los criterios
    let plantelesActuales = [];
    try {
      // Construir whereClause específico para planteles (solo filtros de región/zona)
      let plantelesWhereConditions = [];
      let plantelesParams = [];
      let plantelesParamIndex = 1;

      if (zona) {
        const regiones = getRegionesFromZona(zona);
        if (regiones.length > 0) {
          const placeholders = regiones.map((_, i) => `$${plantelesParamIndex + i}`).join(',');
          plantelesWhereConditions.push(`tp.region IN (${placeholders})`);
          plantelesParams.push(...regiones);
          plantelesParamIndex += regiones.length;
        }
      }

      const plantelesWhereClause = plantelesWhereConditions.length > 0
        ? 'WHERE ' + plantelesWhereConditions.join(' AND ')
        : '';

      const plantelesQuery = `
        SELECT DISTINCT tp.id, tp.nombre
        FROM t_planteles tp
        ${plantelesWhereClause}
        ORDER BY tp.nombre
      `;
      const plantelesResult = await pool.query(plantelesQuery, plantelesParams);
      plantelesActuales = plantelesResult.rows;
    } catch (err) {
      console.warn('Error al obtener planteles filtrados:', err.message);
    }

    res.json({
      success: true,
      medida: medida,
      stats: stats,
      ultimaActualizacion: ultimaActualizacion,
      plantelesActuales: plantelesActuales,
      distribucionCategoria: distribucionCategoria,
      distribucionPlantel: distribucionPlantel,
      distribucionPosicion: distribucionPosicion,
      distribucionPorZona: distribucionPorZona,
      tendencia: tendencia
    });

  } catch (error) {
    console.error('Error al obtener estadísticas antropométricas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
};

/**
 * Obtener todas las opciones de filtros disponibles
 */
export const getFilterOptions = async (req, res) => {
  try {
    // Obtener todos los planteles activos con sus regiones
    const plantelesResult = await pool.query(`
      SELECT
        tp.id,
        tp.nombre,
        tp.region,
        COALESCE(COUNT(DISTINCT ia.paciente_id), 0) as cantidad_jugadores
      FROM t_planteles tp
      LEFT JOIN t_sesion_mediciones sm ON tp.id = sm.plantel_id
      LEFT JOIN t_informe_antropometrico ia ON sm.id = ia.sesion_id
      WHERE tp.activo = true
      GROUP BY tp.id, tp.nombre, tp.region
      ORDER BY tp.nombre
    `);

    // Obtener todas las categorías
    const categoriasResult = await pool.query(`
      SELECT
        tc.id,
        tc.nombre,
        COALESCE(COUNT(DISTINCT ia.paciente_id), 0) as cantidad_jugadores
      FROM t_categorias tc
      LEFT JOIN t_sesion_mediciones sm ON tc.id = sm.categoria_id
      LEFT JOIN t_informe_antropometrico ia ON sm.id = ia.sesion_id
      WHERE tc.activo = true
      GROUP BY tc.id, tc.nombre
      ORDER BY tc.orden
    `);

    // Obtener todas las ligas
    const ligasResult = await pool.query(`
      SELECT
        tl.id,
        tl.nombre,
        tl.categoria_id,
        COALESCE(COUNT(DISTINCT ia.paciente_id), 0) as cantidad_jugadores
      FROM t_ligas tl
      LEFT JOIN t_sesion_mediciones sm ON tl.id = sm.liga_id
      LEFT JOIN t_informe_antropometrico ia ON sm.id = ia.sesion_id
      WHERE tl.activo = true
      GROUP BY tl.id, tl.nombre, tl.categoria_id
      ORDER BY tl.nombre
    `);

    // Obtener todas las regiones únicas
    const regionesResult = await pool.query(`
      SELECT
        tp.region,
        COALESCE(COUNT(DISTINCT ia.paciente_id), 0) as cantidad_jugadores
      FROM t_planteles tp
      LEFT JOIN t_sesion_mediciones sm ON tp.id = sm.plantel_id
      LEFT JOIN t_informe_antropometrico ia ON sm.id = ia.sesion_id
      WHERE tp.activo = true
      GROUP BY tp.region
      ORDER BY tp.region
    `);

    res.json({
      success: true,
      planteles: plantelesResult.rows,
      categorias: categoriasResult.rows,
      ligas: ligasResult.rows,
      regiones: regionesResult.rows
    });

  } catch (error) {
    console.error('Error al obtener opciones de filtros:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener opciones de filtros'
    });
  }
};

/**
 * Obtener datos de un jugador específico
 */
export const getPlayerAnthropometricData = async (req, res) => {
  try {
    const { paciente_id } = req.params;

    const playerQuery = `
      SELECT
        ia.*,
        tp.nombre as paciente_nombre,
        tp.apellido as paciente_apellido,
        tp.posicion_juego,
        tp_plantel.nombre as plantel_nombre,
        tc.nombre as categoria_nombre,
        tl.nombre as liga_nombre
      FROM t_informe_antropometrico ia
      JOIN t_sesion_mediciones sm ON ia.sesion_id = sm.id
      JOIN t_pacientes tp ON ia.paciente_id = tp.id
      JOIN t_planteles tp_plantel ON sm.plantel_id = tp_plantel.id
      JOIN t_categorias tc ON sm.categoria_id = tc.id
      JOIN t_ligas tl ON sm.liga_id = tl.id
      WHERE ia.paciente_id = $1
      ORDER BY ia.fecha_medicion DESC
    `;

    const playerResult = await pool.query(playerQuery, [parseInt(paciente_id)]);

    res.json({
      success: true,
      data: playerResult.rows
    });

  } catch (error) {
    console.error('Error al obtener datos del jugador:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener datos del jugador'
    });
  }
};
