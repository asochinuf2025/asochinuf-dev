import pool from '../config/database.js';

// ========== LIGAS ==========

/**
 * Obtener todas las ligas
 */
export const obtenerLigas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        l.id,
        l.nombre,
        l.descripcion,
        l.orden,
        l.activo,
        l.categoria_id,
        c.nombre as categoria_nombre
      FROM t_ligas l
      JOIN t_categorias c ON l.categoria_id = c.id
      WHERE l.activo = true
      ORDER BY c.orden, l.orden
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ligas:', error);
    res.status(500).json({ error: 'Error al obtener ligas' });
  }
};

/**
 * Obtener ligas por categoría
 */
export const obtenerLigasPorCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params;

    const result = await pool.query(`
      SELECT
        id,
        nombre,
        descripcion,
        orden,
        activo,
        categoria_id
      FROM t_ligas
      WHERE categoria_id = $1 AND activo = true
      ORDER BY orden
    `, [categoriaId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ligas por categoría:', error);
    res.status(500).json({ error: 'Error al obtener ligas' });
  }
};

/**
 * Crear nueva liga (admin)
 */
export const crearLiga = async (req, res) => {
  try {
    const { nombre, categoria_id, descripcion, orden } = req.body;

    if (!nombre || !categoria_id) {
      return res.status(400).json({ error: 'Nombre y categoría son requeridos' });
    }

    const result = await pool.query(`
      INSERT INTO t_ligas (nombre, categoria_id, descripcion, orden, activo)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *
    `, [nombre, categoria_id, descripcion, orden || 0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear liga:', error);
    if (error.message.includes('unique')) {
      res.status(400).json({ error: 'Liga ya existe en esta categoría' });
    } else {
      res.status(500).json({ error: 'Error al crear liga' });
    }
  }
};

/**
 * Actualizar liga (admin)
 */
export const actualizarLiga = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, orden, activo, categoria_id } = req.body;

    const result = await pool.query(`
      UPDATE t_ligas
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          orden = COALESCE($3, orden),
          activo = COALESCE($4, activo),
          categoria_id = COALESCE($5, categoria_id)
      WHERE id = $6
      RETURNING *
    `, [nombre, descripcion, orden, activo, categoria_id, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Liga no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar liga:', error);
    res.status(500).json({ error: 'Error al actualizar liga' });
  }
};

/**
 * Eliminar liga (admin)
 */
export const eliminarLiga = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM t_ligas
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Liga no encontrada' });
    }

    res.json({ mensaje: 'Liga eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar liga:', error);
    res.status(500).json({ error: 'Error al eliminar liga' });
  }
};

// ========== RELACIÓN PLANTEL-CATEGORIA ==========

/**
 * Obtener categorías disponibles para un plantel específico
 */
export const obtenerCategoriasDelPlantel = async (req, res) => {
  try {
    const { plantelId } = req.params;

    const result = await pool.query(`
      SELECT DISTINCT
        c.id,
        c.nombre,
        c.descripcion,
        c.orden
      FROM t_categorias c
      JOIN t_plantel_categoria pc ON c.id = pc.categoria_id
      WHERE pc.plantel_id = $1 AND pc.activo = true AND c.activo = true
      ORDER BY c.orden
    `, [plantelId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías del plantel:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

/**
 * Obtener ligas disponibles para una combinación plantel-categoría
 */
export const obtenerLigasDelPlantelCategoria = async (req, res) => {
  try {
    const { plantelId, categoriaId } = req.params;

    // Verificar que la relación plantel-categoría exista
    const verificacion = await pool.query(`
      SELECT id FROM t_plantel_categoria
      WHERE plantel_id = $1 AND categoria_id = $2 AND activo = true
    `, [plantelId, categoriaId]);

    if (verificacion.rowCount === 0) {
      return res.status(404).json({ error: 'Plantel no tiene esta categoría' });
    }

    // Obtener ligas de esta categoría
    const result = await pool.query(`
      SELECT
        id,
        nombre,
        descripcion,
        orden,
        activo,
        categoria_id
      FROM t_ligas
      WHERE categoria_id = $1 AND activo = true
      ORDER BY orden
    `, [categoriaId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ligas:', error);
    res.status(500).json({ error: 'Error al obtener ligas' });
  }
};

/**
 * Asignar categoría a un plantel (admin)
 */
export const asignarCategoriaPlantel = async (req, res) => {
  try {
    // Aceptar tanto camelCase como snake_case
    const plantelId = req.body.plantelId || req.body.plantel_id;
    const categoriaId = req.body.categoriaId || req.body.categoria_id;

    if (!plantelId || !categoriaId) {
      return res.status(400).json({ error: 'Plantel y categoría son requeridos' });
    }

    const result = await pool.query(`
      INSERT INTO t_plantel_categoria (plantel_id, categoria_id, activo)
      VALUES ($1, $2, true)
      ON CONFLICT (plantel_id, categoria_id) DO UPDATE
      SET activo = true
      RETURNING *
    `, [plantelId, categoriaId]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al asignar categoría:', error);
    res.status(500).json({ error: 'Error al asignar categoría' });
  }
};

/**
 * Desasignar categoría de un plantel (admin)
 */
export const desasignarCategoriaPlantel = async (req, res) => {
  try {
    const { plantelId, categoriaId } = req.params;

    const result = await pool.query(`
      DELETE FROM t_plantel_categoria
      WHERE plantel_id = $1 AND categoria_id = $2
      RETURNING id
    `, [plantelId, categoriaId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Relación no encontrada' });
    }

    res.json({ mensaje: 'Categoría desasignada correctamente' });
  } catch (error) {
    console.error('Error al desasignar categoría:', error);
    res.status(500).json({ error: 'Error al desasignar categoría' });
  }
};

// ========== OBTENER TODAS LAS CATEGORÍAS ==========

/**
 * Obtener todas las categorías
 */
export const obtenerCategorias = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        nombre,
        descripcion,
        orden,
        activo,
        fecha_creacion
      FROM t_categorias
      WHERE activo = true
      ORDER BY orden
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

/**
 * Crear nueva categoría (admin)
 */
export const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, orden } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'Nombre es requerido' });
    }

    const result = await pool.query(`
      INSERT INTO t_categorias (nombre, descripcion, orden, activo)
      VALUES ($1, $2, $3, true)
      RETURNING *
    `, [nombre, descripcion, orden || 0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    if (error.message.includes('unique')) {
      res.status(400).json({ error: 'Categoría ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear categoría' });
    }
  }
};

/**
 * Actualizar categoría (admin)
 */
export const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, orden, activo } = req.body;

    const result = await pool.query(`
      UPDATE t_categorias
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          orden = COALESCE($3, orden),
          activo = COALESCE($4, activo)
      WHERE id = $5
      RETURNING *
    `, [nombre, descripcion, orden, activo, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

/**
 * Eliminar categoría (admin)
 */
export const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM t_categorias
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};

/**
 * Obtener planteles asignados a una categoría (admin)
 */
export const obtenerPlantelesAsignados = async (req, res) => {
  try {
    const { categoriaId } = req.params;

    const result = await pool.query(`
      SELECT
        p.id as plantel_id,
        p.nombre as plantel_nombre,
        pc.id as asignacion_id
      FROM t_plantel_categoria pc
      JOIN t_planteles p ON pc.plantel_id = p.id
      WHERE pc.categoria_id = $1 AND pc.activo = true
      ORDER BY p.nombre
    `, [categoriaId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener planteles asignados:', error);
    res.status(500).json({ error: 'Error al obtener planteles asignados' });
  }
};

/**
 * Obtener conteo de planteles asignados a cada categoría
 */
export const obtenerConteoPlantelPorCategoria = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.nombre,
        COUNT(pc.plantel_id) as planteles_count
      FROM t_categorias c
      LEFT JOIN t_plantel_categoria pc ON c.id = pc.categoria_id AND pc.activo = true
      WHERE c.activo = true
      GROUP BY c.id, c.nombre
      ORDER BY c.orden
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener conteo de planteles:', error);
    res.status(500).json({ error: 'Error al obtener conteo de planteles' });
  }
};
