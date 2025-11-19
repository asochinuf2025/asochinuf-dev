import pool from '../config/database.js';

/**
 * Script para agregar cursos de ejemplo con detalles
 * Ejecutar: node scripts/seed-courses.js
 */

const seedCourses = async () => {
  try {
    console.log('🌱 Iniciando seeding de cursos...\n');

    // 1. Obtener o crear cursos
    const cursosData = [
      {
        codigo_curso: 'NUT-001',
        nombre: 'Fundamentos de Nutrición Deportiva',
        descripcion: 'Aprende los conceptos básicos de nutrición aplicada al deporte profesional. Ideal para principiantes.',
        lo_que_aprenderas: '• Principios básicos de macronutrientes\n• Importancia de la hidratación\n• Planificación de comidas para atletas\n• Suplementos seguros y efectivos\n• Evaluación de necesidades nutricionales individuales',
        requisitos: 'No se requieren conocimientos previos. Solo interés en nutrición y deportes.',
        nivel: 'básico',
        precio: 49900,
        duracion_horas: 8,
        modalidad: 'online',
        nombre_instructor: 'Dr. Carlos Mendoza',
        estado: 'activo'
      },
      {
        codigo_curso: 'ANT-002',
        nombre: 'Antropometría Avanzada para Futbolistas',
        descripcion: 'Domina las técnicas de medición antropométrica ISAK para evaluar el rendimiento físico de jugadores.',
        lo_que_aprenderas: '• Protocolos ISAK certificados internacionalmente\n• Medición precisa de pliegues cutáneos\n• Evaluación de perímetros corporales\n• Interpretación de resultados para futbolistas\n• Uso de software de análisis antropométrico',
        requisitos: 'Conocimientos básicos de anatomía deportiva. Certificación ISAK recomendada pero no obligatoria.',
        nivel: 'intermedio',
        precio: 79900,
        duracion_horas: 12,
        modalidad: 'mixto',
        nombre_instructor: 'Dra. María González',
        estado: 'activo'
      },
      {
        codigo_curso: 'PLA-003',
        nombre: 'Planificación Nutricional Competitiva',
        descripcion: 'Diseña planes nutricionales personalizados para diferentes fases de la temporada deportiva.',
        lo_que_aprenderas: '• Planificación en diferentes fases: pretemporada, competencia, post-temporada\n• Nutrición pre, durante y post-partido\n• Manejo nutricional de lesiones\n• Periodización nutricional avanzada\n• Casos prácticos y seguimiento real\n• Herramientas de monitoreo y evaluación',
        requisitos: 'Certificación en nutrición deportiva o experiencia mínima de 2 años. Conocimientos intermedios en fisiología del ejercicio.',
        nivel: 'avanzado',
        precio: 129900,
        duracion_horas: 20,
        modalidad: 'presencial',
        nombre_instructor: 'Nutricionista Felipe Ruiz',
        estado: 'activo'
      }
    ];

    // Insertar cursos y obtener sus IDs
    const cursoIds = [];
    for (const cursoData of cursosData) {
      try {
        const result = await pool.query(
          `INSERT INTO t_cursos (codigo_curso, nombre, descripcion, lo_que_aprenderas, requisitos, nivel, precio, duracion_horas, modalidad, nombre_instructor, estado)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING id_curso`,
          [
            cursoData.codigo_curso,
            cursoData.nombre,
            cursoData.descripcion,
            cursoData.lo_que_aprenderas,
            cursoData.requisitos,
            cursoData.nivel,
            cursoData.precio,
            cursoData.duracion_horas,
            cursoData.modalidad,
            cursoData.nombre_instructor,
            cursoData.estado
          ]
        );
        cursoIds.push(result.rows[0].id_curso);
        console.log(`✅ Curso creado: ${cursoData.nombre} (ID: ${result.rows[0].id_curso})`);
      } catch (err) {
        if (err.code === '23505') {
          // Duplicate - get existing course ID
          const existingResult = await pool.query(
            `SELECT id_curso FROM t_cursos WHERE codigo_curso = $1`,
            [cursoData.codigo_curso]
          );
          if (existingResult.rows.length > 0) {
            cursoIds.push(existingResult.rows[0].id_curso);
            console.log(`ℹ️ Curso ya existe: ${cursoData.nombre} (ID: ${existingResult.rows[0].id_curso})`);
          }
        } else {
          throw err;
        }
      }
    }

    // 2. Agregar detalles (secciones y lecciones) para cada curso
    const detallesData = [
      {
        cursoId: cursoIds[0],
        secciones: [
          {
            numero: 1,
            titulo: 'Introducción a la Nutrición Deportiva',
            descripcion: 'Conceptos fundamentales y la importancia de la nutrición en el rendimiento.',
            orden: 1,
            lecciones: [
              {
                numero: 1,
                titulo: 'Bienvenida al curso',
                descripcion: 'Presentación del programa y objetivos de aprendizaje.',
                tipo: 'video',
                duracion: 15,
                url: 'https://example.com/video/intro-1',
                orden: 1
              },
              {
                numero: 2,
                titulo: 'Macronutrientes básicos',
                descripcion: 'Proteínas, carbohidratos y grasas: sus funciones en el cuerpo.',
                tipo: 'articulo',
                duracion: 20,
                url: 'https://example.com/articulo/macronutrientes',
                orden: 2
              },
              {
                numero: 3,
                titulo: 'Quiz: Macronutrientes',
                descripcion: 'Evalúa tu comprensión de los macronutrientes.',
                tipo: 'quiz',
                duracion: 10,
                url: 'https://example.com/quiz/macro',
                orden: 3
              }
            ]
          },
          {
            numero: 2,
            titulo: 'Micronutrientes Esenciales',
            descripcion: 'Vitaminas y minerales críticos para atletas.',
            orden: 2,
            lecciones: [
              {
                numero: 1,
                titulo: 'Vitaminas liposolubles',
                descripcion: 'Vitaminas A, D, E y K en la nutrición deportiva.',
                tipo: 'video',
                duracion: 25,
                url: 'https://example.com/video/vitaminas',
                orden: 1
              },
              {
                numero: 2,
                titulo: 'Minerales en el deporte',
                descripcion: 'Hierro, zinc, calcio y su importancia.',
                tipo: 'pdf',
                duracion: 15,
                url: 'https://example.com/pdf/minerales.pdf',
                orden: 2
              }
            ]
          }
        ]
      },
      {
        cursoId: cursoIds[1],
        secciones: [
          {
            numero: 1,
            titulo: 'Fundamentos de Antropometría ISAK',
            descripcion: 'Principios y protocolos internacionales de medición.',
            orden: 1,
            lecciones: [
              {
                numero: 1,
                titulo: 'Historia de la antropometría',
                descripcion: 'Evolución de las técnicas de medición corporal.',
                tipo: 'video',
                duracion: 20,
                url: 'https://example.com/video/historia-antro',
                orden: 1
              },
              {
                numero: 2,
                titulo: 'Estándares ISAK',
                descripcion: 'Conoce los estándares internacionales certificados.',
                tipo: 'articulo',
                duracion: 25,
                url: 'https://example.com/articulo/isak',
                orden: 2
              },
              {
                numero: 3,
                titulo: 'Equipamiento necesario',
                descripcion: 'Instrumentos requeridos para mediciones precisas.',
                tipo: 'pdf',
                duracion: 10,
                url: 'https://example.com/pdf/equipos.pdf',
                orden: 3
              }
            ]
          },
          {
            numero: 2,
            titulo: 'Técnicas de Medición Práctica',
            descripcion: 'Procedimientos paso a paso para mediciones correctas.',
            orden: 2,
            lecciones: [
              {
                numero: 1,
                titulo: 'Medición de pliegues cutáneos',
                descripcion: 'Técnicas correctas para medir grasa corporal.',
                tipo: 'video',
                duracion: 30,
                url: 'https://example.com/video/pliegues',
                orden: 1
              },
              {
                numero: 2,
                titulo: 'Perímetros corporales',
                descripcion: 'Cómo medir circunferencias del cuerpo.',
                tipo: 'video',
                duracion: 25,
                url: 'https://example.com/video/perimetros',
                orden: 2
              },
              {
                numero: 3,
                titulo: 'Diámetros óseos',
                descripcion: 'Medición de diámetros para contexto estructural.',
                tipo: 'articulo',
                duracion: 20,
                url: 'https://example.com/articulo/diametros',
                orden: 3
              },
              {
                numero: 4,
                titulo: 'Quiz: Técnicas de Medición',
                descripcion: 'Valida tu comprensión de las técnicas.',
                tipo: 'quiz',
                duracion: 15,
                url: 'https://example.com/quiz/tecnicas',
                orden: 4
              }
            ]
          },
          {
            numero: 3,
            titulo: 'Evaluación e Interpretación de Resultados',
            descripcion: 'Análisis de medidas y proyección de rendimiento.',
            orden: 3,
            lecciones: [
              {
                numero: 1,
                titulo: 'Cálculo de índices corporales',
                descripcion: 'IMC, índice de masa muscular y otros indicadores.',
                tipo: 'articulo',
                duracion: 20,
                url: 'https://example.com/articulo/indices',
                orden: 1
              },
              {
                numero: 2,
                titulo: 'Interpretación para futbolistas',
                descripcion: 'Valores de referencia específicos para jugadores.',
                tipo: 'pdf',
                duracion: 25,
                url: 'https://example.com/pdf/interpretacion.pdf',
                orden: 2
              }
            ]
          }
        ]
      },
      {
        cursoId: cursoIds[2],
        secciones: [
          {
            numero: 1,
            titulo: 'Fase de Pretemporada',
            descripcion: 'Estrategias nutricionales para preparar a los jugadores.',
            orden: 1,
            lecciones: [
              {
                numero: 1,
                titulo: 'Evaluación inicial del plantel',
                descripcion: 'Diagnóstico nutricional y corporal de jugadores.',
                tipo: 'video',
                duracion: 40,
                url: 'https://example.com/video/evaluacion-inicial',
                orden: 1
              },
              {
                numero: 2,
                titulo: 'Planes de ganancia muscular',
                descripcion: 'Estrategias para jugadores que necesitan desarrollar musculatura.',
                tipo: 'articulo',
                duracion: 30,
                url: 'https://example.com/articulo/ganancia-muscular',
                orden: 2
              },
              {
                numero: 3,
                titulo: 'Reducción de peso corporal',
                descripcion: 'Protocolos seguros para pérdida de grasa.',
                tipo: 'pdf',
                duracion: 35,
                url: 'https://example.com/pdf/reduccion-peso.pdf',
                orden: 3
              },
              {
                numero: 4,
                titulo: 'Suplementación en pretemporada',
                descripcion: 'Productos recomendados basados en evidencia.',
                tipo: 'video',
                duracion: 25,
                url: 'https://example.com/video/suplementacion-pre',
                orden: 4
              }
            ]
          },
          {
            numero: 2,
            titulo: 'Fase Competitiva',
            descripcion: 'Nutrición durante la temporada regular.',
            orden: 2,
            lecciones: [
              {
                numero: 1,
                titulo: 'Nutrición pre-partido',
                descripcion: 'Qué comer antes de jugar para óptimo rendimiento.',
                tipo: 'articulo',
                duracion: 20,
                url: 'https://example.com/articulo/pre-partido',
                orden: 1
              },
              {
                numero: 2,
                titulo: 'Hidratación durante el juego',
                descripcion: 'Estrategias de hidratación antes, durante y después.',
                tipo: 'video',
                duracion: 30,
                url: 'https://example.com/video/hidratacion',
                orden: 2
              },
              {
                numero: 3,
                titulo: 'Nutrición post-partido',
                descripcion: 'Recuperación nutricional tras la competencia.',
                tipo: 'articulo',
                duracion: 25,
                url: 'https://example.com/articulo/post-partido',
                orden: 3
              },
              {
                numero: 4,
                titulo: 'Manejo de lesiones',
                descripcion: 'Nutrición para acelerar recuperación en lesiones.',
                tipo: 'pdf',
                duracion: 30,
                url: 'https://example.com/pdf/lesiones.pdf',
                orden: 4
              },
              {
                numero: 5,
                titulo: 'Quiz: Competencia',
                descripcion: 'Evalúa tus conocimientos de nutrición competitiva.',
                tipo: 'quiz',
                duracion: 20,
                url: 'https://example.com/quiz/competencia',
                orden: 5
              }
            ]
          },
          {
            numero: 3,
            titulo: 'Fase Post-Temporada',
            descripcion: 'Recuperación y preparación para nuevo ciclo.',
            orden: 3,
            lecciones: [
              {
                numero: 1,
                titulo: 'Recuperación integral',
                descripcion: 'Plan nutricional para descanso y recuperación.',
                tipo: 'video',
                duracion: 35,
                url: 'https://example.com/video/recuperacion',
                orden: 1
              },
              {
                numero: 2,
                titulo: 'Prevención de lesiones en descanso',
                descripcion: 'Mantenimiento de salud durante vacaciones.',
                tipo: 'articulo',
                duracion: 20,
                url: 'https://example.com/articulo/prevension-descanso',
                orden: 2
              }
            ]
          },
          {
            numero: 4,
            titulo: 'Casos Prácticos y Seguimiento',
            descripcion: 'Análisis de casos reales y monitoreo del progreso.',
            orden: 4,
            lecciones: [
              {
                numero: 1,
                titulo: 'Caso 1: Jugador con sobrepeso',
                descripcion: 'Plan nutricional completo para reducción segura.',
                tipo: 'pdf',
                duracion: 40,
                url: 'https://example.com/pdf/caso1.pdf',
                orden: 1
              },
              {
                numero: 2,
                titulo: 'Caso 2: Atleta de élite',
                descripcion: 'Optimización nutricional para máximo rendimiento.',
                tipo: 'video',
                duracion: 45,
                url: 'https://example.com/video/caso2',
                orden: 2
              },
              {
                numero: 3,
                titulo: 'Monitoreo y seguimiento',
                descripcion: 'Herramientas para evaluación continua del progreso.',
                tipo: 'articulo',
                duracion: 25,
                url: 'https://example.com/articulo/seguimiento',
                orden: 3
              }
            ]
          }
        ]
      }
    ];

    // Insertar detalles de cursos
    let totalDetalles = 0;
    for (const detalle of detallesData) {
      for (const seccion of detalle.secciones) {
        for (const leccion of seccion.lecciones) {
          await pool.query(
            `INSERT INTO t_detalles_cursos (
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
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              detalle.cursoId,
              seccion.numero,
              seccion.titulo,
              seccion.descripcion,
              seccion.orden,
              leccion.numero,
              leccion.titulo,
              leccion.descripcion,
              leccion.tipo,
              leccion.url,
              leccion.duracion,
              leccion.orden
            ]
          );
          totalDetalles++;
        }
      }
    }

    console.log(`\n✅ Detalles de cursos insertados: ${totalDetalles}`);

    // 3. Crear acceso de ejemplo para un usuario (si existe usuario con id 1)
    try {
      await pool.query(
        `INSERT INTO t_acceso_cursos (usuario_id, id_curso, tipo_acceso, precio_pagado, estado)
         VALUES ($1, $2, $3, $4, $5)`,
        [1, cursoIds[0], 'regalo', 0, 'activo']
      );
      console.log('✅ Acceso de ejemplo creado para usuario (Curso 1 gratis)');
    } catch (err) {
      if (err.code === '23505') {
        console.log('ℹ️ Usuario ya tiene acceso a este curso');
      } else {
        console.log('ℹ️ No se pudo crear acceso de ejemplo (usuario no existe)');
      }
    }

    console.log('\n🎉 Seeding completado exitosamente!');
    console.log(`\n📊 Resumen:`);
    console.log(`   - Cursos creados: ${cursoIds.length}`);
    console.log(`   - Detalles insertados: ${totalDetalles}`);
    console.log(`\n📚 Cursos disponibles:`);
    cursosData.forEach((curso, idx) => {
      console.log(`   ${idx + 1}. ${curso.nombre} (ID: ${cursoIds[idx]})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante seeding:', error);
    process.exit(1);
  }
};

// Ejecutar seeding
seedCourses();
