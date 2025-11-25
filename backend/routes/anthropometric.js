import express from 'express';
import {
  getAnthropometricStats,
  getFilterOptions,
  getPlayerAnthropometricData
} from '../controllers/anthropometricController.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.get('/stats', verificarToken, getAnthropometricStats);
router.get('/filter-options', verificarToken, getFilterOptions);
router.get('/player/:paciente_id', verificarToken, getPlayerAnthropometricData);

export default router;
