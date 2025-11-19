import pool from '../config/database.js';

/**
 * Obtener todos los cursos
 */
export const getAllCursos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id_curso,
        codigo_curso,
        nombre,
        descripcion,
        lo_que_aprenderas,
        requisitos,
        categoria_id,
        nivel,
        duracion_horas,
        modalidad,
        fecha_inicio,
        fecha_fin,
        precio,
        descuento,
        precio_final,
        moneda,
        nombre_instructor,
        imagen_portada,
        video_promocional,
        materiales,
        url_curso,
        estado,
        fecha_creacion
      FROM t_cursos
      ORDER BY fecha_creacion DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error en getAllCursos:', error);
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
};

/**
 * Obtener un curso por ID
 */
export const getCursoById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM t_cursos WHERE id_curso = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en getCursoById:', error);
    res.status(500).json({ error: 'Error al obtener el curso' });
  }
};

/**
 * Crear un nuevo curso
 */
export const createCurso = async (req, res) => {
  try {
    const {
      codigo_curso,
      nombre,
      descripcion,
      categoria_id,
      nivel,
      duracion_horas,
      modalidad,
      fecha_inicio,
      fecha_fin,
      precio,
      descuento,
      moneda,
      nombre_instructor,
      imagen_portada,
      video_promocional,
      materiales,
      url_curso,
      estado
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !codigo_curso) {
      return res.status(400).json({ error: 'nombre y codigo_curso son requeridos' });
    }

    // Handle image upload
    let imagenPortadaUrl = imagen_portada || null;
    if (req.file) {
      imagenPortadaUrl = `/foto_curso/${req.file.filename}`;
    }

    // Calculate precio_final: precio - (precio * descuento / 100)
    const precioValue = precio || 0;
    const descuentoValue = descuento || 0;
    const precioFinal = precioValue > 0 ? precioValue - (precioValue * (descuentoValue / 100)) : 0;

    const result = await pool.query(
      `INSERT INTO t_cursos
       (codigo_curso, nombre, descripcion, categoria_id, nivel, duracion_horas,
        modalidad, fecha_inicio, fecha_fin, precio, descuento, precio_final, moneda,
        nombre_instructor, imagen_portada, video_promocional,
        materiales, url_curso, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [
        codigo_curso,
        nombre,
        descripcion || null,
        categoria_id || null,
        nivel || null,
        duracion_horas || null,
        modalidad || null,
        fecha_inicio || null,
        fecha_fin || null,
        precioValue,
        descuentoValue,
        precioFinal,
        moneda || 'CLP',
        nombre_instructor || null,
        imagenPortadaUrl,
        video_promocional || null,
        materiales || null,
        url_curso || null,
        estado || 'activo'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      curso: result.rows[0]
    });
  } catch (error) {
    console.error('Error en createCurso:', error);

    if (error.message.includes('duplicate key')) {
      return res.status(409).json({ error: 'El código del curso ya existe' });
    }

    res.status(500).json({ error: 'Error al crear el curso: ' + error.message });
  }
};

/**
 * Actualizar un curso
 */
export const updateCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle image upload
    if (req.file) {
      updates.imagen_portada = `/foto_curso/${req.file.filename}`;
    }

    // If precio or descuento is being updated, recalculate precio_final
    if (updates.precio !== undefined || updates.descuento !== undefined) {
      // Get current values from database if not in updates
      const currentCurso = await pool.query(
        'SELECT precio, descuento FROM t_cursos WHERE id_curso = $1',
        [id]
      );

      if (currentCurso.rows.length === 0) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      const precioValue = updates.precio !== undefined ? updates.precio : currentCurso.rows[0].precio;
      const descuentoValue = updates.descuento !== undefined ? updates.descuento : currentCurso.rows[0].descuento;
      const precioFinal = precioValue > 0 ? precioValue - (precioValue * (descuentoValue / 100)) : 0;

      updates.precio_final = precioFinal;
    }

    // Construir query dinámicamente
    const allowedFields = [
      'codigo_curso', 'nombre', 'descripcion', 'lo_que_aprenderas', 'requisitos',
      'categoria_id', 'nivel', 'duracion_horas', 'modalidad', 'fecha_inicio', 'fecha_fin',
      'precio', 'descuento', 'precio_final', 'moneda', 'nombre_instructor',
      'imagen_portada', 'video_promocional', 'materiales', 'url_curso', 'estado'
    ];

    // Filtrar campos válidos y no vacíos
    const fields = Object.keys(updates)
      .filter(key => {
        if (!allowedFields.includes(key)) return false;
        const value = updates[key];
        // Excluir campos vacíos (string vacío, undefined)
        // Pero permitir 0, false, null explícito
        if (value === undefined) return false;
        if (typeof value === 'string' && value === '') return false;
        return true;
      });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
    }

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const values = fields.map(field => {
      const value = updates[field];
      // Convertir string vacío a NULL para ciertos campos
      if (typeof value === 'string' && value === '') {
        return null;
      }
      return value;
    });
    values.push(id);

    const result = await pool.query(
      `UPDATE t_cursos SET ${setClause} WHERE id_curso = $${fields.length + 1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    res.json({
      success: true,
      message: 'Curso actualizado exitosamente',
      curso: result.rows[0]
    });
  } catch (error) {
    console.error('Error en updateCurso:', error);
    res.status(500).json({ error: 'Error al actualizar el curso: ' + error.message });
  }
};

/**
 * Eliminar un curso (cambiar estado a inactivo)
 */
export const deleteCurso = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE t_cursos SET estado = 'inactivo' WHERE id_curso = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    res.json({
      success: true,
      message: 'Curso eliminado exitosamente',
      curso: result.rows[0]
    });
  } catch (error) {
    console.error('Error en deleteCurso:', error);
    res.status(500).json({ error: 'Error al eliminar el curso' });
  }
};

/**
 * Obtener cursos por categoría
 */
export const getCursosByCategoria = async (req, res) => {
  try {
    const { categoria_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM t_cursos WHERE categoria_id = $1 AND estado = 'activo' ORDER BY nombre`,
      [categoria_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error en getCursosByCategoria:', error);
    res.status(500).json({ error: 'Error al obtener cursos por categoría' });
  }
};

/**
 * Obtener cursos por nivel
 */
export const getCursosByNivel = async (req, res) => {
  try {
    const { nivel } = req.params;

    if (!['básico', 'intermedio', 'avanzado'].includes(nivel)) {
      return res.status(400).json({ error: 'Nivel inválido' });
    }

    const result = await pool.query(
      `SELECT * FROM t_cursos WHERE nivel = $1 AND estado = 'activo' ORDER BY nombre`,
      [nivel]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error en getCursosByNivel:', error);
    res.status(500).json({ error: 'Error al obtener cursos por nivel' });
  }
};

/**
 * Búsqueda de cursos
 */
export const searchCursos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query debe tener al menos 2 caracteres' });
    }

    const searchTerm = `%${q}%`;

    const result = await pool.query(
      `SELECT * FROM t_cursos
       WHERE estado = 'activo'
       AND (nombre ILIKE $1 OR descripcion ILIKE $1 OR codigo_curso ILIKE $1)
       ORDER BY nombre`,
      [searchTerm]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error en searchCursos:', error);
    res.status(500).json({ error: 'Error al buscar cursos' });
  }
};
