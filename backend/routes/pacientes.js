import express from 'express';
import {
  obtenerPosiciones,
  obtenerPacientes,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
} from '../controllers/pacientesController.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/posiciones', obtenerPosiciones);

// Rutas protegidas (requieren autenticación)
router.get('/', verificarToken, obtenerPacientes);
router.get('/:id', verificarToken, obtenerPaciente);

// Rutas admin
router.post('/', verificarToken, verificarAdmin, crearPaciente);
router.put('/:id', verificarToken, verificarAdmin, actualizarPaciente);
router.delete('/:id', verificarToken, verificarAdmin, eliminarPaciente);

export default router;
