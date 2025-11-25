import pool from '../config/database.js';

const seedSeccionesLecciones = async () => {
  try {
    console.log('🌱 Iniciando seed de secciones y lecciones de cursos...\n');

    // Estructuras de secciones y lecciones para cada curso
    const cursosConContenido = [
      {
        codigo_curso: 'CUR-001',
        nombre: 'Nutrición Deportiva Avanzada',
        secciones: [
          {
            numero: 1,
            titulo: 'Fundamentos de Nutrición Deportiva',
            descripcion: 'Conceptos básicos de nutrición aplicada al deporte',
            lecciones: [
              { numero: 1, titulo: 'Introducción a la Nutrición Deportiva', tipo: 'video', duracion: 15 },
              { numero: 2, titulo: 'Macronutrientes en el Deporte', tipo: 'articulo', duracion: 20 },
              { numero: 3, titulo: 'Quiz: Conceptos Básicos', tipo: 'quiz', duracion: 10 }
            ]
          },
          {
            numero: 2,
            titulo: 'Nutrición para Rendimiento',
            descripcion: 'Estrategias nutricionales para optimizar el rendimiento',
            lecciones: [
              { numero: 1, titulo: 'Hidratación en el Deporte', tipo: 'video', duracion: 18 },
              { numero: 2, titulo: 'Suplementación Básica', tipo: 'articulo', duracion: 25 },
              { numero: 3, titulo: 'Quiz: Rendimiento Deportivo', tipo: 'quiz', duracion: 12 }
            ]
          }
        ]
      },
      {
        codigo_curso: 'CUR-002',
        nombre: 'Metabolismo y Energía',
        secciones: [
          {
            numero: 1,
            titulo: 'Fundamentos del Metabolismo',
            descripcion: 'Cómo funciona el metabolismo humano',
            lecciones: [
              { numero: 1, titulo: 'Rutas Metabólicas', tipo: 'video', duracion: 20 },
              { numero: 2, titulo: 'ATP y Energía Celular', tipo: 'articulo', duracion: 22 },
              { numero: 3, titulo: 'Quiz: Metabolismo', tipo: 'quiz', duracion: 10 }
            ]
          },
          {
            numero: 2,
            titulo: 'Optimización Metabólica',
            descripcion: 'Estrategias para optimizar el metabolismo',
            lecciones: [
              { numero: 1, titulo: 'Ejercicio y Metabolismo', tipo: 'video', duracion: 17 },
              { numero: 2, titulo: 'Factores que Afectan el Metabolismo', tipo: 'pdf', duracion: 15 }
            ]
          }
        ]
      },
      {
        codigo_curso: 'CUR-003',
        nombre: 'Planes Nutricionales Personalizados',
        secciones: [
          {
            numero: 1,
            titulo: 'Evaluación Nutricional',
            descripcion: 'Métodos para evaluar el estado nutricional',
            lecciones: [
              { numero: 1, titulo: 'Evaluación Antropométrica', tipo: 'video', duracion: 19 },
              { numero: 2, titulo: 'Historia Nutricional', tipo: 'articulo', duracion: 18 },
              { numero: 3, titulo: 'Cuestionarios de Evaluación', tipo: 'pdf', duracion: 20 }
            ]
          },
          {
            numero: 2,
            titulo: 'Diseño de Planes',
            descripcion: 'Cómo diseñar planes nutricionales efectivos',
            lecciones: [
              { numero: 1, titulo: 'Cálculo de Requerimientos', tipo: 'video', duracion: 22 },
              { numero: 2, titulo: 'Diseño de Menús', tipo: 'articulo', duracion: 25 },
              { numero: 3, titulo: 'Quiz: Planes Personalizados', tipo: 'quiz', duracion: 12 }
            ]
          },
          {
            numero: 3,
            titulo: 'Seguimiento y Evaluación',
            descripcion: 'Monitoreo del progreso y ajustes',
            lecciones: [
              { numero: 1, titulo: 'Seguimiento Nutricional', tipo: 'video', duracion: 16 },
              { numero: 2, titulo: 'Registro de Alimentos', tipo: 'articulo', duracion: 14 }
            ]
          }
        ]
      },
      {
        codigo_curso: 'CUR-004',
        nombre: 'Suplementación en el Deporte',
        secciones: [
          {
            numero: 1,
            titulo: 'Introducción a Suplementos',
            descripcion: 'Clasificación y tipos de suplementos deportivos',
            lecciones: [
              { numero: 1, titulo: 'Tipos de Suplementos', tipo: 'video', duracion: 18 },
              { numero: 2, titulo: 'Regulación de Suplementos', tipo: 'articulo', duracion: 16 }
            ]
          },
          {
            numero: 2,
            titulo: 'Suplementos Efectivos',
            descripcion: 'Suplementos con evidencia científica',
            lecciones: [
              { numero: 1, titulo: 'Proteína en Polvo', tipo: 'video', duracion: 15 },
              { numero: 2, titulo: 'Creatina y Cafeína', tipo: 'articulo', duracion: 18 },
              { numero: 3, titulo: 'Quiz: Suplementos', tipo: 'quiz', duracion: 10 }
            ]
          }
        ]
      },
      {
        codigo_curso: 'CUR-005',
        nombre: 'Nutrición Pediátrica',
        secciones: [
          {
            numero: 1,
            titulo: 'Nutrición en la Infancia',
            descripcion: 'Requerimientos nutricionales en niños',
            lecciones: [
              { numero: 1, titulo: 'Requerimientos por Edad', tipo: 'video', duracion: 20 },
              { numero: 2, titulo: 'Lactancia Materna', tipo: 'articulo', duracion: 18 },
              { numero: 3, titulo: 'Alimentación Complementaria', tipo: 'articulo', duracion: 15 }
            ]
          },
          {
            numero: 2,
            titulo: 'Nutrición en Adolescentes',
            descripcion: 'Requerimientos nutricionales en adolescentes',
            lecciones: [
              { numero: 1, titulo: 'Cambios en la Adolescencia', tipo: 'video', duracion: 17 },
              { numero: 2, titulo: 'Trastornos Alimentarios', tipo: 'articulo', duracion: 20 }
            ]
          }
        ]
      },
      {
        codigo_curso: 'CUR-006',
        nombre: 'Psicología del Comportamiento Alimentario',
        secciones: [
          {
            numero: 1,
            titulo: 'Comportamiento Alimentario',
            descripcion: 'Factores que influyen en el comportamiento alimentario',
            lecciones: [
              { numero: 1, titulo: 'Introducción a Psicología Alimentaria', tipo: 'video', duracion: 19 },
              { numero: 2, titulo: 'Factores Psicológicos', tipo: 'articulo', duracion: 21 }
            ]
          },
          {
            numero: 2,
            titulo: 'Cambio de Comportamiento',
            descripcion: 'Estrategias para modificar comportamientos alimentarios',
            lecciones: [
              { numero: 1, titulo: 'Técnicas de Motivación', tipo: 'video', duracion: 18 },
              { numero: 2, titulo: 'Terapia Cognitivo-Conductual', tipo: 'articulo', duracion: 22 },
              { numero: 3, titulo: 'Quiz: Comportamiento', tipo: 'quiz', duracion: 11 }
            ]
          }
        ]
      },
      {
        codigo_curso: 'CUR-007',
        nombre: 'Nutrición para Pérdida de Peso',
        secciones: [
          {
            numero: 1,
            titulo: 'Fundamentos de Pérdida de Peso',
            descripcion: 'Conceptos básicos sobre pérdida de peso',
            lecciones: [
              { numero: 1, titulo: 'Balance Energético', tipo: 'video', duracion: 16 },
              { numero: 2, titulo: 'Déficit Calórico', tipo: 'articulo', duracion: 14 }
            ]
          },
          {
            numero: 2,
            titulo: 'Dietas para Pérdida de Peso',
            descripcion: 'Diferentes enfoques dietéticos',
            lecciones: [
              { numero: 1, titulo: 'Dieta Baja en Carbohidratos', tipo: 'video', duracion: 17 },
              { numero: 2, titulo: 'Ayuno Intermitente', tipo: 'articulo', duracion: 16 },
              { numero: 3, titulo: 'Quiz: Pérdida de Peso', tipo: 'quiz', duracion: 10 }
            ]
          }
        ]
      },
      {
        codigo_curso: 'CUR-008',
        nombre: 'Bioquímica Nutricional',
        secciones: [
          {
            numero: 1,
            titulo: 'Conceptos de Bioquímica',
            descripcion: 'Fundamentos de bioquímica aplicada a nutrición',
            lecciones: [
              { numero: 1, titulo: 'Moléculas de la Vida', tipo: 'video', duracion: 21 },
              { numero: 2, titulo: 'Proteínas y Aminoácidos', tipo: 'articulo', duracion: 20 },
              { numero: 3, titulo: 'Carbohidratos y Lípidos', tipo: 'articulo', duracion: 19 }
            ]
          },
          {
            numero: 2,
            titulo: 'Metabolismo a Nivel Celular',
            descripcion: 'Procesos metabólicos en células',
            lecciones: [
              { numero: 1, titulo: 'Glucólisis y Ciclo de Krebs', tipo: 'video', duracion: 23 },
              { numero: 2, titulo: 'Cadena de Transporte de Electrones', tipo: 'video', duracion: 22 },
              { numero: 3, titulo: 'Quiz: Bioquímica', tipo: 'quiz', duracion: 12 }
            ]
          },
          {
            numero: 3,
            titulo: 'Bioquímica Aplicada',
            descripcion: 'Aplicaciones prácticas de bioquímica en nutrición',
            lecciones: [
              { numero: 1, titulo: 'Nutrientes y Enzimas', tipo: 'video', duracion: 18 },
              { numero: 2, titulo: 'Deficiencias Nutricionales', tipo: 'articulo', duracion: 17 }
            ]
          }
        ]
      }
    ];

    // Obtener el ID de cada curso por su código
    let seccionesCreadas = 0;
    let leccionesCreadas = 0;

    for (const cursoData of cursosConContenido) {
      // Obtener el id_curso por código
      const cursoResult = await pool.query(
        `SELECT id_curso FROM t_cursos WHERE codigo_curso = $1`,
        [cursoData.codigo_curso]
      );

      if (cursoResult.rows.length === 0) {
        console.warn(`⚠️ Curso no encontrado: ${cursoData.codigo_curso}`);
        continue;
      }

      const id_curso = cursoResult.rows[0].id_curso;

      // Insertar secciones y lecciones
      for (const seccion of cursoData.secciones) {
        for (const leccion of seccion.lecciones) {
          try {
            const result = await pool.query(
              `INSERT INTO t_detalles_cursos (
                id_curso, seccion_numero, seccion_titulo, seccion_descripcion,
                orden_seccion, leccion_numero, leccion_titulo, leccion_descripcion,
                tipo_contenido, duracion_minutos, orden_leccion
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
               RETURNING id`,
              [
                id_curso,
                seccion.numero,
                seccion.titulo,
                seccion.descripcion,
                seccion.numero,
                leccion.numero,
                leccion.titulo,
                `Contenido de ${leccion.titulo}`,
                leccion.tipo,
                leccion.duracion,
                leccion.numero
              ]
            );
            leccionesCreadas++;
          } catch (err) {
            console.warn(`⚠️ Error al crear lección: ${err.message}`);
          }
        }
        seccionesCreadas++;
      }

      console.log(`✓ Curso: ${cursoData.nombre} (${cursoData.secciones.length} secciones)`);
    }

    console.log('\n✅ Seed de secciones y lecciones completado exitosamente');
    console.log(`
    📊 Resumen:
    - ${cursosConContenido.length} cursos procesados
    - ${seccionesCreadas} secciones creadas
    - ${leccionesCreadas} lecciones creadas
    `);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed de secciones y lecciones:', err.message);
    process.exit(1);
  }
};

seedSeccionesLecciones();
