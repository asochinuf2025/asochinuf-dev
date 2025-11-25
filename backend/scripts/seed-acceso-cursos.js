import pool from '../config/database.js';

const seedAccesoCursos = async () => {
  try {
    console.log('🌱 Iniciando seed de accesos a cursos...\n');

    // Obtener todas las inscripciones
    const inscripcionesResult = await pool.query(
      `SELECT DISTINCT usuario_id, id_curso
       FROM t_inscripciones
       ORDER BY usuario_id, id_curso`
    );

    const inscripciones = inscripcionesResult.rows;
    let accesoCreados = 0;

    for (const inscripcion of inscripciones) {
      try {
        // Obtener precio del curso
        const cursoResult = await pool.query(
          `SELECT precio FROM t_cursos WHERE id_curso = $1`,
          [inscripcion.id_curso]
        );

        const precio = cursoResult.rows[0]?.precio || 0;

        // Insertar acceso de curso
        const result = await pool.query(
          `INSERT INTO t_acceso_cursos (usuario_id, id_curso, tipo_acceso, precio_pagado, estado)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (usuario_id, id_curso) DO NOTHING
           RETURNING id`,
          [inscripcion.usuario_id, inscripcion.id_curso, 'comprado', precio, 'activo']
        );

        if (result.rows.length > 0) {
          accesoCreados++;
        }
      } catch (err) {
        console.warn(`⚠️ Error al crear acceso para usuario ${inscripcion.usuario_id} en curso ${inscripcion.id_curso}: ${err.message}`);
      }
    }

    console.log(`✓ ${accesoCreados} accesos a cursos creados`);

    console.log('\n✅ Seed de accesos a cursos completado exitosamente');
    console.log(`
    📊 Resumen:
    - ${inscripciones.length} inscripciones procesadas
    - ${accesoCreados} accesos a cursos creados
    `);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed de accesos a cursos:', err.message);
    process.exit(1);
  }
};

seedAccesoCursos();
