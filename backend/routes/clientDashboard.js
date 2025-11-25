import express from 'express';
import { verificarToken } from '../middleware/auth.js';
import { obtenerEstadisticasCliente } from '../controllers/clientDashboardController.js';

const router = express.Router();

// Obtener estadísticas del dashboard del cliente (solo clientes autenticados)
router.get('/estadisticas', verificarToken, obtenerEstadisticasCliente);

export default router;
