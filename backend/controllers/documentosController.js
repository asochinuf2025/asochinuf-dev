import pool from '../config/database.js';
import { generarMiniatura } from '../services/pdfService.js';

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

// Obtener todos los documentos visibles (SIN contenido binario, solo metadatos y miniatura)
export const obtenerDocumentos = async (req, res) => {
  try {
    const { categoria } = req.query;

    let query = `
      SELECT
        d.id,
        d.titulo,
        d.descripcion,
        d.archivo_nombre,
        d.archivo_tipo,
        d.archivo_tamaño,
        d.miniatura,
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

    // Convertir miniatura BYTEA a base64 si existe
    const documentos = result.rows.map(doc => ({
      ...doc,
      miniatura: doc.miniatura ? Buffer.from(doc.miniatura).toString('base64') : null
    }));

    res.json({
      documentos,
      total: documentos.length
    });
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({
      error: 'Error al obtener documentos',
      detail: error.message
    });
  }
};

// Obtener documento completo por ID (para descargar)
export const obtenerDocumentoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        d.id,
        d.titulo,
        d.descripcion,
        d.archivo_contenido,
        d.archivo_nombre,
        d.archivo_tipo,
        d.archivo_tamaño,
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

    const doc = result.rows[0];

    // Si es una solicitud de descarga, servir el archivo
    if (req.query.download === 'true') {
      res.setHeader('Content-Type', doc.archivo_tipo);
      res.setHeader('Content-Disposition', `attachment; filename="${doc.archivo_nombre}"`);
      res.send(doc.archivo_contenido);
    } else {
      // Si es una solicitud de metadatos, no enviar el contenido binario
      res.json({
        id: doc.id,
        titulo: doc.titulo,
        descripcion: doc.descripcion,
        archivo_nombre: doc.archivo_nombre,
        archivo_tipo: doc.archivo_tipo,
        archivo_tamaño: doc.archivo_tamaño,
        categoria: doc.categoria,
        fecha_creacion: doc.fecha_creacion,
        fecha_actualizacion: doc.fecha_actualizacion,
        usuario: {
          nombre: doc.nombre,
          apellido: doc.apellido
        }
      });
    }
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
// Espera: titulo, descripcion, archivo_base64, archivo_nombre, archivo_tipo, categoria, miniatura_base64
export const crearDocumento = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      archivo_base64,
      archivo_nombre,
      archivo_tipo,
      categoria,
      miniatura_base64
    } = req.body;
    const usuarioId = req.usuario?.id;

    // Validar que el usuario sea admin o nutricionista
    if (req.usuario?.tipo_perfil !== 'admin' && req.usuario?.tipo_perfil !== 'nutricionista') {
      return res.status(403).json({ error: 'No tienes permiso para crear documentos' });
    }

    if (!titulo || !archivo_base64 || !archivo_nombre) {
      return res.status(400).json({
        error: 'Título, archivo y nombre son requeridos'
      });
    }

    // Convertir base64 a Buffer
    const archivoBuffer = Buffer.from(archivo_base64.split(',')[1] || archivo_base64, 'base64');

    // Generar miniatura automáticamente si no se proporciona
    let miniaturaBuffer = null;
    if (miniatura_base64) {
      miniaturaBuffer = Buffer.from(miniatura_base64.split(',')[1] || miniatura_base64, 'base64');
    } else {
      // Generar miniatura automáticamente desde el PDF
      miniaturaBuffer = await generarMiniatura(archivoBuffer, archivo_tipo, archivo_nombre);
    }

    const result = await pool.query(
      `INSERT INTO t_documentos (
        titulo,
        descripcion,
        archivo_contenido,
        archivo_nombre,
        archivo_tipo,
        archivo_tamaño,
        miniatura,
        categoria,
        usuario_creacion,
        visible
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
       RETURNING id, titulo, descripcion, archivo_nombre, archivo_tipo, archivo_tamaño, categoria, fecha_creacion`,
      [
        titulo,
        descripcion || null,
        archivoBuffer,
        archivo_nombre,
        archivo_tipo || 'application/octet-stream',
        archivoBuffer.length,
        miniaturaBuffer,
        categoria || null,
        usuarioId
      ]
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
    const {
      titulo,
      descripcion,
      archivo_base64,
      archivo_nombre,
      archivo_tipo,
      categoria,
      visible,
      miniatura_base64
    } = req.body;

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

    // Preparar valores para actualizar
    let updateQuery = `UPDATE t_documentos SET fecha_actualizacion = NOW()`;
    const params = [];
    let paramCount = 1;

    if (titulo) {
      updateQuery += `, titulo = $${paramCount}`;
      params.push(titulo);
      paramCount++;
    }

    if (descripcion !== undefined) {
      updateQuery += `, descripcion = $${paramCount}`;
      params.push(descripcion || null);
      paramCount++;
    }

    if (archivo_base64) {
      const archivoBuffer = Buffer.from(archivo_base64.split(',')[1] || archivo_base64, 'base64');
      updateQuery += `, archivo_contenido = $${paramCount}, archivo_tamaño = $${paramCount + 1}`;
      params.push(archivoBuffer, archivoBuffer.length);
      paramCount += 2;

      if (archivo_nombre) {
        updateQuery += `, archivo_nombre = $${paramCount}`;
        params.push(archivo_nombre);
        paramCount++;
      }

      if (archivo_tipo) {
        updateQuery += `, archivo_tipo = $${paramCount}`;
        params.push(archivo_tipo);
        paramCount++;
      }
    }

    if (miniatura_base64) {
      const miniaturaBuffer = Buffer.from(miniatura_base64.split(',')[1] || miniatura_base64, 'base64');
      updateQuery += `, miniatura = $${paramCount}`;
      params.push(miniaturaBuffer);
      paramCount++;
    }

    if (categoria !== undefined) {
      updateQuery += `, categoria = $${paramCount}`;
      params.push(categoria || null);
      paramCount++;
    }

    if (visible !== undefined) {
      updateQuery += `, visible = $${paramCount}`;
      params.push(visible);
      paramCount++;
    }

    updateQuery += ` WHERE id = $${paramCount} RETURNING id, titulo, descripcion, archivo_nombre, archivo_tipo, archivo_tamaño, categoria, fecha_actualizacion`;
    params.push(id);

    const result = await pool.query(updateQuery, params);

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
