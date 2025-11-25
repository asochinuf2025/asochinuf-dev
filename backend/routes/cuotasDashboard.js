import express from 'express';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';
import { obtenerEstadisticasDashboard, obtenerResumenCuotas } from '../controllers/cuotasDashboardController.js';

const router = express.Router();

/**
 * GET /api/cuotas-dashboard/estadisticas
 * Obtener estadísticas completas del dashboard (admin only)
 */
router.get('/estadisticas', verificarToken, verificarAdmin, obtenerEstadisticasDashboard);

/**
 * GET /api/cuotas-dashboard/resumen
 * Obtener resumen rápido (cualquier usuario autenticado)
 */
router.get('/resumen', verificarToken, obtenerResumenCuotas);

export default router;
