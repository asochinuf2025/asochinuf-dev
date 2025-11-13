import express from 'express';
import {
  registro,
  login,
  obtenerPerfil,
  logout,
  solicitarRecuperacion,
  verificarToken as verificarTokenRecuperacion,
  restablecerContrasena,
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarContrasena,
  actualizarFoto
} from '../controllers/authController.js';
import { loginConGoogle } from '../controllers/googleAuthController.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';
import uploadFoto from '../middleware/uploadFoto.js';

const router = express.Router();

// Autenticación básica
router.post('/registro', registro);
router.post('/login', login);
router.post('/google', loginConGoogle);
router.post('/logout', logout);
router.get('/me', verificarToken, obtenerPerfil);

// Recuperación de contraseña
router.post('/solicitar-recuperacion', solicitarRecuperacion);
router.get('/verificar-token/:token', verificarTokenRecuperacion);
router.post('/restablecer-contrasena', restablecerContrasena);

// Gestión de usuarios (solo admin)
router.get('/usuarios', verificarAdmin, obtenerUsuarios);
router.post('/usuarios', verificarAdmin, crearUsuario);
router.put('/usuarios/:id', verificarAdmin, actualizarUsuario);
router.delete('/usuarios/:id', verificarAdmin, eliminarUsuario);

// Perfil de usuario
router.post('/cambiar-contrasena', verificarToken, cambiarContrasena);
router.post('/actualizar-foto', verificarToken, uploadFoto.single('foto'), actualizarFoto);

export default router;
