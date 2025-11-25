import pool from '../config/database.js';

const seedCursos = async () => {
  try {
    console.log('🌱 Iniciando seed de cursos e inscripciones...');

    // 1. Crear cursos
    const cursos = [
      {
        nombre: 'Nutrición Deportiva Avanzada',
        descripcion: 'Aprende los principios de nutrición aplicados al deporte de alto rendimiento',
        precio: 89900,
        duracion_horas: 40,
        nivel: 'avanzado'
      },
      {
        nombre: 'Metabolismo y Energía',
        descripcion: 'Comprende cómo funciona el metabolismo humano y optimiza la energía corporal',
        precio: 79900,
        duracion_horas: 30,
        nivel: 'intermedio'
      },
      {
        nombre: 'Planes Nutricionales Personalizados',
        descripcion: 'Diseña planes de alimentación adaptados a cada cliente',
        precio: 99900,
        duracion_horas: 50,
        nivel: 'avanzado'
      },
      {
        nombre: 'Suplementación en el Deporte',
        descripcion: 'Guía completa sobre suplementos deportivos y su uso correcto',
        precio: 69900,
        duracion_horas: 25,
        nivel: 'intermedio'
      },
      {
        nombre: 'Nutrición Pediátrica',
        descripcion: 'Especialización en nutrición para niños y adolescentes',
        precio: 84900,
        duracion_horas: 35,
        nivel: 'intermedio'
      },
      {
        nombre: 'Psicología del Comportamiento Alimentario',
        descripcion: 'Entiende y modifica los patrones de comportamiento alimentario',
        precio: 74900,
        duracion_horas: 30,
        nivel: 'avanzado'
      },
      {
        nombre: 'Nutrición para Pérdida de Peso',
        descripcion: 'Estrategias efectivas para ayudar a clientes a perder peso de forma saludable',
        precio: 64900,
        duracion_horas: 20,
        nivel: 'basico'
      },
      {
        nombre: 'Bioquímica Nutricional',
        descripcion: 'Fundamentos bioquímicos de la nutrición humana',
        precio: 94900,
        duracion_horas: 45,
        nivel: 'avanzado'
      }
    ];

    // Insertar cursos
    const cursosInsertados = [];
    for (let i = 0; i < cursos.length; i++) {
      const curso = cursos[i];
      const codigo_curso = `CUR-${String(i + 1).padStart(3, '0')}`;
      const result = await pool.query(
        `INSERT INTO t_cursos (nombre, descripcion, precio, duracion_horas, nivel, estado, moneda, codigo_curso)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_curso as id, nombre`,
        [curso.nombre, curso.descripcion, curso.precio, curso.duracion_horas, curso.nivel, 'activo', 'CLP', codigo_curso]
      );
      cursosInsertados.push(result.rows[0]);
      console.log(`✓ Curso creado: ${result.rows[0].nombre} (ID: ${result.rows[0].id}) - Código: ${codigo_curso}`);
    }

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

    console.log('✅ Seed de cursos e inscripciones completado exitosamente');
    console.log(`
    📊 Resumen:
    - 8 cursos creados
    - 12 inscripciones creadas (10 + 2 para admin)
    - Distribución: Usuario 2 (3), Usuario 4 (2), Usuario 5 (2), Usuario 6 (3), Admin/Usuario 3 (2)
    `);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed de cursos:', err.message);
    process.exit(1);
  }
};

seedCursos();
