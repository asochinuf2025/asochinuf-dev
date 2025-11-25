import pool from '../config/database.js';

const testQueries = async () => {
  try {
    console.log('\n=== DEBUGGIN QUERIES ===\n');

    // Query para distribución por posición
    const posicionQuery = `
      SELECT
        COALESCE(tp_pac.posicion_juego, 'Sin especificar') as posicion,
        COUNT(DISTINCT ia.paciente_id) as cantidad,
        ROUND(AVG(ia.imc)::numeric, 2) as promedio
      FROM t_informe_antropometrico ia
      JOIN t_sesion_mediciones sm ON ia.sesion_id = sm.id
      JOIN t_planteles tp ON sm.plantel_id = tp.id
      LEFT JOIN t_pacientes tp_pac ON ia.paciente_id = tp_pac.id
      GROUP BY COALESCE(tp_pac.posicion_juego, 'Sin especificar')
      ORDER BY cantidad DESC
    `;

    console.log('Query por POSICIÓN:');
    const posicionResult = await pool.query(posicionQuery);
    console.log('Resultado:', JSON.stringify(posicionResult.rows, null, 2));

    // Query para distribución por zona
    const zonaQuery = `
      SELECT
        CASE
          WHEN tp.region IN ('Región de Arica y Parinacota', 'Región de Tarapacá', 'Región de Antofagasta', 'Región de Atacama', 'Región de Coquimbo') THEN 'Norte'
          WHEN tp.region IN ('Región de Valparaíso', 'Región Metropolitana', 'Región del Libertador General Bernardo O''Higgins', 'Región del Maule') THEN 'Centro'
          WHEN tp.region IN ('Región de Ñuble', 'Región del Biobío', 'Región de La Araucanía', 'Región de Los Lagos', 'Región de Los Ríos', 'Región de Magallanes') THEN 'Sur'
          ELSE 'Otro'
        END as zona,
        COUNT(DISTINCT ia.paciente_id) as cantidad
      FROM t_informe_antropometrico ia
      JOIN t_sesion_mediciones sm ON ia.sesion_id = sm.id
      JOIN t_planteles tp ON sm.plantel_id = tp.id
      GROUP BY zona
      ORDER BY cantidad DESC
    `;

    console.log('\nQuery por ZONA:');
    const zonaResult = await pool.query(zonaQuery);
    console.log('Resultado:', JSON.stringify(zonaResult.rows, null, 2));

    // Revisar relaciones
    console.log('\n=== REVISAR RELACIONES ===\n');

    const jourCheck = `
      SELECT
        ia.id,
        ia.paciente_id,
        tp_pac.nombre,
        tp_pac.posicion_juego,
        sm.plantel_id,
        tp.nombre as plantel,
        tp.region
      FROM t_informe_antropometrico ia
      LEFT JOIN t_pacientes tp_pac ON ia.paciente_id = tp_pac.id
      JOIN t_sesion_mediciones sm ON ia.sesion_id = sm.id
      JOIN t_planteles tp ON sm.plantel_id = tp.id
      LIMIT 5
    `;

    console.log('Primeras 5 mediciones con joins:');
    const joinResult = await pool.query(jourCheck);
    console.log(JSON.stringify(joinResult.rows, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testQueries();
