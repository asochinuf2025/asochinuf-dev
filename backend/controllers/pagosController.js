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
 * Webhook para notificaciones de Mercado Pago (maneja cuotas y cursos)
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

    const externalRef = paymentStatus.external_reference;
    console.log(`🔔 Webhook recibido - ExternalRef: ${externalRef}, PaymentId: ${paymentId}`);

    // ===================== PAGO DE CUOTAS =====================
    const cuotaMatch = externalRef?.match(/cuota-(\d+)/);
    if (cuotaMatch && cuotaMatch[1]) {
      const cuotaUsuarioId = parseInt(cuotaMatch[1]);

      // Obtener cuota_usuario y datos relacionados
      const cuotaResult = await pool.query(
        `SELECT cu.*, cm.monto
         FROM t_cuotas_usuario cu
         JOIN t_cuotas_mensuales cm ON cu.cuota_id = cm.id
         WHERE cu.id = $1`,
        [cuotaUsuarioId]
      );

      if (cuotaResult.rows.length === 0) {
        console.log(`⚠️  Cuota ${cuotaUsuarioId} no encontrada`);
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
        console.log(`✅ Pago de cuota ${cuotaUsuarioId} registrado`);
      }

      // Actualizar estado de cuota_usuario a pagada
      await pool.query(
        `UPDATE t_cuotas_usuario SET estado = 'pagado' WHERE id = $1`,
        [cuotaUsuarioId]
      );

      return res.json({ message: 'Pago de cuota procesado exitosamente' });
    }

    // ===================== PAGO DE CURSOS =====================
    const cursoMatch = externalRef?.match(/curso-(\d+)/);
    if (cursoMatch && cursoMatch[1]) {
      const idCurso = parseInt(cursoMatch[1]);
      const usuarioEmail = paymentStatus.payer_email;

      console.log(`💰 Pago de curso detectado - Curso: ${idCurso}, Email: ${usuarioEmail}`);

      // Obtener el usuario por email
      const usuarioResult = await pool.query(
        `SELECT id FROM t_usuarios WHERE email = $1`,
        [usuarioEmail]
      );

      if (usuarioResult.rows.length === 0) {
        console.log(`⚠️  Usuario con email ${usuarioEmail} no encontrado`);
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const usuarioId = usuarioResult.rows[0].id;

      // Obtener datos del curso
      const cursoResult = await pool.query(
        `SELECT precio FROM t_cursos WHERE id_curso = $1`,
        [idCurso]
      );

      if (cursoResult.rows.length === 0) {
        console.log(`⚠️  Curso ${idCurso} no encontrado`);
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      const curso = cursoResult.rows[0];

      // Verificar si el usuario ya tiene acceso
      const accesoExistenteResult = await pool.query(
        `SELECT id FROM t_acceso_cursos WHERE usuario_id = $1 AND id_curso = $2`,
        [usuarioId, idCurso]
      );

      // Crear o actualizar acceso al curso
      if (accesoExistenteResult.rows.length === 0) {
        // Crear nuevo acceso
        await pool.query(
          `INSERT INTO t_acceso_cursos (usuario_id, id_curso, tipo_acceso, precio_pagado, referencia_pago, estado)
           VALUES ($1, $2, 'pago', $3, $4, 'activo')`,
          [usuarioId, idCurso, paymentStatus.amount, paymentId]
        );
        console.log(`✅ Acceso al curso ${idCurso} otorgado a usuario ${usuarioId}`);
      } else {
        // Actualizar acceso existente
        await pool.query(
          `UPDATE t_acceso_cursos
           SET tipo_acceso = 'pago', precio_pagado = $1, referencia_pago = $2, estado = 'activo', fecha_acceso = NOW()
           WHERE usuario_id = $3 AND id_curso = $4`,
          [paymentStatus.amount, paymentId, usuarioId, idCurso]
        );
        console.log(`✅ Acceso al curso ${idCurso} actualizado para usuario ${usuarioId}`);
      }

      // También crear inscripción para compatibilidad
      try {
        await pool.query(
          `INSERT INTO t_inscripciones (usuario_id, id_curso, estado)
           VALUES ($1, $2, 'activa')
           ON CONFLICT (usuario_id, id_curso) DO NOTHING`,
          [usuarioId, idCurso]
        );
      } catch (error) {
        console.log('Inscripción ya existe o no es necesaria:', error.message);
      }

      return res.json({ message: 'Pago de curso procesado exitosamente' });
    }

    console.log(`⚠️  No se pudo identificar tipo de pago (cuota o curso): ${externalRef}`);
    return res.status(400).json({ error: 'Tipo de pago no identificado' });
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
