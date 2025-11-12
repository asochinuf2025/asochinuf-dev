import pool from '../config/database.js';
import { crearPreferenciaPago, verificarEstadoPago } from '../services/mercadoPagoService.js';

/**
 * Crear iniciador de pago para una cuota
 */
export const iniciarPagoCuota = async (req, res) => {
  try {
    const { cuotaUsuarioId } = req.body;
    const usuarioId = req.usuario.id;

    if (!cuotaUsuarioId) {
      return res.status(400).json({ error: 'cuotaUsuarioId es requerido' });
    }

    // Obtener la cuota usuario y sus datos relacionados
    const cuotaResult = await pool.query(
      `SELECT cu.*, cm.mes, cm.ano, cm.monto, cm.fecha_vencimiento, cm.descripcion,
              u.nombre, u.apellido, u.email
       FROM t_cuotas_usuario cu
       JOIN t_cuotas_mensuales cm ON cu.cuota_id = cm.id
       JOIN t_usuarios u ON cu.usuario_id = u.id
       WHERE cu.id = $1`,
      [cuotaUsuarioId]
    );

    if (cuotaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    const cuota = cuotaResult.rows[0];

    // Validar que el usuario sea el propietario de la cuota
    if (cuota.usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso para pagar esta cuota' });
    }

    // Si ya está pagada, retornar error
    if (cuota.estado === 'pagado') {
      return res.status(400).json({ error: 'Esta cuota ya ha sido pagada' });
    }

    // Crear preferencia de pago con el ID de cuota_usuario
    const preferencia = await crearPreferenciaPago(
      {
        id: cuota.id, // ID de t_cuotas_usuario
        mes: cuota.mes,
        ano: cuota.ano,
        monto: cuota.monto,
        fecha_vencimiento: cuota.fecha_vencimiento
      },
      {
        nombre: cuota.nombre,
        apellido: cuota.apellido,
        email: cuota.email
      }
    );

    res.json({
      message: 'Preferencia de pago creada',
      data: preferencia
    });
  } catch (error) {
    console.error('Error en iniciarPagoCuota:', error);
    res.status(500).json({ error: 'Error al iniciar pago' });
  }
};

/**
 * Webhook para notificaciones de Mercado Pago
 */
export const webhookMercadoPago = async (req, res) => {
  try {
    const { action, data, type } = req.body;

    // Validar que sea una notificación de pago completado
    if (type !== 'payment') {
      return res.status(200).json({ message: 'Notificación recibida' });
    }

    if (action !== 'payment.created' && action !== 'payment.updated') {
      return res.status(200).json({ message: 'Acción no procesada' });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return res.status(400).json({ error: 'ID de pago no encontrado' });
    }

    // Verificar estado del pago
    const paymentStatus = await verificarEstadoPago(paymentId);

    if (paymentStatus.status !== 'approved') {
      return res.status(200).json({ message: 'Pago no aprobado' });
    }

    // Extraer ID de cuota_usuario del external_reference
    const externalRef = paymentStatus.external_reference;
    const cuotaUsuarioIdMatch = externalRef?.match(/cuota-(\d+)/);

    if (!cuotaUsuarioIdMatch || !cuotaUsuarioIdMatch[1]) {
      return res.status(400).json({ error: 'No se pudo extraer ID de cuota' });
    }

    const cuotaUsuarioId = parseInt(cuotaUsuarioIdMatch[1]);

    // Obtener cuota_usuario y datos relacionados
    const cuotaResult = await pool.query(
      `SELECT cu.*, cm.monto
       FROM t_cuotas_usuario cu
       JOIN t_cuotas_mensuales cm ON cu.cuota_id = cm.id
       WHERE cu.id = $1`,
      [cuotaUsuarioId]
    );

    if (cuotaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    const cuota = cuotaResult.rows[0];

    // Verificar si ya existe un pago con este ID de Mercado Pago
    const existingPaymentResult = await pool.query(
      `SELECT id FROM t_pagos_cuotas WHERE id_mercado_pago = $1`,
      [paymentId]
    );

    // Si ya existe, no duplicar el registro
    if (existingPaymentResult.rows.length === 0) {
      // Registrar el pago solo si no existe
      await pool.query(
        `INSERT INTO t_pagos_cuotas
         (cuota_usuario_id, monto_pagado, metodo_pago, id_mercado_pago,
          estado_pago, fecha_pago)
         VALUES ($1, $2, 'mercado_pago', $3, 'completado', NOW())`,
        [cuotaUsuarioId, cuota.monto, paymentId]
      );
    }

    // Actualizar estado de cuota_usuario a pagada
    await pool.query(
      `UPDATE t_cuotas_usuario SET estado = 'pagado' WHERE id = $1`,
      [cuotaUsuarioId]
    );

    res.json({ message: 'Pago procesado exitosamente' });
  } catch (error) {
    console.error('Error en webhookMercadoPago:', error);
    res.status(500).json({ error: 'Error al procesar webhook' });
  }
};

/**
 * Obtener estado de pago (para verificación)
 */
export const obtenerEstadoPago = async (req, res) => {
  try {
    const { cuotaId } = req.params;
    const usuarioId = req.usuario.id;

    // Verificar que el usuario tenga acceso (cuotaId aquí es cuota_usuario_id)
    const cuotaResult = await pool.query(
      `SELECT usuario_id FROM t_cuotas_usuario WHERE id = $1`,
      [cuotaId]
    );

    if (cuotaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    if (cuotaResult.rows[0].usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    // Obtener pago más reciente
    const pagoResult = await pool.query(
      `SELECT * FROM t_pagos_cuotas WHERE cuota_usuario_id = $1 ORDER BY fecha_pago DESC LIMIT 1`,
      [cuotaId]
    );

    if (pagoResult.rows.length === 0) {
      return res.json({ estado: 'sin_pago' });
    }

    const pago = pagoResult.rows[0];
    res.json({
      estado: pago.estado_pago,
      monto: pago.monto_pagado,
      fecha: pago.fecha_pago,
      idMercadoPago: pago.id_mercado_pago
    });
  } catch (error) {
    console.error('Error en obtenerEstadoPago:', error);
    res.status(500).json({ error: 'Error al obtener estado de pago' });
  }
};
