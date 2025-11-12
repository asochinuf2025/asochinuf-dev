import express from 'express';
import { verificarToken } from '../middleware/auth.js';
import {
  iniciarPagoCuota,
  webhookMercadoPago,
  obtenerEstadoPago
} from '../controllers/pagosController.js';

const router = express.Router();

// Endpoint público para obtener Public Key de Mercado Pago
// No requiere autenticación ya que la Public Key es información pública
router.get('/public-key', (req, res) => {
  const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY;

  if (!publicKey) {
    return res.status(500).json({
      error: 'Public Key de Mercado Pago no configurada',
      fallback: 'APP_USR-fb0f565e-a4a8-4102-94f8-bd91b6a87cd7' // Sandbox para fallback
    });
  }

  res.json({ public_key: publicKey });
});

// Webhook no requiere autenticación (es llamado por Mercado Pago)
router.post('/webhook', webhookMercadoPago);

// Rutas protegidas
router.use(verificarToken);

// Iniciar pago de cuota
router.post('/iniciar', iniciarPagoCuota);

// Obtener estado de pago
router.get('/estado/:cuotaId', obtenerEstadoPago);

export default router;
