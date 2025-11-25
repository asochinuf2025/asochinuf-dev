import express from 'express';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';
import {
  obtenerEstadisticasDashboard,
  obtenerResumenCursos
} from '../controllers/cursosDashboardController.js';

const router = express.Router();

// Obtener estadísticas completas del dashboard de cursos (solo admin)
router.get('/estadisticas', verificarToken, verificarAdmin, obtenerEstadisticasDashboard);

// Obtener resumen rápido de cursos
router.get('/resumen', verificarToken, obtenerResumenCursos);

export default router;
