import express from 'express';
import { verificarToken } from '../middleware/auth.js';
import { subirImagenCloudinary, eliminarImagenCloudinary } from '../services/cloudinaryService.js';
import pool from '../config/database.js';

const router = express.Router();

/**
 * POST /api/cloudinary/upload-perfil
 * Subir foto de perfil a Cloudinary
 */
router.post('/upload-perfil', verificarToken, async (req, res) => {
  try {
    const { imagenBase64 } = req.body;
    const usuarioId = req.usuario.id;

    if (!imagenBase64) {
      return res.status(400).json({ error: 'Imagen requerida' });
    }

    // Subir a Cloudinary
    const resultado = await subirImagenCloudinary(
      imagenBase64,
      'asochinuf/perfiles',
      `usuario-${usuarioId}`
    );

    // Guardar URL en la base de datos
    await pool.query(
      'UPDATE t_usuarios SET foto = $1 WHERE id = $2',
      [resultado.url, usuarioId]
    );

    console.log(`✅ Foto de usuario ${usuarioId} actualizada en BD: ${resultado.url}`);

    res.json({
      success: true,
      url: resultado.url,
      publicId: resultado.publicId,
      mensaje: 'Foto de perfil actualizada exitosamente',
      foto: resultado.url, // Incluir la URL para actualizar el contexto
    });
  } catch (error) {
    console.error('Error en upload-perfil:', error);
    res.status(500).json({
      error: error.message || 'Error al subir imagen de perfil',
    });
  }
});

/**
 * POST /api/cloudinary/upload-curso
 * Subir foto de portada de curso a Cloudinary
 * Requiere: autenticación y rol admin/nutricionista
 */
router.post('/upload-curso', verificarToken, async (req, res) => {
  try {
    const { imagenBase64, cursoId } = req.body;

    if (!imagenBase64 || !cursoId) {
      return res.status(400).json({ error: 'Imagen y cursoId requeridos' });
    }

    // Verificar permisos (solo admin o nutricionista)
    if (!['admin', 'nutricionista'].includes(req.usuario.tipo_perfil)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Subir a Cloudinary
    const resultado = await subirImagenCloudinary(
      imagenBase64,
      'asochinuf/cursos',
      `curso-${cursoId}`
    );

    // Guardar URL en la base de datos
    await pool.query(
      'UPDATE t_cursos SET imagen_portada = $1 WHERE id_curso = $2',
      [resultado.url, cursoId]
    );

    console.log(`✅ Imagen del curso ${cursoId} actualizada en BD: ${resultado.url}`);

    res.json({
      success: true,
      url: resultado.url,
      publicId: resultado.publicId,
      mensaje: 'Foto de curso actualizada exitosamente',
      imagen_portada: resultado.url, // Incluir la URL para actualizar el estado del formulario
    });
  } catch (error) {
    console.error('Error en upload-curso:', error);
    res.status(500).json({
      error: error.message || 'Error al subir imagen de curso',
    });
  }
});

/**
 * POST /api/cloudinary/upload-documento
 * Subir documento (PDF, Word, etc) a Cloudinary
 * Requiere: autenticación y rol admin/nutricionista
 */
router.post('/upload-documento', verificarToken, async (req, res) => {
  try {
    const { imagen, nombrePublico } = req.body;

    if (!imagen || !nombrePublico) {
      return res.status(400).json({ error: 'Documento y nombre requeridos' });
    }

    // Verificar permisos (solo admin o nutricionista)
    if (!['admin', 'nutricionista'].includes(req.usuario.tipo_perfil)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Subir a Cloudinary con resource_type auto para soportar documentos
    const resultado = await subirImagenCloudinary(
      imagen,
      'asochinuf/documentos',
      `doc-${Date.now()}-${nombrePublico}`
    );

    console.log(`✅ Documento subido correctamente: ${resultado.url}`);

    res.json({
      success: true,
      url: resultado.url,
      publicId: resultado.publicId,
      urlOriginal: resultado.urlOriginal,
      mensaje: 'Documento subido exitosamente',
    });
  } catch (error) {
    console.error('Error en upload-documento:', error);
    res.status(500).json({
      error: error.message || 'Error al subir documento',
    });
  }
});

/**
 * DELETE /api/cloudinary/delete
 * Eliminar imagen de Cloudinary
 */
router.delete('/delete', verificarToken, async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'publicId requerido' });
    }

    const resultado = await eliminarImagenCloudinary(publicId);

    res.json({
      success: true,
      mensaje: resultado.resultado,
    });
  } catch (error) {
    console.error('Error en delete:', error);
    res.status(500).json({
      error: error.message || 'Error al eliminar imagen',
    });
  }
});

export default router;
