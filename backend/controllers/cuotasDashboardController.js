import pool from '../config/database.js';

/**
 * Obtener todas las estadísticas para el dashboard de cuotas
 */
export const obtenerEstadisticasDashboard = async (req, res) => {
  try {
    // 1. Contar nutricionistas
    const nutricionistasResult = await pool.query(
      `SELECT COUNT(DISTINCT usuario_id) as cantidad
       FROM t_cuotas_usuario
       WHERE usuario_id IN (SELECT id FROM t_usuarios WHERE tipo_perfil = 'nutricionista')`
    );
    const totalNutricionistas = nutricionistasResult.rows[0]?.cantidad || 0;

    // 2. Contar administradores
    const adminsResult = await pool.query(
      `SELECT COUNT(*) as cantidad FROM t_usuarios WHERE tipo_perfil = 'admin'`
    );
    const totalAdmins = adminsResult.rows[0]?.cantidad || 0;

    // 3. Contar cuotas pagadas
    const cuotasPagadasResult = await pool.query(
      `SELECT COUNT(*) as cantidad FROM t_cuotas_usuario WHERE estado = 'pagado'`
    );
    const cuotasPagadas = cuotasPagadasResult.rows[0]?.cantidad || 0;

    // 4. Total de ingresos
    const ingresosResult = await pool.query(
      `SELECT SUM(monto_pagado) as total FROM t_pagos_cuotas WHERE estado_pago = 'completado'`
    );
    const totalIngresos = parseFloat(ingresosResult.rows[0]?.total) || 0;

    // 5. Contar morosos (usuarios con cuotas pendientes/vencidas)
    const morosasResult = await pool.query(
      `SELECT COUNT(DISTINCT usuario_id) as cantidad
       FROM t_cuotas_usuario
       WHERE estado IN ('pendiente', 'vencido')`
    );
    const totalMorosos = morosasResult.rows[0]?.cantidad || 0;

    // 6. Monto total por pagar
    const montoPorPagarResult = await pool.query(
      `SELECT COALESCE(SUM(cm.monto), 0) as total
       FROM t_cuotas_usuario cu
       JOIN t_cuotas_mensuales cm ON cu.cuota_id = cm.id
       WHERE cu.estado IN ('pendiente', 'vencido')`
    );
    const montoPorPagar = parseFloat(montoPorPagarResult.rows[0]?.total) || 0;

    // 7. Distribución por estado (para gráfico de torta)
    const estadoDistribucionResult = await pool.query(
      `SELECT
         estado,
         COUNT(*) as cantidad,
         ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM t_cuotas_usuario), 1) as porcentaje
       FROM t_cuotas_usuario
       GROUP BY estado
       ORDER BY cantidad DESC`
    );
    const estadoCuotas = estadoDistribucionResult.rows.map(row => ({
      estado: row.estado,
      cantidad: parseInt(row.cantidad),
      porcentaje: parseFloat(row.porcentaje)
    }));

    // 8. Ingresos por mes (para gráfico de barras)
    const ingresosPorMesResult = await pool.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', pc.fecha_pago), 'YYYY-MM') as mes,
         SUM(pc.monto_pagado) as ingresos
       FROM t_pagos_cuotas pc
       WHERE pc.estado_pago = 'completado'
       GROUP BY DATE_TRUNC('month', pc.fecha_pago)
       ORDER BY DATE_TRUNC('month', pc.fecha_pago) DESC
       LIMIT 12`
    );

    // Formatear datos de ingresos por mes
    const ingresosPorMes = ingresosPorMesResult.rows.map(row => ({
      mes: row.mes,
      mes_nombre: formatearMes(row.mes),
      ingresos: parseFloat(row.ingresos)
    })).reverse();

    // 9. Pagadores vs morosos (para gráfico de dona)
    // Obtener usuarios únicos y su estado de morosidad
    const pagadoresResult = await pool.query(
      `WITH usuario_estado AS (
        SELECT
          cu.usuario_id,
          MAX(CASE WHEN cu.estado IN ('pendiente', 'vencido') THEN 1 ELSE 0 END) as es_moroso
        FROM t_cuotas_usuario cu
        GROUP BY cu.usuario_id
      )
      SELECT
        COUNT(CASE WHEN es_moroso = 0 THEN 1 END) as usuarios_pagadores,
        COUNT(CASE WHEN es_moroso = 1 THEN 1 END) as usuarios_morosos
      FROM usuario_estado`
    );
    const pagadoresMorosos = [{
      usuarios_pagadores: parseInt(pagadoresResult.rows[0]?.usuarios_pagadores) || 0,
      usuarios_morosos: parseInt(pagadoresResult.rows[0]?.usuarios_morosos) || 0
    }];

    // 10. Top 10 morosos (usuarios con mayor monto pendiente)
    const top10MorososResult = await pool.query(
      `SELECT
         tu.email as usuario_email,
         CONCAT(tu.nombre, ' ', tu.apellido) as usuario_nombre,
         COUNT(DISTINCT cu.id) as cantidad_cuotas_pendientes,
         SUM(cm.monto) as monto_pendiente
       FROM t_cuotas_usuario cu
       JOIN t_cuotas_mensuales cm ON cu.cuota_id = cm.id
       JOIN t_usuarios tu ON cu.usuario_id = tu.id
       WHERE cu.estado IN ('pendiente', 'vencido')
       GROUP BY tu.id, tu.email, tu.nombre, tu.apellido
       ORDER BY SUM(cm.monto) DESC
       LIMIT 10`
    );
    const top10Morosos = top10MorososResult.rows.map(row => ({
      usuario_nombre: row.usuario_nombre || row.usuario_email,
      usuario_email: row.usuario_email,
      cantidad_cuotas_pendientes: parseInt(row.cantidad_cuotas_pendientes),
      monto_pendiente: parseFloat(row.monto_pendiente)
    }));

    // Retornar respuesta completa
    res.json({
      success: true,
      data: {
        totalNutricionistas,
        totalAdmins,
        cuotasPagadas,
        totalIngresos,
        totalMorosos,
        montoPorPagar,
        estadoCuotas,
        ingresosPorMes,
        pagadoresMorosos,
        top10Morosos
      }
    });
  } catch (error) {
    console.error('Error en obtenerEstadisticasDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del dashboard',
      error: error.message
    });
  }
};

/**
 * Función auxiliar para formatear mes
 */
function formatearMes(mesISO) {
  if (!mesISO) return '';
  const [year, month] = mesISO.split('-');
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${meses[parseInt(month) - 1]} ${year}`;
}

/**
 * Obtener resumen rápido de cuotas (menos datos que el dashboard completo)
 */
export const obtenerResumenCuotas = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM t_cuotas_usuario WHERE estado = 'pagado') as pagadas,
         (SELECT COUNT(*) FROM t_cuotas_usuario WHERE estado = 'pendiente') as pendientes,
         (SELECT COUNT(*) FROM t_cuotas_usuario WHERE estado = 'vencido') as vencidas,
         (SELECT COALESCE(SUM(monto_pagado), 0) FROM t_pagos_cuotas WHERE estado_pago = 'completado') as total_ingresos,
         (SELECT COALESCE(SUM(cm.monto), 0) FROM t_cuotas_usuario cu JOIN t_cuotas_mensuales cm ON cu.cuota_id = cm.id WHERE cu.estado IN ('pendiente', 'vencido')) as monto_pendiente`
    );

    const data = resultado.rows[0];
    res.json({
      success: true,
      data: {
        cuotasPagadas: parseInt(data.pagadas),
        cuotasPendientes: parseInt(data.pendientes),
        cuotasVencidas: parseInt(data.vencidas),
        totalIngresos: parseFloat(data.total_ingresos),
        montoPendiente: parseFloat(data.monto_pendiente)
      }
    });
  } catch (error) {
    console.error('Error en obtenerResumenCuotas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de cuotas'
    });
  }
}
