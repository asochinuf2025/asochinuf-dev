import pool from '../config/database.js';

/**
 * Obtener estadísticas del dashboard del cliente
 * - Cursos disponibles
 * - Mis cursos (inscripciones)
 * - Total de eventos (planteles)
 * - Próximo evento más cercano
 */
export const obtenerEstadisticasCliente = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    if (!usuarioId) {
      console.error('❌ usuarioId no definido');
      return res.status(400).json({
        success: false,
        message: 'Usuario ID no disponible',
      });
    }

    console.log('🔍 Obteniendo estadísticas para usuario:', usuarioId);

    // 1. Contar cursos disponibles (activos)
    const cursosDisponiblesResult = await pool.query(
      `SELECT COUNT(*) as total FROM t_cursos WHERE estado = $1`,
      ['activo']
    );
    const cursosDisponibles = parseInt(cursosDisponiblesResult.rows[0]?.total || 0);
    console.log('✓ Cursos disponibles contados:', cursosDisponibles);

    // 2. Obtener mis cursos (inscripciones del usuario)
    const misCursosResult = await pool.query(
      `SELECT
        c.id_curso,
        c.nombre,
        c.codigo_curso,
        c.nivel,
        c.precio,
        c.duracion_horas,
        i.fecha_inscripcion,
        i.estado as estado_inscripcion
      FROM t_inscripciones i
      JOIN t_cursos c ON i.id_curso = c.id_curso
      WHERE i.usuario_id = $1
      ORDER BY i.fecha_inscripcion DESC`,
      [usuarioId]
    );
    const misCursos = misCursosResult.rows || [];
    console.log('✓ Mis cursos obtenidos:', misCursos.length);

    // 3. Contar total de eventos visibles
    let totalEventos = 0;
    try {
      const totalEventosResult = await pool.query(
        `SELECT COUNT(*) as total FROM t_eventos WHERE visible = $1`,
        [true]
      );
      totalEventos = parseInt(totalEventosResult.rows[0]?.total || 0);
      console.log('✓ Total de eventos contados:', totalEventos);
    } catch (err) {
      console.log('⚠️ Error contando eventos (tabla puede no existir):', err.message);
      totalEventos = cursosDisponibles; // fallback
    }

    // 4. Obtener próximo evento (el evento más cercano al futuro desde hoy)
    let proximoEvento = null;
    try {
      const proximoEventoResult = await pool.query(
        `SELECT
          id,
          titulo,
          categoria,
          fecha_evento,
          hora_evento,
          ubicacion
        FROM t_eventos
        WHERE visible = $1 AND fecha_evento >= CURRENT_DATE
        ORDER BY fecha_evento ASC
        LIMIT 1`,
        [true]
      );
      proximoEvento = proximoEventoResult.rows[0] || null;
      console.log('✓ Próximo evento obtenido:', proximoEvento?.titulo || 'N/A');
    } catch (err) {
      console.log('⚠️ Error obteniendo próximo evento (tabla puede no existir):', err.message);
      proximoEvento = null;
    }

    console.log('✓ Retornando estadísticas:', {
      cursosDisponibles,
      misCursos: misCursos.length,
      totalEventos,
      proximoEvento: proximoEvento?.nombre,
    });

    // Retornar respuesta exitosa
    res.json({
      success: true,
      data: {
        cursosDisponibles,
        misCursos,
        totalEventos,
        proximoEvento,
      },
    });
  } catch (err) {
    console.error('❌ Error obteniendo estadísticas del cliente:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del cliente',
      error: err.message,
    });
  }
};
