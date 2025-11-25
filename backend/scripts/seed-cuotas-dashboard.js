import pool from '../config/database.js';

const seedCuotasDashboard = async () => {
  try {
    console.log('🌱 Iniciando seed de datos para cuotas dashboard...\n');

    // 1. Obtener usuarios nutricionistas y admin
    console.log('📍 Obteniendo usuarios...');
    const usuariosResult = await pool.query(
      `SELECT id, email, tipo_perfil FROM t_usuarios
       WHERE tipo_perfil IN ('nutricionista', 'admin')
       ORDER BY tipo_perfil`
    );

    const usuarios = usuariosResult.rows;
    const nutricionistas = usuarios.filter(u => u.tipo_perfil === 'nutricionista');
    const admins = usuarios.filter(u => u.tipo_perfil === 'admin');

    console.log(`✓ Nutricionistas encontrados: ${nutricionistas.length}`);
    console.log(`✓ Administradores encontrados: ${admins.length}`);

    if (usuarios.length === 0) {
      throw new Error('No hay usuarios en la base de datos. Ejecuta npm run db:init primero.');
    }

    // 2. Crear cuotas mensuales si no existen
    console.log('\n📍 Creando cuotas mensuales...');
    const cuotasData = [
      { mes: 9, ano: 2024, monto: 60000, fechaVencimiento: '2024-09-28', descripcion: 'Cuota septiembre 2024' },
      { mes: 10, ano: 2024, monto: 65000, fechaVencimiento: '2024-10-28', descripcion: 'Cuota octubre 2024' },
      { mes: 11, ano: 2024, monto: 70000, fechaVencimiento: '2024-11-28', descripcion: 'Cuota noviembre 2024' },
      { mes: 12, ano: 2024, monto: 75000, fechaVencimiento: '2024-12-28', descripcion: 'Cuota diciembre 2024' },
      { mes: 1, ano: 2025, monto: 60000, fechaVencimiento: '2025-01-28', descripcion: 'Cuota enero 2025' },
      { mes: 2, ano: 2025, monto: 65000, fechaVencimiento: '2025-02-28', descripcion: 'Cuota febrero 2025' },
    ];

    const cuotasIds = [];
    for (const cuota of cuotasData) {
      const result = await pool.query(
        `INSERT INTO t_cuotas_mensuales (mes, ano, monto, fecha_vencimiento, descripcion)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (mes, ano) DO UPDATE SET monto = $3, fecha_vencimiento = $4, descripcion = $5
         RETURNING id`,
        [cuota.mes, cuota.ano, cuota.monto, cuota.fechaVencimiento, cuota.descripcion]
      );
      cuotasIds.push(result.rows[0].id);
      console.log(`✓ Cuota ${cuota.mes}/${cuota.ano}: CLP ${cuota.monto}`);
    }

    // 3. Asignar cuotas a usuarios
    console.log('\n📍 Asignando cuotas a usuarios...');
    let asignacionesCount = 0;
    for (const cuotaId of cuotasIds) {
      for (const usuario of usuarios) {
        await pool.query(
          `INSERT INTO t_cuotas_usuario (usuario_id, cuota_id, estado)
           VALUES ($1, $2, 'pendiente')
           ON CONFLICT (usuario_id, cuota_id) DO NOTHING`,
          [usuario.id, cuotaId]
        );
        asignacionesCount++;
      }
    }
    console.log(`✓ ${asignacionesCount} asignaciones de cuotas creadas`);

    // 4. Registrar pagos (simular algunos usuarios pagando)
    console.log('\n📍 Registrando pagos...');

    // Obtener todas las asignaciones
    const asignacionesResult = await pool.query(
      `SELECT cu.id, cu.usuario_id, cu.cuota_id, cm.monto
       FROM t_cuotas_usuario cu
       JOIN t_cuotas_mensuales cm ON cu.cuota_id = cm.id`
    );

    const asignaciones = asignacionesResult.rows;
    let pagosCount = 0;
    let actualizacionesEstado = 0;

    // Simular que ~70% de las cuotas están pagadas
    for (let i = 0; i < asignaciones.length; i++) {
      const asignacion = asignaciones[i];
      const random = Math.random();

      if (random < 0.7) {
        // Crear pago
        const metodosPago = ['mercado_pago', 'transferencia', 'efectivo'];
        const metodoPago = metodosPago[Math.floor(Math.random() * metodosPago.length)];

        const fechaPago = new Date();
        fechaPago.setDate(fechaPago.getDate() - Math.floor(Math.random() * 20));

        await pool.query(
          `INSERT INTO t_pagos_cuotas (cuota_usuario_id, monto_pagado, metodo_pago, estado_pago, fecha_pago)
           VALUES ($1, $2, $3, 'completado', $4)
           RETURNING id`,
          [asignacion.id, asignacion.monto, metodoPago, fechaPago.toISOString().split('T')[0]]
        );

        // Actualizar estado de cuota a pagado
        await pool.query(
          `UPDATE t_cuotas_usuario SET estado = 'pagado' WHERE id = $1`,
          [asignacion.id]
        );

        pagosCount++;
        actualizacionesEstado++;
      }
    }
    console.log(`✓ ${pagosCount} pagos registrados`);
    console.log(`✓ ${actualizacionesEstado} cuotas marcadas como pagadas`);

    // 5. Simular morosos (cuotas vencidas no pagadas)
    console.log('\n📍 Identificando morosos (pendientes/vencidas)...');
    const morososResult = await pool.query(
      `SELECT COUNT(DISTINCT usuario_id) as cantidad
       FROM t_cuotas_usuario
       WHERE estado IN ('pendiente', 'vencido')`
    );
    console.log(`✓ Usuarios morosos: ${morososResult.rows[0].cantidad}`);

    // 6. Estadísticas finales
    console.log('\n📍 Generando estadísticas finales...');

    const statsResult = await pool.query(
      `SELECT
         COUNT(DISTINCT CASE WHEN cu.estado = 'pagado' THEN cu.id END) as cuotas_pagadas,
         COUNT(DISTINCT CASE WHEN cu.estado IN ('pendiente', 'vencido') THEN cu.id END) as cuotas_pendientes,
         SUM(CASE WHEN pc.estado_pago = 'completado' THEN pc.monto_pagado ELSE 0 END) as total_ingresos
       FROM t_cuotas_usuario cu
       LEFT JOIN t_pagos_cuotas pc ON cu.id = pc.cuota_usuario_id`
    );

    const stats = statsResult.rows[0];
    console.log(`\n📊 ESTADÍSTICAS FINALES:`);
    console.log(`   - Cuotas pagadas: ${stats.cuotas_pagadas || 0}`);
    console.log(`   - Cuotas pendientes: ${stats.cuotas_pendientes || 0}`);
    console.log(`   - Total ingresos: CLP ${(stats.total_ingresos || 0).toLocaleString('es-CL')}`);

    console.log('\n✅ Seed de cuotas completado correctamente');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al cargar datos:', error.message);
    process.exit(1);
  }
};

seedCuotasDashboard();
