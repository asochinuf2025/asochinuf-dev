import express from 'express';
import {
  obtenerDocumentos,
  obtenerDocumentoPorId,
  obtenerCategorias,
  crearDocumento,
  actualizarDocumento,
  eliminarDocumento,
  inicializarTabla,
  regenerarMiniaturas
} from '../controllers/documentosController.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (lectura)
router.get('/', obtenerDocumentos);
router.get('/categorias', obtenerCategorias);
router.get('/:id', obtenerDocumentoPorId);

// Rutas protegidas (escritura - admin y nutricionista)
router.post('/', verificarToken, crearDocumento);
router.put('/:id', verificarToken, actualizarDocumento);
router.delete('/:id', verificarToken, verificarAdmin, eliminarDocumento);

// Ruta de inicialización (solo admin)
router.post('/admin/init-table', verificarToken, verificarAdmin, inicializarTabla);

// Ruta para regenerar miniaturas (solo admin)
router.post('/admin/regenerar-miniaturas', verificarToken, verificarAdmin, regenerarMiniaturas);

export default router;
