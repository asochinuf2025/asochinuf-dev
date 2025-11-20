import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const seedCursos = async () => {
  try {
    console.log('Sembrando cursos de ejemplo...\n');

    // Limpiar datos anteriores
    console.log('Limpiando cursos anteriores...');
    await pool.query(`DELETE FROM t_acceso_cursos WHERE id_curso IN (SELECT id_curso FROM t_cursos WHERE codigo_curso IN ('NUTRI-001', 'FISIO-001', 'ANTRO-001'))`);
    await pool.query(`DELETE FROM t_detalles_cursos WHERE id_curso IN (SELECT id_curso FROM t_cursos WHERE codigo_curso IN ('NUTRI-001', 'FISIO-001', 'ANTRO-001'))`);
    await pool.query(`DELETE FROM t_cursos WHERE codigo_curso IN ('NUTRI-001', 'FISIO-001', 'ANTRO-001')`);
    console.log('✓ Limpieza completada\n');

    // Obtener el ID del usuario cliente heisinger.vivanco@gmail.com
    const clienteResult = await pool.query(`
      SELECT id FROM t_usuarios WHERE email = $1 LIMIT 1
    `, ['heisinger.vivanco@gmail.com']);

    let clienteId = null;
    if (clienteResult.rows.length > 0) {
      clienteId = clienteResult.rows[0].id;
      console.log(`✓ Usuario encontrado: heisinger.vivanco@gmail.com (ID: ${clienteId})\n`);
    } else {
      console.warn('⚠ Usuario heisinger.vivanco@gmail.com no encontrado. Se crearán los cursos pero sin asignar acceso.\n');
    }

    // ========== CURSO 1: NUTRICIÓN DEPORTIVA ==========
    console.log('Creando Curso 1: Nutrición Deportiva...');

    const curso1 = await pool.query(`
      INSERT INTO t_cursos (
        codigo_curso,
        nombre,
        descripcion,
        duracion_horas,
        nivel,
        precio,
        nombre_instructor
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
      RETURNING id_curso
    `, [
      'NUTRI-001',
      'Nutrición Deportiva Profesional',
      'Aprende los principios fundamentales de la nutrición para atletas de alto rendimiento. Este curso cubre desde macronutrientes hasta planes de alimentación personalizados.',
      40,
      'Intermedio',
      49.99,
      'ASOCHINUF'
    ]);

    const cursoId1 = curso1.rows[0].id_curso;

    // Secciones y lecciones para Curso 1
    const lecciones1 = [
      { seccion: 1, seccion_titulo: 'Fundamentos de Macronutrientes', leccion: 1, leccion_titulo: 'Proteínas en el Deporte', leccion_desc: 'Importancia y cálculo de proteínas diarias', duracion: 15, url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { seccion: 1, seccion_titulo: 'Fundamentos de Macronutrientes', leccion: 2, leccion_titulo: 'Carbohidratos para Energía', leccion_desc: 'Timing de carbohidratos en entrenamientos', duracion: 12, url: 'https://vimeo.com/showcase/8214925/video/76979871' },
      { seccion: 1, seccion_titulo: 'Fundamentos de Macronutrientes', leccion: 3, leccion_titulo: 'Grasas Saludables', leccion_desc: 'Ácidos grasos omega-3 y su rol en recuperación', duracion: 10, url: 'https://www.youtube.com/embed/jNQXAC9IVRw' },
      { seccion: 2, seccion_titulo: 'Micronutrientes Esenciales', leccion: 1, leccion_titulo: 'Hierro y Rendimiento', leccion_desc: 'El papel crítico del hierro en el transporte de oxígeno', duracion: 14, url: 'https://www.youtube.com/embed/2Vv-BfVoq4g' },
      { seccion: 2, seccion_titulo: 'Micronutrientes Esenciales', leccion: 2, leccion_titulo: 'Hidratación y Electrolitos', leccion_desc: 'Estrategias óptimas de hidratación durante el deporte', duracion: 16, url: 'https://vimeo.com/showcase/8214925/video/149670098' },
      { seccion: 3, seccion_titulo: 'Planes de Alimentación Personalizados', leccion: 1, leccion_titulo: 'Ganancia Muscular', leccion_desc: 'Nutrición para hipertrofia y aumento de masa', duracion: 18, url: 'https://www.youtube.com/embed/9bKY_yLz0OE' },
      { seccion: 3, seccion_titulo: 'Planes de Alimentación Personalizados', leccion: 2, leccion_titulo: 'Pérdida de Grasa', leccion_desc: 'Deficits calóricos seguros y eficaces', duracion: 15, url: 'https://vimeo.com/showcase/8214925/video/76979887' },
      { seccion: 3, seccion_titulo: 'Planes de Alimentación Personalizados', leccion: 3, leccion_titulo: 'Recuperación Post-Entrenamiento', leccion_desc: 'Nutrientes clave en la ventana anabólica', duracion: 12, url: 'https://www.youtube.com/embed/OPf0YbXqDm0' }
    ];

    for (const lec of lecciones1) {
      await pool.query(`
        INSERT INTO t_detalles_cursos (
          id_curso,
          seccion_numero,
          seccion_titulo,
          seccion_descripcion,
          orden_seccion,
          leccion_numero,
          leccion_titulo,
          leccion_descripcion,
          tipo_contenido,
          url_contenido,
          duracion_minutos,
          orden_leccion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [cursoId1, lec.seccion, lec.seccion_titulo, 'Sección del curso', lec.seccion, lec.leccion, lec.leccion_titulo, lec.leccion_desc, 'video', lec.url, lec.duracion, lec.leccion]);
    }

    console.log('✓ Curso 1 creado con 3 secciones y 8 lecciones\n');

    // ========== CURSO 2: FISIOLOGÍA DEL EJERCICIO ==========
    console.log('Creando Curso 2: Fisiología del Ejercicio...');

    const curso2 = await pool.query(`
      INSERT INTO t_cursos (
        codigo_curso,
        nombre,
        descripcion,
        duracion_horas,
        nivel,
        precio,
        nombre_instructor
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
      RETURNING id_curso
    `, [
      'FISIO-001',
      'Fisiología del Ejercicio',
      'Comprende cómo funciona el cuerpo durante el ejercicio. Desde sistemas energéticos hasta adaptaciones cardiovasculares y neuromusculares.',
      35,
      'Intermedio',
      44.99,
      'ASOCHINUF'
    ]);

    const cursoId2 = curso2.rows[0].id_curso;

    const lecciones2 = [
      { seccion: 1, seccion_titulo: 'Sistemas Energéticos', leccion: 1, leccion_titulo: 'Sistema ATP-PC', leccion_desc: 'Energía de corta duración para esfuerzos máximos', duracion: 13, url: 'https://www.youtube.com/embed/gSiwr5F7YYo' },
      { seccion: 1, seccion_titulo: 'Sistemas Energéticos', leccion: 2, leccion_titulo: 'Sistema Glucolítico', leccion_desc: 'Energía anaeróbica para actividades de 30 segundos a 2 minutos', duracion: 14, url: 'https://vimeo.com/showcase/8214925/video/76979823' },
      { seccion: 1, seccion_titulo: 'Sistemas Energéticos', leccion: 3, leccion_titulo: 'Sistema Oxidativo', leccion_desc: 'Metabolismo aeróbico para esfuerzos prolongados', duracion: 16, url: 'https://www.youtube.com/embed/5sLlcC5PzHk' },
      { seccion: 2, seccion_titulo: 'Adaptaciones Cardiovasculares', leccion: 1, leccion_titulo: 'Gasto Cardíaco y VO2', leccion_desc: 'Relación entre frecuencia cardíaca y consumo de oxígeno', duracion: 15, url: 'https://www.youtube.com/embed/Z8-hVZ5e8eY' },
      { seccion: 2, seccion_titulo: 'Adaptaciones Cardiovasculares', leccion: 2, leccion_titulo: 'Angiogénesis', leccion_desc: 'Formación de nuevos vasos sanguíneos con el entrenamiento', duracion: 12, url: 'https://vimeo.com/showcase/8214925/video/149670099' },
      { seccion: 3, seccion_titulo: 'Biomecánica Neuromuscular', leccion: 1, leccion_titulo: 'Tipos de Fibra Muscular', leccion_desc: 'Características de fibras tipo I y II', duracion: 14, url: 'https://www.youtube.com/embed/yNVxn6LPO7I' },
      { seccion: 3, seccion_titulo: 'Biomecánica Neuromuscular', leccion: 2, leccion_titulo: 'Curva Fuerza-Velocidad', leccion_desc: 'Relación entre velocidad y capacidad de generar fuerza', duracion: 13, url: 'https://vimeo.com/showcase/8214925/video/76979876' }
    ];

    for (const lec of lecciones2) {
      await pool.query(`
        INSERT INTO t_detalles_cursos (
          id_curso,
          seccion_numero,
          seccion_titulo,
          seccion_descripcion,
          orden_seccion,
          leccion_numero,
          leccion_titulo,
          leccion_descripcion,
          tipo_contenido,
          url_contenido,
          duracion_minutos,
          orden_leccion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [cursoId2, lec.seccion, lec.seccion_titulo, 'Sección del curso', lec.seccion, lec.leccion, lec.leccion_titulo, lec.leccion_desc, 'video', lec.url, lec.duracion, lec.leccion]);
    }

    console.log('✓ Curso 2 creado con 3 secciones y 7 lecciones\n');

    // ========== CURSO 3: EVALUACIÓN ANTROPOMÉTRICA ==========
    console.log('Creando Curso 3: Evaluación Antropométrica...');

    const curso3 = await pool.query(`
      INSERT INTO t_cursos (
        codigo_curso,
        nombre,
        descripcion,
        duracion_horas,
        nivel,
        precio,
        nombre_instructor
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
      RETURNING id_curso
    `, [
      'ANTRO-001',
      'Evaluación Antropométrica en Deportistas',
      'Domina las técnicas de medición antropométrica, análisis de composición corporal y evaluación de patrones de crecimiento en atletas.',
      30,
      'Principiante',
      39.99,
      'ASOCHINUF'
    ]);

    const cursoId3 = curso3.rows[0].id_curso;

    const lecciones3 = [
      { seccion: 1, seccion_titulo: 'Técnicas Básicas de Medición', leccion: 1, leccion_titulo: 'Instrumentos de Medición', leccion_desc: 'Cinta métrica, calibres y balanza', duracion: 12, url: 'https://www.youtube.com/embed/sKzR17Xpum8' },
      { seccion: 1, seccion_titulo: 'Técnicas Básicas de Medición', leccion: 2, leccion_titulo: 'Tomas de Medidas Longitudinales', leccion_desc: 'Técnica correcta de altura, talla sentado y envergadura', duracion: 15, url: 'https://vimeo.com/showcase/8214925/video/76979804' },
      { seccion: 1, seccion_titulo: 'Técnicas Básicas de Medición', leccion: 3, leccion_titulo: 'Puntos Anatómicos de Referencia', leccion_desc: 'Identificación precisa de landmarks corporales', duracion: 13, url: 'https://www.youtube.com/embed/A2h5zs9C0zI' },
      { seccion: 2, seccion_titulo: 'Pliegues Cutáneos y Perímetros', leccion: 1, leccion_titulo: 'Técnica de Calibre', leccion_desc: 'Procedimiento correcto para medir pliegues cutáneos', duracion: 16, url: 'https://www.youtube.com/embed/H1kC6Vwz9v0' },
      { seccion: 2, seccion_titulo: 'Pliegues Cutáneos y Perímetros', leccion: 2, leccion_titulo: 'Perímetros Corporales', leccion_desc: 'Medición de cintura, cadera, brazo y muslo', duracion: 14, url: 'https://vimeo.com/showcase/8214925/video/149670089' },
      { seccion: 3, seccion_titulo: 'Análisis e Interpretación de Datos', leccion: 1, leccion_titulo: 'Cálculo de IMC y Composición Corporal', leccion_desc: 'Fórmulas y ecuaciones antropométricas', duracion: 15, url: 'https://www.youtube.com/embed/zqrN8I0MPJA' },
      { seccion: 3, seccion_titulo: 'Análisis e Interpretación de Datos', leccion: 2, leccion_titulo: 'Ecuaciones de Densidad Corporal', leccion_desc: 'Métodos de Jackson-Pollock y otros protocolos', duracion: 14, url: 'https://vimeo.com/showcase/8214925/video/76979812' },
      { seccion: 3, seccion_titulo: 'Análisis e Interpretación de Datos', leccion: 3, leccion_titulo: 'Seguimiento Longitudinal', leccion_desc: 'Tracking de cambios antropométricos a través del tiempo', duracion: 13, url: 'https://www.youtube.com/embed/wJxkx3NyJaU' }
    ];

    for (const lec of lecciones3) {
      await pool.query(`
        INSERT INTO t_detalles_cursos (
          id_curso,
          seccion_numero,
          seccion_titulo,
          seccion_descripcion,
          orden_seccion,
          leccion_numero,
          leccion_titulo,
          leccion_descripcion,
          tipo_contenido,
          url_contenido,
          duracion_minutos,
          orden_leccion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [cursoId3, lec.seccion, lec.seccion_titulo, 'Sección del curso', lec.seccion, lec.leccion, lec.leccion_titulo, lec.leccion_desc, 'video', lec.url, lec.duracion, lec.leccion]);
    }

    console.log('✓ Curso 3 creado con 3 secciones y 8 lecciones\n');

    // ========== ASIGNAR ACCESO AL CLIENTE (CURSO 1) ==========
    if (clienteId) {
      console.log('Asignando acceso al curso 1 para heisinger.vivanco@gmail.com...');

      await pool.query(`
        INSERT INTO t_acceso_cursos (
          usuario_id,
          id_curso,
          tipo_acceso,
          estado
        ) VALUES (
          $1, $2, 'comprado', 'activo'
        )
      `, [clienteId, cursoId1]);

      console.log('✓ Acceso asignado al Curso 1 (Nutrición Deportiva)\n');
    }

    console.log('========================================');
    console.log('✓ CURSOS DE EJEMPLO CREADOS EXITOSAMENTE');
    console.log('========================================\n');
    console.log('Resumen:');
    console.log('  • Curso 1: Nutrición Deportiva (40 horas, 3 secciones, 8 lecciones)');
    console.log('  • Curso 2: Fisiología del Ejercicio (35 horas, 3 secciones, 7 lecciones)');
    console.log('  • Curso 3: Evaluación Antropométrica (30 horas, 3 secciones, 8 lecciones)');
    console.log('\nTodos los cursos incluyen videos de YouTube y Vimeo para pruebas.');
    if (clienteId) {
      console.log('\n✓ Usuario heisinger.vivanco@gmail.com tiene acceso a Curso 1');
    }
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sembrar cursos:', error);
    process.exit(1);
  }
};

seedCursos();
