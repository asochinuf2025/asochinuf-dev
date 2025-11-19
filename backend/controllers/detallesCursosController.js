import pool from '../config/database.js';
import { crearPreferenciaCurso } from '../services/mercadoPagoService.js';

/**
 * Controller para gestionar detalles de cursos
 * Incluye secciones, lecciones y control de acceso
 */

// ==================== OBTENER DETALLES ====================

/**
 * Obtener todos los detalles de un curso (con acceso verificado)
 */
export const obtenerDetallesCurso = async (req, res) => {
  try {
    const { idCurso } = req.params;
    const usuarioId = req.usuario?.id;

    // Obtener información del curso
    const cursoResult = await pool.query(
      'SELECT * FROM t_cursos WHERE id_curso = $1',
      [idCurso]
    );

    if (cursoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const curso = cursoResult.rows[0];

    // Verificar acceso del usuario al curso (si está autenticado)
    let tieneAcceso = false;
    if (usuarioId) {
      const accesoResult = await pool.query(
        'SELECT * FROM t_acceso_cursos WHERE usuario_id = $1 AND id_curso = $2 AND estado = $3',
        [usuarioId, idCurso, 'activo']
      );
      tieneAcceso = accesoResult.rows.length > 0;
    }

    // Obtener secciones y lecciones organizadas
    const detallesResult = await pool.query(
      `SELECT * FROM t_detalles_cursos
       WHERE id_curso = $1
       ORDER BY orden_seccion, orden_leccion`,
      [idCurso]
    );

    // Organizar por secciones
    const secciones = {};
    const detalles = detallesResult.rows;

    detalles.forEach(detalle => {
      if (!secciones[detalle.seccion_numero]) {
        secciones[detalle.seccion_numero] = {
          numero: detalle.seccion_numero,
          titulo: detalle.seccion_titulo,
          descripcion: detalle.seccion_descripcion,
          orden: detalle.orden_seccion,
          lecciones: []
        };
      }

      // Si el usuario no tiene acceso, bloquear contenido
      const leccion = {
        id: detalle.id,
        numero: detalle.leccion_numero,
        titulo: detalle.leccion_titulo,
        descripcion: detalle.leccion_descripcion,
        tipo: detalle.tipo_contenido,
        duracion: detalle.duracion_minutos,
        orden: detalle.orden_leccion,
        bloqueado: !tieneAcceso
      };

      // Solo incluir URL de contenido si el usuario tiene acceso
      if (tieneAcceso) {
        leccion.url = detalle.url_contenido;
        leccion.archivo = {
          nombre: detalle.archivo_nombre,
          tipo: detalle.archivo_tipo
        };
      }

      secciones[detalle.seccion_numero].lecciones.push(leccion);
    });

    // Convertir a array y ordenar
    const seccionesArray = Object.values(secciones)
      .sort((a, b) => a.orden - b.orden)
      .map(seccion => ({
        ...seccion,
        lecciones: seccion.lecciones.sort((a, b) => a.orden - b.orden)
      }));

    res.json({
      curso: {
        ...curso,
        tieneAcceso
      },
      secciones: seccionesArray,
      accesoInfo: {
        tieneAcceso,
        usuarioAutenticado: !!usuarioId
      }
    });
  } catch (error) {
    console.error('Error al obtener detalles del curso:', error);
    res.status(500).json({ error: 'Error al obtener detalles del curso' });
  }
};

/**
 * Obtener una sección específica del curso
 */
export const obtenerSeccion = async (req, res) => {
  try {
    const { idCurso, numeroSeccion } = req.params;
    const usuarioId = req.usuario?.id;

    // Verificar acceso
    let tieneAcceso = false;
    if (usuarioId) {
      const accesoResult = await pool.query(
        'SELECT * FROM t_acceso_cursos WHERE usuario_id = $1 AND id_curso = $2 AND estado = $3',
        [usuarioId, idCurso, 'activo']
      );
      tieneAcceso = accesoResult.rows.length > 0;
    }

    // Obtener lecciones de la sección
    const leccionesResult = await pool.query(
      `SELECT * FROM t_detalles_cursos
       WHERE id_curso = $1 AND seccion_numero = $2
       ORDER BY orden_leccion`,
      [idCurso, numeroSeccion]
    );

    if (leccionesResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sección no encontrada' });
    }

    const primeraLeccion = leccionesResult.rows[0];
    const seccion = {
      numero: primeraLeccion.seccion_numero,
      titulo: primeraLeccion.seccion_titulo,
      descripcion: primeraLeccion.seccion_descripcion,
      lecciones: leccionesResult.rows.map(leccion => ({
        numero: leccion.leccion_numero,
        titulo: leccion.leccion_titulo,
        descripcion: leccion.leccion_descripcion,
        tipo: leccion.tipo_contenido,
        duracion: leccion.duracion_minutos,
        orden: leccion.orden_leccion,
        bloqueado: !tieneAcceso,
        ...(tieneAcceso && {
          url: leccion.url_contenido,
          archivo: {
            nombre: leccion.archivo_nombre,
            tipo: leccion.archivo_tipo
          }
        })
      }))
    };

    res.json(seccion);
  } catch (error) {
    console.error('Error al obtener sección:', error);
    res.status(500).json({ error: 'Error al obtener la sección' });
  }
};

// ==================== CREAR/ACTUALIZAR DETALLES (ADMIN) ====================

/**
 * Crear detalle de curso (sección + leccion)
 */
export const crearDetalleCurso = async (req, res) => {
  try {
    const { idCurso } = req.params;
    const {
      seccionNumero,
      seccionTitulo,
      seccionDescripcion,
      ordenSeccion,
      leccionNumero,
      leccionTitulo,
      leccionDescripcion,
      tipoContenido,
      urlContenido,
      duracionMinutos,
      ordenLeccion,
      archivoNombre,
      archivoTipo
    } = req.body;

    // Validar campos requeridos
    if (!seccionTitulo || !leccionTitulo) {
      return res.status(400).json({ error: 'Título de sección y lección son requeridos' });
    }

    // Validar que el curso existe
    const cursoResult = await pool.query(
      'SELECT id_curso FROM t_cursos WHERE id_curso = $1',
      [idCurso]
    );

    if (cursoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    // Convertir strings vacíos a null para campos opcionales
    const urlContenidoValue = urlContenido && urlContenido.trim() ? urlContenido : null;
    const seccionDescripcionValue = seccionDescripcion && seccionDescripcion.trim() ? seccionDescripcion : null;
    const leccionDescripcionValue = leccionDescripcion && leccionDescripcion.trim() ? leccionDescripcion : null;
    const archivoNombreValue = archivoNombre && archivoNombre.trim() ? archivoNombre : null;
    const archivoTipoValue = archivoTipo && archivoTipo.trim() ? archivoTipo : null;

    // Calcular orden_leccion: si no se proporciona, usar leccion_numero
    const ordenLeccionValue = ordenLeccion || leccionNumero;

    // Crear detalle
    const result = await pool.query(
      `INSERT INTO t_detalles_cursos (
        id_curso, seccion_numero, seccion_titulo, seccion_descripcion,
        orden_seccion, leccion_numero, leccion_titulo, leccion_descripcion,
        tipo_contenido, url_contenido, duracion_minutos, orden_leccion,
        archivo_nombre, archivo_tipo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        idCurso, seccionNumero, seccionTitulo, seccionDescripcionValue,
        ordenSeccion, leccionNumero, leccionTitulo, leccionDescripcionValue,
        tipoContenido, urlContenidoValue, duracionMinutos, ordenLeccionValue,
        archivoNombreValue, archivoTipoValue
      ]
    );

    res.status(201).json({
      mensaje: 'Detalle del curso creado exitosamente',
      detalle: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear detalle:', error);
    res.status(500).json({ error: 'Error al crear el detalle del curso' });
  }
};

/**
 * Actualizar detalle de curso
 */
export const actualizarDetalleCurso = async (req, res) => {
  try {
    const { idCurso, detalleId } = req.params;

    if (!detalleId || detalleId === 'undefined') {
      return res.status(400).json({ error: 'ID de detalle no válido' });
    }

    // Convertir camelCase a snake_case
    const updates = {};
    const fieldMap = {
      'seccionNumero': 'seccion_numero',
      'seccionTitulo': 'seccion_titulo',
      'seccionDescripcion': 'seccion_descripcion',
      'ordenSeccion': 'orden_seccion',
      'leccionNumero': 'leccion_numero',
      'leccionTitulo': 'leccion_titulo',
      'leccionDescripcion': 'leccion_descripcion',
      'tipoContenido': 'tipo_contenido',
      'urlContenido': 'url_contenido',
      'duracionMinutos': 'duracion_minutos',
      'ordenLeccion': 'orden_leccion',
      'archivoNombre': 'archivo_nombre',
      'archivoTipo': 'archivo_tipo'
    };

    Object.keys(req.body).forEach(key => {
      const dbKey = fieldMap[key] || key;
      updates[dbKey] = req.body[key];
    });

    const allowedFields = [
      'seccion_numero', 'seccion_titulo', 'seccion_descripcion',
      'orden_seccion', 'leccion_numero', 'leccion_titulo', 'leccion_descripcion',
      'tipo_contenido', 'url_contenido', 'duracion_minutos', 'orden_leccion',
      'archivo_nombre', 'archivo_tipo'
    ];

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(detalleId);
    values.push(idCurso);

    const query = `
      UPDATE t_detalles_cursos
      SET ${fields.join(', ')}, fecha_actualizacion = NOW()
      WHERE id = $${paramCount} AND id_curso = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Detalle no encontrado' });
    }

    res.json({
      mensaje: 'Detalle actualizado exitosamente',
      detalle: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar detalle:', error);
    res.status(500).json({ error: 'Error al actualizar el detalle' });
  }
};

/**
 * Eliminar detalle de curso
 */
export const eliminarDetalleCurso = async (req, res) => {
  try {
    const { idCurso, detalleId } = req.params;

    const result = await pool.query(
      'DELETE FROM t_detalles_cursos WHERE id = $1 AND id_curso = $2 RETURNING id',
      [detalleId, idCurso]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Detalle no encontrado' });
    }

    res.json({ mensaje: 'Detalle eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar detalle:', error);
    res.status(500).json({ error: 'Error al eliminar el detalle' });
  }
};

// ==================== ACCESO A CURSOS ====================

/**
 * Verificar si el usuario tiene acceso al curso
 */
export const verificarAccesoCurso = async (req, res) => {
  try {
    const { idCurso } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.json({ tieneAcceso: false, mensaje: 'No autenticado' });
    }

    const result = await pool.query(
      `SELECT * FROM t_acceso_cursos
       WHERE usuario_id = $1 AND id_curso = $2 AND estado = $3`,
      [usuarioId, idCurso, 'activo']
    );

    const tieneAcceso = result.rows.length > 0;

    res.json({
      tieneAcceso,
      acceso: tieneAcceso ? result.rows[0] : null
    });
  } catch (error) {
    console.error('Error al verificar acceso:', error);
    res.status(500).json({ error: 'Error al verificar acceso' });
  }
};

/**
 * Otorgar acceso al curso (después del pago)
 */
export const otorgarAccesoCurso = async (req, res) => {
  try {
    const { usuarioId, idCurso, tipoAcceso, precioPagado, referenciaPago } = req.body;
    const usuarioAutenticadoId = req.usuario?.id;

    // Verificar que el usuario autenticado es el mismo que solicita acceso
    if (!usuarioAutenticadoId || usuarioAutenticadoId !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso para otorgar acceso a ese usuario' });
    }

    // Verificar que el usuario existe
    const usuarioResult = await pool.query(
      'SELECT id FROM t_usuarios WHERE id = $1',
      [usuarioId]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que el curso existe
    const cursoResult = await pool.query(
      'SELECT id_curso FROM t_cursos WHERE id_curso = $1',
      [idCurso]
    );

    if (cursoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    // Crear acceso (o actualizar si existe)
    const accesoResult = await pool.query(
      `INSERT INTO t_acceso_cursos (
        usuario_id, id_curso, tipo_acceso, precio_pagado, referencia_pago
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (usuario_id, id_curso)
      DO UPDATE SET
        tipo_acceso = $3,
        precio_pagado = $4,
        referencia_pago = $5,
        estado = 'activo',
        fecha_acceso = NOW()
      RETURNING *`,
      [usuarioId, idCurso, tipoAcceso, precioPagado, referenciaPago]
    );

    // También crear inscripción en t_inscripciones para mantener compatibilidad
    try {
      await pool.query(
        `INSERT INTO t_inscripciones (usuario_id, id_curso, estado)
         VALUES ($1, $2, 'activa')
         ON CONFLICT (usuario_id, id_curso)
         DO NOTHING`,
        [usuarioId, idCurso]
      );
    } catch (error) {
      // Si falla la inscripción, no es crítico
      console.log('Inscripción ya existe o no es necesaria:', error.message);
    }

    res.status(201).json({
      mensaje: 'Acceso al curso otorgado exitosamente',
      acceso: accesoResult.rows[0]
    });
  } catch (error) {
    console.error('Error al otorgar acceso:', error);
    res.status(500).json({ error: 'Error al otorgar acceso al curso' });
  }
};

/**
 * Obtener cursos a los que el usuario tiene acceso
 */
export const obtenerCursosAccesibles = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const result = await pool.query(
      `SELECT c.*, a.fecha_acceso, a.tipo_acceso, a.precio_pagado
       FROM t_cursos c
       INNER JOIN t_acceso_cursos a ON c.id_curso = a.id_curso
       WHERE a.usuario_id = $1 AND a.estado = $2
       ORDER BY a.fecha_acceso DESC`,
      [usuarioId, 'activo']
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener cursos accesibles:', error);
    res.status(500).json({ error: 'Error al obtener cursos accesibles' });
  }
};

/**
 * Iniciar pago para compra de curso (Mercado Pago)
 */
export const iniciarPagoCurso = async (req, res) => {
  try {
    const { idCurso } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Obtener datos del curso
    const cursoResult = await pool.query(
      'SELECT * FROM t_cursos WHERE id_curso = $1',
      [idCurso]
    );

    if (cursoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const curso = cursoResult.rows[0];

    // Verificar si el usuario ya tiene acceso
    const accesoResult = await pool.query(
      'SELECT * FROM t_acceso_cursos WHERE usuario_id = $1 AND id_curso = $2 AND estado = $3',
      [usuarioId, idCurso, 'activo']
    );

    if (accesoResult.rows.length > 0) {
      return res.status(400).json({ error: 'Ya tienes acceso a este curso' });
    }

    // Obtener datos del usuario
    const usuarioResult = await pool.query(
      'SELECT id, nombre, apellido, email FROM t_usuarios WHERE id = $1',
      [usuarioId]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarioResult.rows[0];

    // Crear preferencia de pago en Mercado Pago
    const preferencia = await crearPreferenciaCurso(curso, usuario);

    res.json({
      mensaje: 'Preferencia de pago creada',
      data: preferencia
    });
  } catch (error) {
    console.error('Error al iniciar pago de curso:', error);
    res.status(500).json({ error: 'Error al iniciar pago del curso' });
  }
};
