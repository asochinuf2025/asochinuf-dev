import express from 'express';
import {
  obtenerDetallesCurso,
  obtenerSeccion,
  crearDetalleCurso,
  actualizarDetalleCurso,
  eliminarDetalleCurso,
  verificarAccesoCurso,
  otorgarAccesoCurso,
  obtenerCursosAccesibles,
  iniciarPagoCurso
} from '../controllers/detallesCursosController.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';

const router = express.Router();

// ==================== OBTENER DETALLES (público/privado) ====================

/**
 * GET /api/detalles-cursos/:idCurso
 * Obtener todos los detalles de un curso
 */
router.get('/:idCurso', obtenerDetallesCurso);

/**
 * GET /api/detalles-cursos/:idCurso/seccion/:numeroSeccion
 * Obtener una sección específica
 */
router.get('/:idCurso/seccion/:numeroSeccion', obtenerSeccion);

/**
 * GET /api/detalles-cursos/:idCurso/acceso
 * Verificar acceso del usuario al curso
 */
router.get('/:idCurso/acceso', verificarToken, verificarAccesoCurso);

/**
 * GET /api/detalles-cursos/mis-cursos
 * Obtener todos los cursos a los que el usuario tiene acceso
 */
router.get('/mis-cursos', verificarToken, obtenerCursosAccesibles);

// ==================== CREAR/ACTUALIZAR DETALLES (ADMIN) ====================

/**
 * POST /api/detalles-cursos/:idCurso
 * Crear detalle de curso (sección + lección)
 */
router.post('/:idCurso', verificarToken, verificarAdmin, crearDetalleCurso);

/**
 * PUT /api/detalles-cursos/:idCurso/:detalleId
 * Actualizar detalle de curso
 */
router.put('/:idCurso/:detalleId', verificarToken, verificarAdmin, actualizarDetalleCurso);

/**
 * DELETE /api/detalles-cursos/:idCurso/:detalleId
 * Eliminar detalle de curso
 */
router.delete('/:idCurso/:detalleId', verificarToken, verificarAdmin, eliminarDetalleCurso);

// ==================== ACCESO A CURSOS ====================

/**
 * POST /api/detalles-cursos/acceso/otorgar
 * Otorgar acceso al curso (después del pago)
 */
router.post('/acceso/otorgar', verificarToken, otorgarAccesoCurso);

/**
 * POST /api/detalles-cursos/:idCurso/pago
 * Iniciar pago para compra de curso (Mercado Pago)
 */
router.post('/:idCurso/pago', verificarToken, iniciarPagoCurso);

export default router;
