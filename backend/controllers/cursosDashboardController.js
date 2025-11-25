import pool from '../config/database.js';

/**
 * Obtener todas las estadísticas para el dashboard de cursos
 */
export const obtenerEstadisticasDashboard = async (req, res) => {
  try {
    // 1. Total de cursos disponibles
    const totalCursosResult = await pool.query(
      `SELECT COUNT(*) as cantidad FROM t_cursos WHERE estado = 'activo'`
    );
    const totalCursos = totalCursosResult.rows[0]?.cantidad || 0;

    // 2. Total de clientes/estudiantes inscritos
    const totalEstudiantesResult = await pool.query(
      `SELECT COUNT(DISTINCT usuario_id) as cantidad
       FROM t_inscripciones`
    );
    const totalEstudiantes = totalEstudiantesResult.rows[0]?.cantidad || 0;

    // 3. Total de ingresos (si hay tabla de pagos o precios)
    const totalIngresosResult = await pool.query(
      `SELECT COALESCE(SUM(precio), 0) as total
       FROM t_cursos
       WHERE estado = 'activo'`
    );
    const totalIngresos = parseFloat(totalIngresosResult.rows[0]?.total) || 0;

    // 4. Cursos más populares (más inscritos)
    const cursosPopularesResult = await pool.query(
      `SELECT
         tc.id_curso,
         tc.nombre,
         tc.codigo_curso,
         tc.precio,
         COUNT(DISTINCT ti.usuario_id) as cantidad_inscritos,
         ROUND(COUNT(DISTINCT ti.usuario_id) * 100.0 / (SELECT COUNT(DISTINCT usuario_id) FROM t_inscripciones), 1) as porcentaje_estudiantes
       FROM t_cursos tc
       LEFT JOIN t_inscripciones ti ON tc.id_curso = ti.id_curso
       WHERE tc.estado = 'activo'
       GROUP BY tc.id_curso, tc.nombre, tc.codigo_curso, tc.precio
       ORDER BY cantidad_inscritos DESC
       LIMIT 5`
    );
    const cursosMasPopulares = cursosPopularesResult.rows.map(row => ({
      id_curso: row.id_curso,
      nombre: row.nombre,
      codigo_curso: row.codigo_curso,
      precio: parseFloat(row.precio),
      cantidad_inscritos: parseInt(row.cantidad_inscritos),
      porcentaje_estudiantes: parseFloat(row.porcentaje_estudiantes)
    }));

    // 5. Cursos nunca comprados/inscritos
    const cursosNuncaCompradosResult = await pool.query(
      `SELECT
         id_curso,
         codigo_curso,
         nombre,
         precio,
         duracion_horas,
         nivel
       FROM t_cursos tc
       WHERE estado = 'activo'
         AND id_curso NOT IN (SELECT DISTINCT id_curso FROM t_inscripciones)
       ORDER BY fecha_creacion DESC`
    );
    const cursosNuncaComprados = cursosNuncaCompradosResult.rows.map(row => ({
      id_curso: row.id_curso,
      codigo_curso: row.codigo_curso,
      nombre: row.nombre,
      precio: parseFloat(row.precio),
      duracion_horas: row.duracion_horas,
      nivel: row.nivel
    }));

    // 6. Distribución de estudiantes por nivel
    const distribucionNivelResult = await pool.query(
      `SELECT
         tc.nivel,
         COUNT(DISTINCT ti.usuario_id) as cantidad_estudiantes,
         COUNT(DISTINCT tc.id_curso) as cantidad_cursos,
         ROUND(COUNT(DISTINCT ti.usuario_id) * 100.0 / (SELECT COUNT(DISTINCT usuario_id) FROM t_inscripciones), 1) as porcentaje
       FROM t_cursos tc
       LEFT JOIN t_inscripciones ti ON tc.id_curso = ti.id_curso
       WHERE tc.estado = 'activo'
       GROUP BY tc.nivel
       ORDER BY cantidad_estudiantes DESC`
    );
    const distribucionNivel = distribucionNivelResult.rows.map(row => ({
      nivel: row.nivel || 'sin especificar',
      cantidad_estudiantes: parseInt(row.cantidad_estudiantes),
      cantidad_cursos: parseInt(row.cantidad_cursos),
      porcentaje: parseFloat(row.porcentaje)
    }));

    // 7. Ingresos potenciales por nivel de dificultad
    const ingresosPorNivelResult = await pool.query(
      `SELECT
         tc.nivel,
         COUNT(DISTINCT ti.usuario_id) as cantidad_estudiantes,
         SUM(tc.precio) as ingresos_potenciales,
         AVG(tc.precio) as precio_promedio
       FROM t_cursos tc
       LEFT JOIN t_inscripciones ti ON tc.id_curso = ti.id_curso
       WHERE tc.estado = 'activo'
       GROUP BY tc.nivel
       ORDER BY ingresos_potenciales DESC`
    );
    const ingresosPorNivel = ingresosPorNivelResult.rows.map(row => ({
      nivel: row.nivel || 'sin especificar',
      cantidad_estudiantes: parseInt(row.cantidad_estudiantes),
      ingresos_potenciales: parseFloat(row.ingresos_potenciales),
      precio_promedio: parseFloat(row.precio_promedio)
    }));

    // 8. Comparativa de cursos (Inscritos vs No inscritos)
    const comparativaResult = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM t_cursos WHERE estado = 'activo' AND id_curso IN (SELECT DISTINCT id_curso FROM t_inscripciones)) as cursos_con_inscritos,
         (SELECT COUNT(*) FROM t_cursos WHERE estado = 'activo' AND id_curso NOT IN (SELECT DISTINCT id_curso FROM t_inscripciones)) as cursos_sin_inscritos`
    );
    const comparativa = {
      cursos_con_inscritos: parseInt(comparativaResult.rows[0]?.cursos_con_inscritos || 0),
      cursos_sin_inscritos: parseInt(comparativaResult.rows[0]?.cursos_sin_inscritos || 0)
    };

    // 9. Tasa de conversión (Cursos con inscritos / Total de cursos)
    const tasaConversion = totalCursos > 0
      ? ((comparativa.cursos_con_inscritos / totalCursos) * 100).toFixed(1)
      : 0;

    // 10. Duración promedio de los cursos
    const duracionPromedioResult = await pool.query(
      `SELECT
         AVG(duracion_horas) as duracion_promedio,
         MIN(duracion_horas) as duracion_minima,
         MAX(duracion_horas) as duracion_maxima
       FROM t_cursos
       WHERE estado = 'activo'`
    );
    const duracionPromedio = parseFloat(duracionPromedioResult.rows[0]?.duracion_promedio) || 0;
    const duracionMinima = parseInt(duracionPromedioResult.rows[0]?.duracion_minima) || 0;
    const duracionMaxima = parseInt(duracionPromedioResult.rows[0]?.duracion_maxima) || 0;

    // Retornar respuesta completa
    res.json({
      success: true,
      data: {
        totalCursos,
        totalEstudiantes,
        totalIngresos,
        cursosMasPopulares,
        cursosNuncaComprados,
        distribucionNivel,
        ingresosPorNivel,
        comparativa,
        tasaConversion,
        duracionPromedio,
        duracionMinima,
        duracionMaxima
      }
    });
  } catch (error) {
    console.error('Error en obtenerEstadisticasDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del dashboard',
      error: error.message
    });
  }
};

/**
 * Obtener resumen rápido de cursos
 */
export const obtenerResumenCursos = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM t_cursos WHERE estado = 'activo') as total_cursos,
         (SELECT COUNT(DISTINCT usuario_id) FROM t_inscripciones) as total_estudiantes,
         (SELECT COUNT(*) FROM t_cursos WHERE estado = 'activo' AND id_curso IN (SELECT DISTINCT id_curso FROM t_inscripciones)) as cursos_con_inscritos,
         (SELECT COUNT(*) FROM t_cursos WHERE estado = 'activo' AND id_curso NOT IN (SELECT DISTINCT id_curso FROM t_inscripciones)) as cursos_sin_inscritos,
         (SELECT COALESCE(SUM(precio), 0) FROM t_cursos WHERE estado = 'activo') as ingresos_potenciales`
    );

    const data = resultado.rows[0];
    res.json({
      success: true,
      data: {
        totalCursos: parseInt(data.total_cursos),
        totalEstudiantes: parseInt(data.total_estudiantes),
        cursosConInscritos: parseInt(data.cursos_con_inscritos),
        cursosSinInscritos: parseInt(data.cursos_sin_inscritos),
        ingresosPotenciales: parseFloat(data.ingresos_potenciales)
      }
    });
  } catch (error) {
    console.error('Error en obtenerResumenCursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de cursos'
    });
  }
};
