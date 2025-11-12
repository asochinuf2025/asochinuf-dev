import express from 'express';
import { verificarToken } from '../middleware/auth.js';
import {
  obtenerCuotas,
  crearCuota,
  editarCuota,
  eliminarCuota,
  obtenerResumenCuotas,
  obtenerCuotaById,
  registrarPagoCuota,
  obtenerPagosCuota,
  obtenerEstadisticas,
  obtenerCuotasGlobales,
  obtenerTodosLosUsuarios,
  repararSecuenciaCuotas
} from '../controllers/cuotasController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener cuotas del usuario actual (o todas si es admin)
router.get('/', obtenerCuotas);

// Obtener resumen de cuotas para notificaciones
router.get('/resumen', obtenerResumenCuotas);

// Obtener solo cuotas globales (admin) - para mantenedor
router.get('/globales/todas', obtenerCuotasGlobales);

// Obtener todos los usuarios (admin y nutricionista) - para la tabla
router.get('/usuarios/todos', obtenerTodosLosUsuarios);

// Obtener estadísticas generales (admin)
router.get('/estadisticas/general', obtenerEstadisticas);

// Obtener una cuota por ID
router.get('/:id', obtenerCuotaById);

// Crear/actualizar cuota (admin)
router.post('/', crearCuota);

// Editar cuota (admin)
router.put('/:id', editarCuota);

// Eliminar cuota (admin)
router.delete('/:id', eliminarCuota);

// Registrar pago de cuota
router.post('/:cuotaId/pagos', registrarPagoCuota);

// Obtener historial de pagos de una cuota
router.get('/:cuotaId/pagos', obtenerPagosCuota);

// Reparar secuencia de cuotas (admin) - si hay error de duplicate key
router.post('/admin/reparar-secuencia', repararSecuenciaCuotas);

export default router;
