// Mock data para ASOCHINUF - Asociación de Nutricionistas de Fútbol de Chile

export const mockData = {
  // Hero Section
  hero: {
    title: "ASOCHINUF",
    subtitle: "Asociación Chilena de Nutricionistas en el Fútbol",
    description: "Profesionales de la nutrición deportiva especializados en equipos de fútbol profesional de Chile",
    ctaText: "Comencemos",
    rotatingTexts: [
      "Especialización en Nutrición Deportiva",
      "Cursos Certificados Internacionales",
      "Formación en Alto Rendimiento",
      "Nutrición Aplicada al Fútbol Profesional",
      "Capacitación Continua de Excelencia"
    ]
  },

  // Logos de auspiciadores
  sponsors: [
    { id: 1, name: "Universidad de Chile", logo: "/logos/u-chile.png" },
    { id: 2, name: "Colo-Colo", logo: "/logos/colo-colo.png" },
    { id: 3, name: "Universidad Católica", logo: "/logos/catolica.webp" },
    { id: 4, name: "ANFP", logo: "/logos/anfp.webp" },
    { id: 5, name: "Unión Española", logo: "/logos/union-espanola.png" },
    { id: 6, name: "Palestino", logo: "/logos/palestino.png" },
    { id: 7, name: "Cobreloa", logo: "/logos/cobreloa.png" },
    { id: 8, name: "Everton", logo: "/logos/everton.webp" },
    { id: 9, name: "Audax Italiano", logo: "/logos/audax.webp" },
    { id: 10, name: "Huachipato", logo: "/logos/huachipato.png" }
  ],

  // Cursos Section
  cursos: [
    {
      id: 1,
      title: "Nutrición Deportiva Avanzada",
      description: "Curso especializado en nutrición para atletas de alto rendimiento. Aprende las últimas técnicas y estrategias nutricionales aplicadas al fútbol profesional.",
      duration: "12 semanas",
      level: "Avanzado",
      imagePosition: "left"
    },
    {
      id: 2,
      title: "Suplementación en Fútbol",
      description: "Domina el uso de suplementos deportivos y su aplicación correcta en futbolistas profesionales. Protocolo de suplementación basado en evidencia.",
      duration: "8 semanas",
      level: "Intermedio",
      imagePosition: "right"
    },
    {
      id: 3,
      title: "Planificación Nutricional Competitiva",
      description: "Diseña planes nutricionales personalizados para diferentes fases de la temporada deportiva y optimiza el rendimiento de los jugadores.",
      duration: "10 semanas",
      level: "Avanzado",
      imagePosition: "left"
    }
  ],

  // Capacitaciones Section
  capacitaciones: [
    {
      id: 1,
      title: "Evaluación Antropométrica",
      description: "Técnicas profesionales de medición y evaluación de composición corporal en deportistas.",
      icon: "activity",
      duration: "2 días"
    },
    {
      id: 2,
      title: "Nutrición Pre y Post Partido",
      description: "Estrategias nutricionales específicas para optimizar el rendimiento durante competencias.",
      icon: "utensils",
      duration: "1 día"
    },
    {
      id: 3,
      title: "Recuperación Muscular",
      description: "Protocolos nutricionales para acelerar la recuperación y prevenir lesiones deportivas.",
      icon: "heart-pulse",
      duration: "1 día"
    },
    {
      id: 4,
      title: "Hidratación en el Deporte",
      description: "Manejo avanzado de protocolos de hidratación para deportes de alta exigencia física.",
      icon: "droplet",
      duration: "1 día"
    }
  ],

  // Testimonios/Profesionales Section
  testimonios: [
    {
      id: 1,
      name: "Gabriella Riveri",
      role: "Nutricionista Deportiva",
      quote: "Ser un buen deportista requiere de muchas horas de entrenamiento, constancia y dedicación, pero lograr sostener tu rendimiento al máximo los 90 min de juego y evitar lesiones, no es solo talento, se requiere una adecuada nutrición e hidratación en conjunto. No dejes nada al azar",
      photo: "/fotos_profesionales/gabriellariveri.jpg"
    },
    {
      id: 2,
      name: "Consuelo Rivera",
      role: "Nutricionista Deportiva",
      quote: "Ser un buen deportista requiere de muchas horas de entrenamiento, constancia y dedicación, pero lograr sostener tu rendimiento al máximo los 90 min de juego y evitar lesiones, no es solo talento, se requiere una adecuada nutrición e hidratación en conjunto. No dejes nada al azar",
      photo: "/fotos_profesionales/consuelorivera.jpg"
    },
    {
      id: 3,
      name: "Catalina Carabias",
      role: "Nutricionista de Rendimiento Deportivo",
      quote: "Una mala alimentación puede convertir a un gran jugador en uno mediocre, pero una buena alimentación potenciará su rendimiento y recuperación al máximo",
      photo: "/fotos_profesionales/catalinacarabias.jpg"
    },
    {
      id: 4,
      name: "Romina Nuñez",
      role: "Nutricionista Deportiva",
      quote: "La unica forma de hacer un gran trabajo, es amar lo que haces",
      photo: "/fotos_profesionales/rominanunez.jpg"
    },
    {
      id: 5,
      name: "Florencia Vargas",
      role: "Nutricionista Deportiva",
      quote: "La nutrición correcta transforma el esfuerzo en éxito",
      photo: "/fotos_profesionales/florenciavargas.jpg"
    },
    {
      id: 6,
      name: "Pablo Espejo",
      role: "Nutricionista Deportivo",
      quote: "Comer es una necesidad, pero para el rendimiento comer es una estrategia.",
      photo: "/fotos_profesionales/pabloespejo.jpg"
    },
    {
      id: 7,
      name: "Cristian Püschel",
      role: "Nutricionista de Rendimiento Deportivo",
      quote: "Debemos estar en un constante ciclo de Aprender y educar",
      photo: "/fotos_profesionales/cristianpuschel.jpg"
    },
    {
      id: 8,
      name: "Nicolás Pérez",
      role: "Nutricionista Deportivo",
      quote: "La nutrición adecuada es fundamental para que un jugador pueda alcanzar su máximo potencial y mantener su peak de rendimiento",
      photo: "/fotos_profesionales/nicolasperez.jpg"
    },
    {
      id: 9,
      name: "Sofía Arancibia",
      role: "Nutricionista Deportiva",
      quote: "Rendimiento y alimentación van de la mano, la ciencia avanza y tu nutrición también debe hacerlo",
      photo: "/fotos_profesionales/sofiaarancibia.jpg"
    },
    {
      id: 10,
      name: "Diego Gómez",
      role: "Nutricionista Deportivo",
      quote: "La nutrición adecuada es el cimiento sobre el cual tu entrenamiento edifica la grandeza atlética",
      photo: "/fotos_profesionales/diegogomez.jpg"
    },
    {
      id: 11,
      name: "Leonel Núñez",
      role: "Nutricionista Deportivo",
      quote: "El que come bien tiene salud y el que tiene salud cumple sus sueños",
      photo: "/fotos_profesionales/leonelnunez.jpg"
    },
    {
      id: 12,
      name: "Paola Meriño",
      role: "Nutricionista Deportiva",
      quote: "El que come bien tiene salud y el que tiene salud cumple sus sueños",
      photo: "/fotos_profesionales/paolamerino.jpg"
    },
    {
      id: 13,
      name: "Cristian Fuentes",
      role: "Nutricionista de Alto Rendimiento",
      quote: "Mejorar la nutrición y composición corporal de un deportista es un arte, hacer que 30 humanos tengan la misma visión de su nutrición es como ir a la luna a pie",
      photo: "/fotos_profesionales/cristianfuentes.jpg"
    },
    {
      id: 14,
      name: "Sebastián Piña",
      role: "Nutricionista Deportivo",
      quote: "Alimentamos el juego, potenciamos el fútbol",
      photo: "/fotos_profesionales/sebastianpina.jpg"
    },
    {
      id: 15,
      name: "Estefanía Gómez",
      role: "Nutricionista Deportiva",
      quote: "Un deportista entrena bien, un atleta entrena y se alimenta bien",
      photo: "/fotos_profesionales/estefaniagomez.jpg"
    }
  ],

  // Misión y Visión Section
  misionVision: {
    mision: {
      title: "Nuestra Misión",
      description: "Ser la asociación referente que promueve la excelencia en nutrición deportiva, fortaleciendo la especialización profesional de nutricionistas en el fútbol chileno a través de formación continua, investigación y aplicación de evidencia científica para optimizar el rendimiento y la salud integral de los deportistas."
    },
    vision: {
      title: "Nuestra Visión",
      description: "Posicionarse como líderes en nutrición deportiva en Latinoamérica, contribuyendo al desarrollo del fútbol profesional chileno mediante profesionales altamente capacitados, innovadores y comprometidos con la excelencia, la ciencia y el bienestar de los atletas."
    }
  },

  // Organigrama Section
  organigrama: {
    title: "Organización 2025-2027",
    subtitle: "Estructura que impulsa la excelencia en nutrición deportiva",
    estructura: [
      {
        id: 1,
        nivel: 1,
        cargo: "Presidente",
        nombre: "Cristian Fuentes",
        descripcion: "Nutricionistas de Alto rendimiento, formado en la Universidad de Concepcion, Magister en Nutrición para la actividad fisica y el deporte. Antropometrista ISAK 3. 12 años trabajando en el fútbol chileno, 10 años en Unión San Felipe. Empresario y desarrollador de innovadores proyectos para el funcionamiento de los profesionales de la Nutricion.",
        foto: "/organigrama/presidente.png",
        area: "Dirección General"
      },
      {
        id: 2,
        nivel: 2,
        cargo: "Vicepresidente",
        nombre: "Cristian Püschel",
        descripcion: "Nutricionista de rendimiento deportivo, Mg. Nutrición y Suplementación Deportiva (UMU), con formación avanzada en Fisiología del Ejercicio y Nutrición Deportiva, certificado ISAK Nivel II, y con experiencia consolidada en el fútbol profesional y selecciones nacionales. Especializado en optimizar el rendimiento, la disponibilidad física y la composición corporal del futbolista mediante estrategias basadas en evidencia y control de procesos.",
        foto: "/organigrama/vicepresidente.png",
        area: "Coordinación Académica"
      },
      {
        id: 3,
        nivel: 2,
        cargo: "Tesorera",
        nombre: "Gabriella Rivera",
        descripcion: "Nutricionista, Diplomada fisiológia del ejercicio, ayudas ergogenicas y rendimiento deportivo ©️Magíster en Nutrición para la Actividad Física y el Deporte . Antropometrista Isak nivel 3 ©️Magister Microbioma y Salud 8 años como Nutricionista Plantel profesional masculino Colo colo. Participación en Libro \"Medicina y Ciencias aplicadas al fútbol\" .clínica MEDS.",
        foto: "/organigrama/tesorera.png",
        area: "Administración"
      },
      {
        id: 4,
        nivel: 2,
        cargo: "Secretaria General",
        nombre: "Danniela Garcia",
        descripcion: "Nutricionista, Magíster en Nutrición para la Actividad Física y el Deporte, Diplomada en docencia universitaria con mención TIC, ISAK nivel II, con 6 años de experiencia en el fútbol profesional y en el desarrollo de deportistas de alto rendimiento. Nutricionista del Programa Promesas Chile, en la Región de Tarapacá, docencia universitaria y técnico profesional, autora de un artículo científico publicado en Journal of the International Society of Sports Nutrition (2020).",
        foto: "/organigrama/secretaria.png",
        area: "Administración"
      },
      {
        id: 5,
        nivel: 3,
        cargo: "Directora Capacitaciones",
        nombre: "Catalina Carabias",
        descripcion: "Nutricionista de rendimiento deportivo (SENR, Reino Unido), con másteres en Nutrición Deportiva, Psiconeuroinmunología y Fisiología del Ejercicio, certificada ISAK III, y con amplia experiencia en equipos de fútbol de élite mundial como FC Barcelona, Athletic Club, Olympique Lyonnais y Watford FC. Actualmente desarrolla su doctorado en la Cátedra Udinese Calcio – Universidad Europea de Madrid, enfocado en nutrición sostenible aplicada al rendimiento y recuperación en el fútbol profesional.",
        foto: "/organigrama/capacitaciones.png",
        area: "Formación Continua"
      },
      {
        id: 6,
        nivel: 3,
        cargo: "Directora Femenino",
        nombre: "Consuelo Rivera",
        descripcion: "Nutricionista, Diplomada en Nutrición deportiva, Diplomada en nutricion Vegetariana y Vegana. Antropometrista Isak II Cursos de actualización en suplementacion y ayudas ergogenicas, deportista vegano, y manejo integral paciente con anorexia y bulimia. 2 años como Nutricionista Plantel profesional Femenino Colo colo y apoyo en categorías inferiores Formativas. Participación en 2 copas libertadores femenina Participación en WWC (Womans World Cup 2024) Nutricionista de CEDAR - Vitacura (centro para el desarrollo del alto rendimiento) apoyando a deportistas juveniles",
        foto: "/organigrama/femenino.png",
        area: "Fútbol Femenino"
      },
      {
        id: 7,
        nivel: 3,
        cargo: "Director Investigación",
        nombre: "Felipe Gonzalez",
        descripcion: "Nutricionista deportivo, con posgrados en Fisiología del Ejercicio, Metodología de la Investigación e Inteligencia Artificial aplicada a las Ciencias de la Salud, y certificación ISAK Nivel II. Se desempeña como académico en la Universidad Santo Tomás y nutricionista del Club Deportes Antofagasta. Actualmente cursa el Doctorado en Ciencias de la Actividad Física y del Deporte en la Universidad Autónoma de Madrid, con una línea de investigación enfocada en la psicometría aplicada a la validación de instrumentos y al estudio del conocimiento y las conductas alimentarias en el fútbol profesional.",
        foto: "/organigrama/investigacion.png",
        area: "Desarrollo Científico"
      }
    ]
  },

  // Footer Links
  footer: {
    navigation: [
      { name: "Inicio", href: "#hero" },
      { name: "Cursos", href: "#cursos" },
      { name: "Misión y Visión", href: "#mision-vision" },
      { name: "Capacitaciones", href: "#capacitaciones" },
      { name: "Profesionales", href: "#profesionales" },
      { name: "Organigrama", href: "#organigrama" }
    ],
    social: [
      { name: "Facebook", icon: "facebook", url: "#" },
      { name: "Instagram", icon: "instagram", url: "https://www.instagram.com/asochinuf/" },
      { name: "Twitter", icon: "twitter", url: "#" },
      { name: "LinkedIn", icon: "linkedin", url: "#" }
    ],
    contact: "asochinuf@gmail.com",
    copyright: "© 2025 ASOCHINUF. Todos los derechos reservados."
  }
};
