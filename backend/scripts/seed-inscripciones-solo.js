import pool from '../config/database.js';

const seedInscripciones = async () => {
  try {
    console.log('🌱 Iniciando seed de inscripciones...\n');

    // 2. Crear inscripciones (10 + 2 para admin)
    // Usuarios disponibles: 2, 3 (admin), 4, 5, 6
    const inscripciones = [
      // Usuario 2: 3 inscripciones
      { usuario_id: 2, id_curso: 2, fecha_inscripcion: new Date(Date.now() - 60*24*60*60*1000) },
      { usuario_id: 2, id_curso: 3, fecha_inscripcion: new Date(Date.now() - 45*24*60*60*1000) },
      { usuario_id: 2, id_curso: 4, fecha_inscripcion: new Date(Date.now() - 30*24*60*60*1000) },
      // Usuario 4: 2 inscripciones
      { usuario_id: 4, id_curso: 5, fecha_inscripcion: new Date(Date.now() - 50*24*60*60*1000) },
      { usuario_id: 4, id_curso: 6, fecha_inscripcion: new Date(Date.now() - 20*24*60*60*1000) },
      // Usuario 5: 2 inscripciones
      { usuario_id: 5, id_curso: 7, fecha_inscripcion: new Date(Date.now() - 40*24*60*60*1000) },
      { usuario_id: 5, id_curso: 8, fecha_inscripcion: new Date(Date.now() - 15*24*60*60*1000) },
      // Usuario 6: 3 inscripciones
      { usuario_id: 6, id_curso: 9, fecha_inscripcion: new Date(Date.now() - 55*24*60*60*1000) },
      { usuario_id: 6, id_curso: 2, fecha_inscripcion: new Date(Date.now() - 25*24*60*60*1000) },
      { usuario_id: 6, id_curso: 3, fecha_inscripcion: new Date(Date.now() - 10*24*60*60*1000) },
      // Admin (Usuario 3): 2 inscripciones adicionales
      { usuario_id: 3, id_curso: 4, fecha_inscripcion: new Date(Date.now() - 35*24*60*60*1000) },
      { usuario_id: 3, id_curso: 7, fecha_inscripcion: new Date(Date.now() - 5*24*60*60*1000) }
    ];

    let contadorInscripciones = 0;
    for (const inscripcion of inscripciones) {
      try {
        const result = await pool.query(
          `INSERT INTO t_inscripciones (usuario_id, id_curso, fecha_inscripcion, estado)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [inscripcion.usuario_id, inscripcion.id_curso, inscripcion.fecha_inscripcion, 'activa']
        );
        contadorInscripciones++;
      } catch (err) {
        console.warn(`⚠️ Error al crear inscripción para usuario ${inscripcion.usuario_id} en curso ${inscripcion.id_curso}: ${err.message}`);
      }
    }
    console.log(`✓ ${contadorInscripciones} inscripciones creadas`);

    console.log('✅ Seed de inscripciones completado exitosamente');
    console.log(`
    📊 Resumen:
    - 12 inscripciones creadas (10 + 2 para admin)
    - Distribución: Usuario 2 (3), Usuario 4 (2), Usuario 5 (2), Usuario 6 (3), Admin/Usuario 3 (2)
    `);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed de inscripciones:', err.message);
    process.exit(1);
  }
};

seedInscripciones();
