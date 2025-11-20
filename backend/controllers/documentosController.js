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
      CREATE TABLE IF NOT EXISTS t_eventos (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        archivo_contenido BYTEA NOT NULL,
        archivo_nombre VARCHAR(255) NOT NULL,
        archivo_tipo VARCHAR(100) NOT NULL,
        archivo_tamaño INTEGER,
        miniatura BYTEA,
        categoria VARCHAR(100),
        fecha_evento DATE,
        hora_evento TIME,
        ubicacion VARCHAR(500),
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP DEFAULT NOW(),
        visible BOOLEAN DEFAULT true,
        usuario_creacion INTEGER REFERENCES t_usuarios(id) ON DELETE SET NULL
      );
    `);

    // Crear índices
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON t_eventos(categoria);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_eventos_visible ON t_eventos(visible);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_eventos_fecha_creacion ON t_eventos(fecha_creacion);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_eventos_fecha_evento ON t_eventos(fecha_evento);`);

    res.json({ mensaje: 'Tabla t_eventos inicializada correctamente' });
  } catch (error) {
    console.error('Error al inicializar tabla:', error);
    res.status(500).json({
      error: 'Error al inicializar tabla',
      detail: error.message
    });
  }
};

// Obtener todos los eventos visibles (SIN contenido binario, solo metadatos y miniatura)
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
        d.fecha_evento,
        d.hora_evento,
        d.ubicacion,
        d.expositores,
        d.fecha_creacion,
        d.fecha_actualizacion,
        d.visible,
        u.nombre,
        u.apellido
      FROM t_eventos d
      LEFT JOIN t_usuarios u ON d.usuario_creacion = u.id
      WHERE d.visible = true
    `;

    const params = [];

    if (categoria && categoria !== 'todas') {
      query += ` AND d.categoria = $1`;
      params.push(categoria);
    }

    query += ` ORDER BY d.fecha_evento DESC NULLS LAST, d.fecha_creacion DESC`;

    const result = await pool.query(query, params);

    // Convertir miniatura BYTEA a base64 si existe
    const documentos = result.rows.map(doc => {
      let miniatura = null;
      if (doc.miniatura) {
        try {
          // doc.miniatura already comes as Buffer from postgres
          const bufferData = Buffer.isBuffer(doc.miniatura) ? doc.miniatura : Buffer.from(doc.miniatura);
          miniatura = bufferData.toString('base64');
        } catch (e) {
          console.error('Error converting miniatura to base64:', e);
        }
      }
      return {
        ...doc,
        miniatura: miniatura
      };
    });

    res.json({
      documentos,
      total: documentos.length
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({
      error: 'Error al obtener eventos',
      detail: error.message
    });
  }
};

// Obtener evento completo por ID (para descargar)
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
        d.fecha_evento,
        d.hora_evento,
        d.ubicacion,
        d.expositores,
        d.fecha_creacion,
        d.fecha_actualizacion,
        d.visible,
        u.nombre,
        u.apellido
      FROM t_eventos d
      LEFT JOIN t_usuarios u ON d.usuario_creacion = u.id
      WHERE d.id = $1 AND d.visible = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const doc = result.rows[0];

    // Si es una solicitud de descarga, servir el archivo como attachment
    if (req.query.download === 'true') {
      res.setHeader('Content-Type', doc.archivo_tipo);
      res.setHeader('Content-Disposition', `attachment; filename="${doc.archivo_nombre}"`);
      res.send(doc.archivo_contenido);
    } else if (req.query.preview === 'true') {
      // Si es una solicitud de preview (para PDF viewer), enviar el archivo como inline
      res.setHeader('Content-Type', doc.archivo_tipo);
      res.setHeader('Content-Disposition', `inline; filename="${doc.archivo_nombre}"`);
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
        fecha_evento: doc.fecha_evento,
        hora_evento: doc.hora_evento,
        ubicacion: doc.ubicacion,
        expositores: doc.expositores,
        fecha_creacion: doc.fecha_creacion,
        fecha_actualizacion: doc.fecha_actualizacion,
        usuario: {
          nombre: doc.nombre,
          apellido: doc.apellido
        }
      });
    }
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({
      error: 'Error al obtener evento',
      detail: error.message
    });
  }
};

// Obtener categorías disponibles
export const obtenerCategorias = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT categoria FROM t_eventos
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

// Crear nuevo evento (admin y nutricionista solo)
// Espera: titulo, descripcion, archivo_base64, archivo_nombre, archivo_tipo, categoria, fecha_evento, hora_evento, ubicacion, expositores
export const crearDocumento = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      archivo_base64,
      archivo_nombre,
      archivo_tipo,
      categoria,
      fecha_evento,
      hora_evento,
      ubicacion,
      expositores
    } = req.body;
    const usuarioId = req.usuario?.id;

    // Validar que el usuario sea admin o nutricionista
    if (req.usuario?.tipo_perfil !== 'admin' && req.usuario?.tipo_perfil !== 'nutricionista') {
      return res.status(403).json({ error: 'No tienes permiso para crear eventos' });
    }

    if (!titulo || !archivo_base64 || !archivo_nombre) {
      return res.status(400).json({
        error: 'Título, archivo y nombre son requeridos'
      });
    }

    // Convertir base64 a Buffer
    const archivoBuffer = Buffer.from(archivo_base64.split(',')[1] || archivo_base64, 'base64');

    // Generar miniatura automáticamente
    const miniaturaBuffer = await generarMiniatura(archivoBuffer, archivo_tipo, archivo_nombre);

    const result = await pool.query(
      `INSERT INTO t_eventos (
        titulo,
        descripcion,
        archivo_contenido,
        archivo_nombre,
        archivo_tipo,
        archivo_tamaño,
        miniatura,
        categoria,
        fecha_evento,
        hora_evento,
        ubicacion,
        expositores,
        usuario_creacion,
        visible
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
       RETURNING id, titulo, descripcion, archivo_nombre, archivo_tipo, archivo_tamaño, categoria, fecha_evento, hora_evento, ubicacion, expositores, fecha_creacion`,
      [
        titulo,
        descripcion || null,
        archivoBuffer,
        archivo_nombre,
        archivo_tipo || 'application/octet-stream',
        archivoBuffer.length,
        miniaturaBuffer,
        categoria || null,
        fecha_evento || null,
        hora_evento || null,
        ubicacion || null,
        expositores || null,
        usuarioId
      ]
    );

    res.status(201).json({
      mensaje: 'Evento creado exitosamente',
      documento: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({
      error: 'Error al crear evento',
      detail: error.message
    });
  }
};

// Actualizar evento (admin y nutricionista solo)
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
      fecha_evento,
      hora_evento,
      ubicacion,
      expositores,
      visible
    } = req.body;

    // Validar que el usuario sea admin o nutricionista
    if (req.usuario?.tipo_perfil !== 'admin' && req.usuario?.tipo_perfil !== 'nutricionista') {
      return res.status(403).json({ error: 'No tienes permiso para actualizar eventos' });
    }

    // Verificar que el evento existe
    const existing = await pool.query(
      'SELECT * FROM t_eventos WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Preparar valores para actualizar
    let updateQuery = `UPDATE t_eventos SET fecha_actualizacion = NOW()`;
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

    if (categoria !== undefined) {
      updateQuery += `, categoria = $${paramCount}`;
      params.push(categoria || null);
      paramCount++;
    }

    if (fecha_evento !== undefined) {
      updateQuery += `, fecha_evento = $${paramCount}`;
      params.push(fecha_evento || null);
      paramCount++;
    }

    if (hora_evento !== undefined) {
      updateQuery += `, hora_evento = $${paramCount}`;
      params.push(hora_evento || null);
      paramCount++;
    }

    if (ubicacion !== undefined) {
      updateQuery += `, ubicacion = $${paramCount}`;
      params.push(ubicacion || null);
      paramCount++;
    }

    if (expositores !== undefined) {
      updateQuery += `, expositores = $${paramCount}`;
      params.push(expositores || null);
      paramCount++;
    }

    if (visible !== undefined) {
      updateQuery += `, visible = $${paramCount}`;
      params.push(visible);
      paramCount++;
    }

    updateQuery += ` WHERE id = $${paramCount} RETURNING id, titulo, descripcion, archivo_nombre, archivo_tipo, archivo_tamaño, categoria, fecha_evento, hora_evento, ubicacion, expositores, fecha_actualizacion`;
    params.push(id);

    const result = await pool.query(updateQuery, params);

    res.json({
      mensaje: 'Evento actualizado exitosamente',
      documento: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({
      error: 'Error al actualizar evento',
      detail: error.message
    });
  }
};

// Eliminar evento (admin solo)
export const eliminarDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el usuario sea admin
    if (req.usuario?.tipo_perfil !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden eliminar eventos' });
    }

    // Verificar que el evento existe
    const existing = await pool.query(
      'SELECT * FROM t_eventos WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    await pool.query(
      'DELETE FROM t_eventos WHERE id = $1',
      [id]
    );

    res.json({ mensaje: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({
      error: 'Error al eliminar evento',
      detail: error.message
    });
  }
};
