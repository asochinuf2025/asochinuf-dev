import pool from '../config/database.js';

// Inicializar tabla (solo admin)
export const inicializarTabla = async (req, res) => {
  try {
    // Verificar que sea admin
    if (req.usuario?.tipo_perfil !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden inicializar la tabla' });
    }

    // Crear tabla si no existe
    await pool.query(`
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
    `);

    // Crear índices
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON t_documentos(categoria);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_documentos_visible ON t_documentos(visible);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_documentos_fecha_creacion ON t_documentos(fecha_creacion);`);

    res.json({ mensaje: 'Tabla t_documentos inicializada correctamente' });
  } catch (error) {
    console.error('Error al inicializar tabla:', error);
    res.status(500).json({
      error: 'Error al inicializar tabla',
      detail: error.message
    });
  }
};

// Obtener todos los documentos visibles
export const obtenerDocumentos = async (req, res) => {
  try {
    const { categoria } = req.query;

    let query = `
      SELECT
        d.id,
        d.titulo,
        d.descripcion,
        d.archivo_url,
        d.categoria,
        d.fecha_creacion,
        d.fecha_actualizacion,
        d.visible,
        u.nombre,
        u.apellido
      FROM t_documentos d
      LEFT JOIN t_usuarios u ON d.usuario_creacion = u.id
      WHERE d.visible = true
    `;

    const params = [];

    if (categoria && categoria !== 'todas') {
      query += ` AND d.categoria = $1`;
      params.push(categoria);
    }

    query += ` ORDER BY d.fecha_creacion DESC`;

    const result = await pool.query(query, params);

    res.json({
      documentos: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({
      error: 'Error al obtener documentos',
      detail: error.message
    });
  }
};

// Obtener documento por ID
export const obtenerDocumentoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        d.id,
        d.titulo,
        d.descripcion,
        d.archivo_url,
        d.categoria,
        d.fecha_creacion,
        d.fecha_actualizacion,
        d.visible,
        u.nombre,
        u.apellido
      FROM t_documentos d
      LEFT JOIN t_usuarios u ON d.usuario_creacion = u.id
      WHERE d.id = $1 AND d.visible = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener documento:', error);
    res.status(500).json({
      error: 'Error al obtener documento',
      detail: error.message
    });
  }
};

// Obtener categorías disponibles
export const obtenerCategorias = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT categoria FROM t_documentos
       WHERE visible = true AND categoria IS NOT NULL
       ORDER BY categoria`
    );

    const categorias = result.rows.map(row => row.categoria);

    res.json({
      categorias,
      total: categorias.length
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      error: 'Error al obtener categorías',
      detail: error.message
    });
  }
};

// Crear nuevo documento (admin y nutricionista solo)
export const crearDocumento = async (req, res) => {
  try {
    const { titulo, descripcion, archivo_url, categoria } = req.body;
    const usuarioId = req.usuario?.id;

    // Validar que el usuario sea admin o nutricionista
    if (req.usuario?.tipo_perfil !== 'admin' && req.usuario?.tipo_perfil !== 'nutricionista') {
      return res.status(403).json({ error: 'No tienes permiso para crear documentos' });
    }

    if (!titulo || !archivo_url) {
      return res.status(400).json({ error: 'Título y archivo_url son requeridos' });
    }

    const result = await pool.query(
      `INSERT INTO t_documentos (titulo, descripcion, archivo_url, categoria, usuario_creacion, visible)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [titulo, descripcion || null, archivo_url, categoria || null, usuarioId]
    );

    res.status(201).json({
      mensaje: 'Documento creado exitosamente',
      documento: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear documento:', error);
    res.status(500).json({
      error: 'Error al crear documento',
      detail: error.message
    });
  }
};

// Actualizar documento (admin y nutricionista solo)
export const actualizarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, archivo_url, categoria, visible } = req.body;

    // Validar que el usuario sea admin o nutricionista
    if (req.usuario?.tipo_perfil !== 'admin' && req.usuario?.tipo_perfil !== 'nutricionista') {
      return res.status(403).json({ error: 'No tienes permiso para actualizar documentos' });
    }

    // Verificar que el documento existe
    const existing = await pool.query(
      'SELECT * FROM t_documentos WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const result = await pool.query(
      `UPDATE t_documentos
       SET titulo = COALESCE($1, titulo),
           descripcion = COALESCE($2, descripcion),
           archivo_url = COALESCE($3, archivo_url),
           categoria = COALESCE($4, categoria),
           visible = COALESCE($5, visible),
           fecha_actualizacion = NOW()
       WHERE id = $6
       RETURNING *`,
      [titulo, descripcion, archivo_url, categoria, visible, id]
    );

    res.json({
      mensaje: 'Documento actualizado exitosamente',
      documento: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar documento:', error);
    res.status(500).json({
      error: 'Error al actualizar documento',
      detail: error.message
    });
  }
};

// Eliminar documento (admin solo)
export const eliminarDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el usuario sea admin
    if (req.usuario?.tipo_perfil !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden eliminar documentos' });
    }

    // Verificar que el documento existe
    const existing = await pool.query(
      'SELECT * FROM t_documentos WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    await pool.query(
      'DELETE FROM t_documentos WHERE id = $1',
      [id]
    );

    res.json({ mensaje: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({
      error: 'Error al eliminar documento',
      detail: error.message
    });
  }
};
