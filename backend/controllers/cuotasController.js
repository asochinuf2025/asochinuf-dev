import pool from '../config/database.js';

/**
 * Obtener todas las cuotas (admin y nutricionistas)
 * Para el usuario actual:
 * - Admin: ve todas las cuotas globales y su estado con todos los usuarios
 * - Nutricionista: ve todas las cuotas y su estado personal
 */
export const obtenerCuotas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const tipoUsuario = req.usuario.tipo_perfil;

    // Actualizar automáticamente el estado de cuotas vencidas (solo pendientes)
    await pool.query(`
      UPDATE t_cuotas_usuario
      SET estado = 'vencido'
      WHERE estado = 'pendiente'
      AND cuota_id IN (
        SELECT id FROM t_cuotas_mensuales
        WHERE fecha_vencimiento < NOW()::date
      )
    `);

    if (tipoUsuario === 'nutricionista') {
      // Nutricionista ve solo sus cuotas
      const result = await pool.query(`
        SELECT
          tcm.id as cuota_id,
          tcm.mes,
          tcm.ano,
          tcm.monto,
          tcm.fecha_vencimiento,
          tcm.descripcion,
          tcu.id as cuota_usuario_id,
          tcu.usuario_id,
          tcu.estado,
          tcu.fecha_creacion,
          u.nombre,
          u.apellido,
          u.email,
          u.tipo_perfil,
          (SELECT COUNT(*) FROM t_pagos_cuotas WHERE cuota_usuario_id = tcu.id) as tiene_pago,
          (SELECT estado_pago FROM t_pagos_cuotas WHERE cuota_usuario_id = tcu.id LIMIT 1) as estado_pago,
          (SELECT fecha_pago FROM t_pagos_cuotas WHERE cuota_usuario_id = tcu.id LIMIT 1) as fecha_pago
        FROM t_cuotas_mensuales tcm
        JOIN t_cuotas_usuario tcu ON tcm.id = tcu.cuota_id
        JOIN t_usuarios u ON tcu.usuario_id = u.id
        WHERE tcu.usuario_id = $1
        ORDER BY tcm.ano DESC, tcm.mes DESC
      `, [usuarioId]);

      return res.json(result.rows);
    } else if (tipoUsuario === 'admin') {
      // Admin ve todas las cuotas y sus estados
      const result = await pool.query(`
        SELECT
          tcm.id as cuota_id,
          tcm.mes,
          tcm.ano,
          tcm.monto,
          tcm.fecha_vencimiento,
          tcm.descripcion,
          tcu.id as cuota_usuario_id,
          tcu.usuario_id,
          tcu.estado,
          tcu.fecha_creacion,
          u.nombre,
          u.apellido,
          u.email,
          u.tipo_perfil,
          (SELECT COUNT(*) FROM t_pagos_cuotas WHERE cuota_usuario_id = tcu.id) as tiene_pago,
          (SELECT estado_pago FROM t_pagos_cuotas WHERE cuota_usuario_id = tcu.id LIMIT 1) as estado_pago,
          (SELECT fecha_pago FROM t_pagos_cuotas WHERE cuota_usuario_id = tcu.id LIMIT 1) as fecha_pago
        FROM t_cuotas_mensuales tcm
        JOIN t_cuotas_usuario tcu ON tcm.id = tcu.cuota_id
        JOIN t_usuarios u ON tcu.usuario_id = u.id
        WHERE u.tipo_perfil IN ('nutricionista', 'admin')
        ORDER BY tcm.ano DESC, tcm.mes DESC, u.nombre ASC
      `);

      return res.json(result.rows);
    }

    res.status(403).json({ error: 'Acceso denegado' });
  } catch (error) {
    console.error('Error en obtenerCuotas:', error);
    res.status(500).json({ error: 'Error al obtener cuotas' });
  }
};

/**
 * Crear cuota global (admin)
 * Una vez creada, se asigna automáticamente a todos los usuarios admin y nutricionista
 */
export const crearCuota = async (req, res) => {
  try {
    const { mes, ano, monto, fechaVencimiento, descripcion } = req.body;
    const tipoUsuario = req.usuario.tipo_perfil;

    // Solo admin puede crear cuotas globales
    if (tipoUsuario !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden crear cuotas' });
    }

    // Validar datos
    if (!mes || !ano || !monto || !fechaVencimiento) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    if (mes < 1 || mes > 12) {
      return res.status(400).json({ error: 'El mes debe estar entre 1 y 12' });
    }

    // Crear la cuota global
    const cuotaResult = await pool.query(
      `INSERT INTO t_cuotas_mensuales (mes, ano, monto, fecha_vencimiento, descripcion)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (mes, ano) DO UPDATE
       SET monto = $3, fecha_vencimiento = $4, descripcion = $5
       RETURNING *`,
      [mes, ano, monto, fechaVencimiento, descripcion]
    );

    const cuotaId = cuotaResult.rows[0].id;

    // Obtener todos los usuarios nutricionista y admin
    const usuariosResult = await pool.query(
      `SELECT id FROM t_usuarios WHERE tipo_perfil IN ('nutricionista', 'admin')`
    );

    // Asignar la cuota a cada usuario
    for (const usuario of usuariosResult.rows) {
      await pool.query(
        `INSERT INTO t_cuotas_usuario (usuario_id, cuota_id, estado)
         VALUES ($1, $2, 'pendiente')
         ON CONFLICT (usuario_id, cuota_id) DO NOTHING`,
        [usuario.id, cuotaId]
      );
    }

    res.status(201).json({
      message: 'Cuota creada y asignada a todos los usuarios exitosamente',
      data: cuotaResult.rows[0],
      usuariosAsignados: usuariosResult.rows.length
    });
  } catch (error) {
    console.error('Error en crearCuota:', error);
    res.status(500).json({ error: 'Error al crear cuota' });
  }
};

/**
 * Obtener resumen de cuotas para notificaciones (usuario actual)
 */
export const obtenerResumenCuotas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const tipoUsuario = req.usuario.tipo_perfil;

    // Solo nutricionsitas y admins tienen cuotas
    if (tipoUsuario === 'cliente') {
      return res.json({
        totalPendientes: 0,
        totalVencidas: 0,
        esMoroso: false,
        cuotasMorosas: [],
        proximasAVencer: []
      });
    }

    // Actualizar automáticamente el estado de cuotas vencidas
    await pool.query(`
      UPDATE t_cuotas_usuario
      SET estado = 'vencido'
      WHERE estado = 'pendiente'
      AND cuota_id IN (
        SELECT id FROM t_cuotas_mensuales
        WHERE fecha_vencimiento < NOW()::date
      )
    `);

    // Cuotas pendientes
    const pendientes = await pool.query(
      `SELECT COUNT(*) as total FROM t_cuotas_usuario
       WHERE usuario_id = $1 AND estado IN ('pendiente', 'vencido')`,
      [usuarioId]
    );

    // Cuotas vencidas
    const vencidas = await pool.query(
      `SELECT COUNT(*) as total FROM t_cuotas_usuario tcu
       JOIN t_cuotas_mensuales tcm ON tcu.cuota_id = tcm.id
       WHERE tcu.usuario_id = $1 AND tcu.estado = 'vencido'`,
      [usuarioId]
    );

    // Detalles de cuotas morosas
    const morosas = await pool.query(
      `SELECT tcm.id, tcm.mes, tcm.ano, tcm.monto, tcm.fecha_vencimiento, tcu.estado
       FROM t_cuotas_usuario tcu
       JOIN t_cuotas_mensuales tcm ON tcu.cuota_id = tcm.id
       WHERE tcu.usuario_id = $1 AND tcu.estado IN ('pendiente', 'vencido')
       AND tcm.fecha_vencimiento < NOW()::date
       ORDER BY tcm.fecha_vencimiento ASC`,
      [usuarioId]
    );

    // Próximas a vencer (próximos 7 días)
    const proximas = await pool.query(
      `SELECT tcm.id, tcm.mes, tcm.ano, tcm.monto, tcm.fecha_vencimiento, tcu.estado
       FROM t_cuotas_usuario tcu
       JOIN t_cuotas_mensuales tcm ON tcu.cuota_id = tcm.id
       WHERE tcu.usuario_id = $1 AND tcu.estado IN ('pendiente')
       AND tcm.fecha_vencimiento BETWEEN NOW()::date AND (NOW()::date + INTERVAL '7 days')
       ORDER BY tcm.fecha_vencimiento ASC`,
      [usuarioId]
    );

    res.json({
      totalPendientes: parseInt(pendientes.rows[0].total),
      totalVencidas: parseInt(vencidas.rows[0].total),
      esMoroso: parseInt(vencidas.rows[0].total) > 0,
      cuotasMorosas: morosas.rows,
      proximasAVencer: proximas.rows
    });
  } catch (error) {
    console.error('Error en obtenerResumenCuotas:', error);
    res.status(500).json({ error: 'Error al obtener resumen de cuotas' });
  }
};

/**
 * Obtener una cuota por ID (con información del usuario)
 */
export const obtenerCuotaById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;
    const tipoUsuario = req.usuario.tipo_perfil;

    const result = await pool.query(`
      SELECT
        tcm.id as cuota_id,
        tcm.mes,
        tcm.ano,
        tcm.monto,
        tcm.fecha_vencimiento,
        tcm.descripcion,
        tcu.id as cuota_usuario_id,
        tcu.usuario_id,
        tcu.estado,
        u.nombre,
        u.apellido,
        u.email,
        u.tipo_perfil
      FROM t_cuotas_usuario tcu
      JOIN t_cuotas_mensuales tcm ON tcu.cuota_id = tcm.id
      JOIN t_usuarios u ON tcu.usuario_id = u.id
      WHERE tcu.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    const cuota = result.rows[0];

    // Nutricionista solo ve sus cuotas
    if (tipoUsuario === 'nutricionista' && cuota.usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    res.json(cuota);
  } catch (error) {
    console.error('Error en obtenerCuotaById:', error);
    res.status(500).json({ error: 'Error al obtener cuota' });
  }
};

/**
 * Registrar pago de cuota
 * Actualiza el estado de la cuota_usuario a 'pagado' y crea registro en t_pagos_cuotas
 */
export const registrarPagoCuota = async (req, res) => {
  try {
    const { cuotaUsuarioId, montoPagado, metodoPago, referenciaPago, idMercadoPago, estadoMercadoPago } = req.body;
    const usuarioId = req.usuario.id;
    const tipoUsuario = req.usuario.tipo_perfil;

    console.log('📝 Registrando pago:', { cuotaUsuarioId, montoPagado, metodoPago, referenciaPago, usuarioId, tipoUsuario });

    // Validar datos
    if (!cuotaUsuarioId || !montoPagado) {
      console.error('❌ Faltan campos: cuotaUsuarioId:', cuotaUsuarioId, 'montoPagado:', montoPagado);
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Obtener la cuota_usuario
    console.log('🔍 Buscando cuota_usuario con ID:', cuotaUsuarioId);
    const cuotaUsuarioResult = await pool.query(
      `SELECT tcu.*, tcm.monto
       FROM t_cuotas_usuario tcu
       JOIN t_cuotas_mensuales tcm ON tcu.cuota_id = tcm.id
       WHERE tcu.id = $1`,
      [cuotaUsuarioId]
    );

    if (cuotaUsuarioResult.rows.length === 0) {
      console.error('❌ Cuota no encontrada con ID:', cuotaUsuarioId);
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    console.log('✓ Cuota encontrada:', cuotaUsuarioResult.rows[0]);

    const cuotaUsuario = cuotaUsuarioResult.rows[0];

    // Validar permisos:
    // - Admin puede registrar pagos manuales para cualquier usuario
    // - Usuario normal solo puede pagar sus propias cuotas
    const esAdmin = tipoUsuario === 'admin';
    const esPropietario = cuotaUsuario.usuario_id === usuarioId;

    if (!esAdmin && !esPropietario) {
      return res.status(403).json({ error: 'No tienes permiso para registrar este pago' });
    }

    // Solo admin puede registrar pagos manuales (transferencia/efectivo)
    const esPagoManual = metodoPago === 'transferencia' || metodoPago === 'efectivo';
    if (esPagoManual && !esAdmin) {
      return res.status(403).json({ error: 'Solo administradores pueden registrar pagos manuales' });
    }

    // Validar que el monto sea correcto
    if (parseFloat(montoPagado) < parseFloat(cuotaUsuario.monto)) {
      return res.status(400).json({ error: 'El monto pagado es menor al monto de la cuota' });
    }

    // Registrar el pago
    const pagoResult = await pool.query(
      `INSERT INTO t_pagos_cuotas
       (cuota_usuario_id, monto_pagado, metodo_pago, referencia_pago,
        id_mercado_pago, estado_mercado_pago, estado_pago, fecha_pago)
       VALUES ($1, $2, $3, $4, $5, $6, 'completado', NOW())
       RETURNING *`,
      [cuotaUsuarioId, montoPagado, metodoPago || 'mercado_pago', referenciaPago || null,
       idMercadoPago || null, estadoMercadoPago || null]
    );

    // Actualizar estado de la cuota_usuario a pagado
    await pool.query(
      `UPDATE t_cuotas_usuario SET estado = 'pagado' WHERE id = $1`,
      [cuotaUsuarioId]
    );

    res.status(201).json({
      message: 'Pago registrado exitosamente',
      data: pagoResult.rows[0]
    });
  } catch (error) {
    console.error('❌ Error en registrarPagoCuota:', error.message);
    console.error('   Stack:', error.stack);
    console.error('   SQL:', error.query || 'N/A');
    res.status(500).json({
      error: 'Error al registrar pago',
      detail: error.message
    });
  }
};

/**
 * Obtener historial de pagos de una cuota_usuario
 */
export const obtenerPagosCuota = async (req, res) => {
  try {
    const { cuotaUsuarioId } = req.params;
    const usuarioId = req.usuario.id;
    const tipoUsuario = req.usuario.tipo_perfil;

    // Verificar que el usuario tenga acceso
    const cuotaUsuarioResult = await pool.query(
      `SELECT usuario_id FROM t_cuotas_usuario WHERE id = $1`,
      [cuotaUsuarioId]
    );

    if (cuotaUsuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    if (tipoUsuario === 'nutricionista' && cuotaUsuarioResult.rows[0].usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    const result = await pool.query(
      `SELECT * FROM t_pagos_cuotas WHERE cuota_usuario_id = $1 ORDER BY fecha_creacion DESC`,
      [cuotaUsuarioId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error en obtenerPagosCuota:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

/**
 * Editar cuota global (admin)
 * Se actualiza la cuota global y automáticamente se refleja en todas las asignaciones de usuarios
 */
export const editarCuota = async (req, res) => {
  try {
    const { id } = req.params;
    const { mes, ano, monto, fechaVencimiento, descripcion } = req.body;
    const tipoUsuario = req.usuario.tipo_perfil;

    // Solo admin puede editar cuotas
    if (tipoUsuario !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden editar cuotas' });
    }

    // Validar datos
    if (!mes || !ano || !monto || !fechaVencimiento) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Actualizar la cuota global
    const result = await pool.query(
      `UPDATE t_cuotas_mensuales
       SET mes = $1, ano = $2, monto = $3, fecha_vencimiento = $4, descripcion = $5
       WHERE id = $6
       RETURNING *`,
      [mes, ano, monto, fechaVencimiento, descripcion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    res.json({
      message: 'Cuota actualizada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error en editarCuota:', error);
    res.status(500).json({ error: 'Error al editar cuota' });
  }
};

/**
 * Eliminar cuota global (admin)
 * Se elimina la cuota global y todas sus asignaciones de usuarios
 */
export const eliminarCuota = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoUsuario = req.usuario.tipo_perfil;

    // Solo admin puede eliminar cuotas
    if (tipoUsuario !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden eliminar cuotas' });
    }

    // Verificar que la cuota existe y no tiene pagos
    const cuotaResult = await pool.query(
      `SELECT id FROM t_cuotas_mensuales tcm
       WHERE tcm.id = $1
       AND NOT EXISTS (
         SELECT 1 FROM t_pagos_cuotas tp
         JOIN t_cuotas_usuario tcu ON tp.cuota_usuario_id = tcu.id
         WHERE tcu.cuota_id = tcm.id
       )`,
      [id]
    );

    if (cuotaResult.rows.length === 0) {
      return res.status(400).json({ error: 'No se pueden eliminar cuotas que tienen pagos registrados' });
    }

    // Eliminar la cuota (cascada elimina t_cuotas_usuario y t_pagos_cuotas)
    await pool.query(
      `DELETE FROM t_cuotas_mensuales WHERE id = $1`,
      [id]
    );

    res.json({
      message: 'Cuota eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error en eliminarCuota:', error);
    res.status(500).json({ error: 'Error al eliminar cuota' });
  }
};

/**
 * Obtener estadísticas de cuotas (admin)
 */
export const obtenerEstadisticas = async (req, res) => {
  try {
    const tipoUsuario = req.usuario.tipo_perfil;

    if (tipoUsuario !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden ver estadísticas' });
    }

    // Total de cuotas globales
    const totalCuotas = await pool.query(
      `SELECT COUNT(*) as total, SUM(monto) as monto_total FROM t_cuotas_mensuales`
    );

    // Cuotas por estado (agregado de todos los usuarios)
    const porEstado = await pool.query(
      `SELECT tcu.estado as estado, COUNT(*) as cantidad, SUM(tcm.monto) as monto_total
       FROM t_cuotas_usuario tcu
       JOIN t_cuotas_mensuales tcm ON tcu.cuota_id = tcm.id
       GROUP BY tcu.estado`
    );

    // Usuarios con morosidad
    const morosos = await pool.query(
      `SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.tipo_perfil,
        COUNT(tcu.id) as cuotas_vencidas,
        SUM(tcm.monto) as monto_vencido
      FROM t_usuarios u
      LEFT JOIN t_cuotas_usuario tcu ON u.id = tcu.usuario_id AND tcu.estado = 'vencido'
      LEFT JOIN t_cuotas_mensuales tcm ON tcu.cuota_id = tcm.id
      WHERE u.tipo_perfil IN ('nutricionista', 'admin')
      GROUP BY u.id, u.nombre, u.apellido, u.email, u.tipo_perfil
      HAVING COUNT(tcu.id) > 0
      ORDER BY SUM(tcm.monto) DESC`
    );

    // Ingresos totales
    const ingresos = await pool.query(
      `SELECT
        SUM(monto_pagado) as total_recaudado,
        COUNT(*) as pagos_completados
      FROM t_pagos_cuotas
      WHERE estado_pago = 'completado'`
    );

    res.json({
      totalCuotas: totalCuotas.rows[0],
      cuotasPorEstado: porEstado.rows,
      usuariosConMorosidad: morosos.rows,
      recaudacion: ingresos.rows[0] || { total_recaudado: 0, pagos_completados: 0 }
    });
  } catch (error) {
    console.error('Error en obtenerEstadisticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

/**
 * Obtener solo las cuotas globales (sin información de usuarios)
 * Usado en el "Mantenedor de Cuotas" para admin
 * Estado: 'activo' si fecha_vencimiento >= hoy, 'vencido' si fecha_vencimiento < hoy
 */
export const obtenerCuotasGlobales = async (req, res) => {
  try {
    const tipoUsuario = req.usuario.tipo_perfil;

    if (tipoUsuario !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden ver cuotas globales' });
    }

    const result = await pool.query(`
      SELECT
        tcm.id,
        tcm.mes,
        tcm.ano,
        tcm.monto,
        tcm.fecha_vencimiento,
        tcm.descripcion,
        tcm.fecha_creacion,
        CASE WHEN tcm.fecha_vencimiento >= NOW()::date THEN 'activo' ELSE 'vencido' END as estado,
        (SELECT COUNT(DISTINCT usuario_id) FROM t_cuotas_usuario WHERE cuota_id = tcm.id) as usuarios_asignados,
        (SELECT COUNT(*) FROM t_cuotas_usuario WHERE cuota_id = tcm.id AND estado = 'pagado') as usuarios_pagados,
        (SELECT COUNT(*) FROM t_cuotas_usuario WHERE cuota_id = tcm.id AND estado = 'pendiente') as usuarios_pendientes
      FROM t_cuotas_mensuales tcm
      ORDER BY tcm.ano DESC, tcm.mes DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error en obtenerCuotasGlobales:', error);
    res.status(500).json({ error: 'Error al obtener cuotas globales' });
  }
};

/**
 * Obtener todos los usuarios (admin y nutricionista) para la tabla
 */
export const obtenerTodosLosUsuarios = async (req, res) => {
  try {
    const tipoUsuario = req.usuario.tipo_perfil;

    if (tipoUsuario !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden ver todos los usuarios' });
    }

    const result = await pool.query(`
      SELECT DISTINCT
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.tipo_perfil,
        u.fecha_registro
      FROM t_usuarios u
      WHERE u.tipo_perfil IN ('nutricionista', 'admin')
      ORDER BY u.nombre, u.apellido
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error en obtenerTodosLosUsuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

/**
 * Reparar secuencia de cuotas (admin only)
 * Se ejecuta si hay error "duplicate key value violates unique constraint"
 */
export const repararSecuenciaCuotas = async (req, res) => {
  try {
    const tipoUsuario = req.usuario.tipo_perfil;

    if (tipoUsuario !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden reparar la secuencia' });
    }

    console.log('🔧 Reparando secuencia de t_cuotas_mensuales...');

    // Obtener el máximo ID actual
    const result = await pool.query(`SELECT MAX(id) as max_id FROM t_cuotas_mensuales`);
    const maxId = result.rows[0].max_id || 0;

    console.log(`📊 ID máximo actual: ${maxId}`);

    // Resetear la secuencia
    await pool.query(`SELECT setval('t_cuotas_mensuales_id_seq', ${maxId + 1})`);

    console.log(`✅ Secuencia actualizada a: ${maxId + 1}`);

    res.json({
      mensaje: 'Secuencia reparada exitosamente',
      detalles: {
        maxIdAnterior: maxId,
        proximoId: maxId + 1
      }
    });
  } catch (error) {
    console.error('❌ Error reparando la secuencia:', error);
    res.status(500).json({ error: 'Error al reparar la secuencia de cuotas' });
  }
};
