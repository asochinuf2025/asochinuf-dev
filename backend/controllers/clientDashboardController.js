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
    const usuarioId = req.usuario.id || req.usuario.usuario_id;

    console.log('🔍 Obteniendo estadísticas para usuario:', usuarioId);
    console.log('📦 req.usuario:', req.usuario);

    // 1. Contar cursos disponibles
    const cursosDisponiblesResult = await pool.query(
      `SELECT COUNT(*) as total FROM t_cursos WHERE estado = 'activo'`
    );
    const cursosDisponibles = parseInt(cursosDisponiblesResult.rows[0]?.total || 0);

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

    // 3. Contar total de eventos (planteles)
    const eventosResult = await pool.query(
      `SELECT COUNT(*) as total FROM t_planteles WHERE estado = 'activo'`
    );
    const totalEventos = parseInt(eventosResult.rows[0]?.total || 0);

    // 4. Obtener próximo evento (plantel más cercano en fecha o el primero)
    const proximoEventoResult = await pool.query(
      `SELECT
        id_plantel,
        nombre,
        descripcion,
        ubicacion,
        created_at,
        updated_at
      FROM t_planteles
      WHERE estado = 'activo'
      ORDER BY created_at ASC
      LIMIT 1`
    );
    const proximoEvento = proximoEventoResult.rows[0] || null;

    console.log('✓ Cursos disponibles:', cursosDisponibles);
    console.log('✓ Mis cursos:', misCursos.length);
    console.log('✓ Total eventos:', totalEventos);
    console.log('✓ Próximo evento:', proximoEvento?.nombre);

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
    console.error('❌ Error obteniendo estadísticas del cliente:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del cliente',
      error: err.message,
    });
  }
};
