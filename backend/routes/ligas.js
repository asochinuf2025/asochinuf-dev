import express from 'express';
import {
  obtenerLigas,
  obtenerLigasPorCategoria,
  crearLiga,
  actualizarLiga,
  eliminarLiga,
  obtenerCategoriasDelPlantel,
  obtenerLigasDelPlantelCategoria,
  asignarCategoriaPlantel,
  desasignarCategoriaPlantel,
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  obtenerPlantelesAsignados,
  obtenerConteoPlantelPorCategoria
} from '../controllers/plantelCategoriaLigaController.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';

const router = express.Router();

// ========== LIGAS ==========

// Obtener todas las ligas
router.get('/', verificarToken, obtenerLigas);

// Obtener ligas por categoría
router.get('/categoria/:categoriaId', verificarToken, obtenerLigasPorCategoria);

// Crear liga (admin)
router.post('/', verificarAdmin, crearLiga);

// Actualizar liga (admin)
router.put('/:id', verificarAdmin, actualizarLiga);

// Eliminar liga (admin)
router.delete('/:id', verificarAdmin, eliminarLiga);

// ========== CATEGORÍAS ==========

// Obtener todas las categorías
router.get('/categorias/todas', verificarToken, obtenerCategorias);

// Crear categoría (admin)
router.post('/categorias', verificarAdmin, crearCategoria);

// Actualizar categoría (admin)
router.put('/categorias/:id', verificarAdmin, actualizarCategoria);

// Eliminar categoría (admin)
router.delete('/categorias/:id', verificarAdmin, eliminarCategoria);

// ========== RELACIONES PLANTEL-CATEGORÍA-LIGA ==========

// Obtener categorías disponibles para un plantel
router.get('/plantel/:plantelId/categorias', verificarToken, obtenerCategoriasDelPlantel);

// Obtener ligas para una combinación plantel-categoría
router.get('/plantel/:plantelId/categoria/:categoriaId/ligas', verificarToken, obtenerLigasDelPlantelCategoria);

// Asignar categoría a plantel (admin)
router.post('/plantel/categoria/asignar', verificarAdmin, asignarCategoriaPlantel);

// Desasignar categoría de plantel (admin)
router.delete('/plantel/:plantelId/categoria/:categoriaId', verificarAdmin, desasignarCategoriaPlantel);

// Obtener planteles asignados a una categoría (admin)
router.get('/plantel/categoria/:categoriaId/asignados', verificarAdmin, obtenerPlantelesAsignados);

// Obtener conteo de planteles por categoría
router.get('/categorias/conteo/planteles', verificarToken, obtenerConteoPlantelPorCategoria);

export default router;
