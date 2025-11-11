import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const inicializarBD = async () => {
  try {
    console.log('Inicializando base de datos...\\n');

    // ========== TABLA t_usuarios ==========
    console.log('Creando tabla t_usuarios...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        tipo_perfil VARCHAR(50) NOT NULL CHECK (tipo_perfil IN ('admin', 'nutricionista', 'cliente')),
        activo BOOLEAN DEFAULT true,
        foto VARCHAR(255),
        fecha_registro TIMESTAMP DEFAULT NOW(),
        CONSTRAINT email_unique UNIQUE(email)
      );
    `);
    console.log('✓ Tabla t_usuarios creada');

    // Índices para t_usuarios
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_usuarios_email ON t_usuarios(email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_perfil ON t_usuarios(tipo_perfil);`);
    console.log('✓ Índices en t_usuarios creados\\n');

    // ========== TABLA t_pacientes (NEW) ==========
    console.log('Creando tabla t_pacientes...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_pacientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100),
        cedula VARCHAR(20),
        email VARCHAR(255),
        telefono VARCHAR(20),
        fecha_nacimiento DATE,
        activo BOOLEAN DEFAULT true,
        fecha_registro TIMESTAMP DEFAULT NOW(),
        CONSTRAINT cedula_unique UNIQUE(cedula)
      );
    `);
    console.log('✓ Tabla t_pacientes creada');

    // Índices para t_pacientes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pacientes_nombre ON t_pacientes(nombre);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pacientes_cedula ON t_pacientes(cedula);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pacientes_email ON t_pacientes(email);`);
    console.log('✓ Índices en t_pacientes creados\\n');

    // ========== TABLA t_clientes ==========
    console.log('Creando tabla t_clientes...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_clientes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL UNIQUE,
        telefono VARCHAR(20),
        fecha_nacimiento DATE,
        activo BOOLEAN DEFAULT true,
        fecha_registro TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ Tabla t_clientes creada');

    // Índices para t_clientes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_clientes_usuario_id ON t_clientes(usuario_id);`);
    console.log('✓ Índices en t_clientes creados\\n');

    // ========== TABLA t_nutricionistas ==========
    console.log('Creando tabla t_nutricionistas...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_nutricionistas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL UNIQUE,
        especialidad VARCHAR(255),
        licencia VARCHAR(100),
        activo BOOLEAN DEFAULT true,
        fecha_registro TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ Tabla t_nutricionistas creada');

    // Índices para t_nutricionistas
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_nutricionistas_usuario_id ON t_nutricionistas(usuario_id);`);
    console.log('✓ Índices en t_nutricionistas creados\\n');

    // ========== TABLA t_cursos ==========
    console.log('Creando tabla t_cursos...');

    // Eliminar tabla existente si existe
    await pool.query(`DROP TABLE IF EXISTS t_cursos CASCADE;`);

    await pool.query(`
      CREATE TABLE t_cursos (
        id_curso SERIAL PRIMARY KEY,
        codigo_curso VARCHAR(100) NOT NULL UNIQUE,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        categoria_id INTEGER,
        nivel VARCHAR(50),
        duracion_horas INTEGER,
        modalidad VARCHAR(50),
        fecha_inicio DATE,
        fecha_fin DATE,
        precio DECIMAL(10, 2) DEFAULT 0,
        descuento DECIMAL(5, 2) DEFAULT 0,
        precio_final DECIMAL(10, 2),
        moneda VARCHAR(10) DEFAULT 'CLP',
        nombre_instructor VARCHAR(255),
        imagen_portada VARCHAR(255),
        video_promocional VARCHAR(255),
        materiales TEXT,
        url_curso VARCHAR(255),
        estado VARCHAR(50) DEFAULT 'activo',
        fecha_creacion TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Tabla t_cursos creada');

    // Índices para t_cursos
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cursos_codigo ON t_cursos(codigo_curso);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cursos_estado ON t_cursos(estado);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cursos_categoria_id ON t_cursos(categoria_id);`);
    console.log('✓ Índices en t_cursos creados\\n');

    // ========== TABLA t_inscripciones ==========
    console.log('Creando tabla t_inscripciones...');

    // Eliminar tabla existente si existe
    await pool.query(`DROP TABLE IF EXISTS t_inscripciones CASCADE;`);

    await pool.query(`
      CREATE TABLE t_inscripciones (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        id_curso INTEGER NOT NULL,
        fecha_inscripcion TIMESTAMP DEFAULT NOW(),
        estado VARCHAR(50) DEFAULT 'activa',
        FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (id_curso) REFERENCES t_cursos(id_curso) ON DELETE CASCADE,
        UNIQUE(usuario_id, id_curso)
      );
    `);
    console.log('✓ Tabla t_inscripciones creada');

    // Índices para t_inscripciones
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_inscripciones_usuario_id ON t_inscripciones(usuario_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_inscripciones_curso ON t_inscripciones(id_curso);`);
    console.log('✓ Índices en t_inscripciones creados\\n');

    // ========== TABLA t_categorias ==========
    console.log('Creando tabla t_categorias...');

    // Eliminar tabla existente si existe
    await pool.query(`DROP TABLE IF EXISTS t_categorias CASCADE;`);

    await pool.query(`
      CREATE TABLE t_categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        descripcion VARCHAR(255),
        orden INTEGER,
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Tabla t_categorias creada');

    // Insertar categorías predefinidas
    const categorias = [
      { nombre: 'Sub-12', descripcion: 'Categoría Sub-12', orden: 1 },
      { nombre: 'Sub-13', descripcion: 'Categoría Sub-13', orden: 2 },
      { nombre: 'Sub-14', descripcion: 'Categoría Sub-14', orden: 3 },
      { nombre: 'Sub-15', descripcion: 'Categoría Sub-15', orden: 4 },
      { nombre: 'Sub-16', descripcion: 'Categoría Sub-16', orden: 5 },
      { nombre: 'Sub-17', descripcion: 'Categoría Sub-17', orden: 6 },
      { nombre: 'Sub-18', descripcion: 'Categoría Sub-18', orden: 7 },
      { nombre: 'Sub-19', descripcion: 'Categoría Sub-19', orden: 8 },
      { nombre: 'Sub-20', descripcion: 'Categoría Sub-20', orden: 9 },
      { nombre: 'Sub-21', descripcion: 'Categoría Sub-21', orden: 10 },
      { nombre: 'Sub-23', descripcion: 'Categoría Sub-23', orden: 11 },
      { nombre: 'Adulta', descripcion: 'Categoría Adulta', orden: 12 }
    ];

    for (const cat of categorias) {
      await pool.query(
        `INSERT INTO t_categorias (nombre, descripcion, orden)
         VALUES ($1, $2, $3)
         ON CONFLICT (nombre) DO NOTHING`,
        [cat.nombre, cat.descripcion, cat.orden]
      );
    }

    // Índices para t_categorias
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_categorias_orden ON t_categorias(orden);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_categorias_activo ON t_categorias(activo);`);
    console.log('✓ Índices en t_categorias creados\\n');

    // ========== TABLA t_planteles ==========
    console.log('Creando tabla t_planteles...');

    // Eliminar tabla existente si existe
    await pool.query(`DROP TABLE IF EXISTS t_planteles CASCADE;`);

    await pool.query(`
      CREATE TABLE t_planteles (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL UNIQUE,
        division VARCHAR(50) NOT NULL CHECK (division IN ('Primera Division', 'Primera B', 'Segunda División', 'Tercera División A')),
        ciudad VARCHAR(100) NOT NULL,
        region VARCHAR(100) NOT NULL,
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        usuario_creacion INTEGER REFERENCES t_usuarios(id) ON DELETE SET NULL
      );
    `);
    console.log('✓ Tabla t_planteles creada con campos ciudad y región');

    // Índices para t_planteles
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_planteles_nombre ON t_planteles(nombre);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_planteles_activo ON t_planteles(activo);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_planteles_division ON t_planteles(division);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_planteles_region ON t_planteles(region);`);
    console.log('✓ Índices en t_planteles creados');

    // Insertar datos de Primera Division
    const primeraDivision = [
      { nombre: 'Audax Italiano', ciudad: 'Santiago (La Florida)', region: 'Región Metropolitana' },
      { nombre: 'Cobresal', ciudad: 'El Salvador', region: 'Región de Atacama' },
      { nombre: 'Colo-Colo', ciudad: 'Santiago (Macul)', region: 'Región Metropolitana' },
      { nombre: 'Coquimbo Unido', ciudad: 'Coquimbo', region: 'Región de Coquimbo' },
      { nombre: 'Cobreloa', ciudad: 'Calama', region: 'Región de Antofagasta' },
      { nombre: 'Deportes Copiapó', ciudad: 'Copiapó', region: 'Región de Atacama' },
      { nombre: 'Everton', ciudad: 'Viña del Mar', region: 'Región de Valparaíso' },
      { nombre: 'Huachipato', ciudad: 'Talcahuano', region: 'Región del Biobío' },
      { nombre: 'Ñublense', ciudad: 'Chillán', region: 'Región de Ñuble' },
      { nombre: 'O\'Higgins', ciudad: 'Rancagua', region: 'Región de O\'Higgins' },
      { nombre: 'Palestino', ciudad: 'Santiago (La Cisterna)', region: 'Región Metropolitana' },
      { nombre: 'Unión Española', ciudad: 'Santiago (Independencia)', region: 'Región Metropolitana' },
      { nombre: 'Unión La Calera', ciudad: 'La Calera', region: 'Región de Valparaíso' },
      { nombre: 'Universidad Católica', ciudad: 'Santiago (Las Condes)', region: 'Región Metropolitana' },
      { nombre: 'Universidad de Chile', ciudad: 'Santiago (Ñuñoa)', region: 'Región Metropolitana' },
      { nombre: 'Deportes Iquique', ciudad: 'Iquique', region: 'Región de Tarapacá' }
    ];

    for (const equipo of primeraDivision) {
      await pool.query(
        `INSERT INTO t_planteles (nombre, division, ciudad, region)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (nombre) DO NOTHING`,
        [equipo.nombre, 'Primera Division', equipo.ciudad, equipo.region]
      );
    }
    console.log('✓ Insertados 16 equipos de Primera Division');

    // Insertar datos de Primera B
    const primeraB = [
      { nombre: 'Barnechea', ciudad: 'Santiago', region: 'Región Metropolitana' },
      { nombre: 'Universidad de Concepción', ciudad: 'Concepción', region: 'Región del Biobío' },
      { nombre: 'San Marcos de Arica', ciudad: 'Arica', region: 'Región de Arica y Parinacota' },
      { nombre: 'Deportes Antofagasta', ciudad: 'Antofagasta', region: 'Región de Antofagasta' },
      { nombre: 'Rangers de Talca', ciudad: 'Talca', region: 'Región del Maule' },
      { nombre: 'Santiago Wanderers', ciudad: 'Valparaíso', region: 'Región de Valparaíso' },
      { nombre: 'San Luis de Quillota', ciudad: 'Quillota', region: 'Región de Valparaíso' },
      { nombre: 'Deportes Recoleta', ciudad: 'Santiago (Recoleta)', region: 'Región Metropolitana' },
      { nombre: 'Club de Deportes Magallanes', ciudad: 'San Bernardo (Santiago)', region: 'Región Metropolitana' },
      { nombre: 'Curicó Unido', ciudad: 'Curicó', region: 'Región del Maule' },
      { nombre: 'Deportes Santa Cruz', ciudad: 'Santa Cruz', region: 'Región del Libertador General Bernardo O\'Higgins' },
      { nombre: 'Unión San Felipe', ciudad: 'San Felipe', region: 'Región de Valparaíso' },
      { nombre: 'Deportes Temuco', ciudad: 'Temuco', region: 'Región de La Araucanía' },
      { nombre: 'Santiago Morning', ciudad: 'Santiago (La Pintana)', region: 'Región Metropolitana' }
    ];

    for (const equipo of primeraB) {
      await pool.query(
        `INSERT INTO t_planteles (nombre, division, ciudad, region)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (nombre) DO NOTHING`,
        [equipo.nombre, 'Primera B', equipo.ciudad, equipo.region]
      );
    }
    console.log('✓ Insertados 14 equipos de Primera B');

    // Insertar datos de Segunda División
    const segundaDivision = [
      { nombre: 'Deportes Puerto Montt', ciudad: 'Puerto Montt', region: 'Región de Los Lagos' },
      { nombre: 'Provincial Ovalle', ciudad: 'Ovalle', region: 'Región de Coquimbo' },
      { nombre: 'Provincial Osorno', ciudad: 'Osorno', region: 'Región de Los Lagos' },
      { nombre: 'General Velásquez', ciudad: 'San Vicente de Tagua Tagua', region: 'Región de O\'Higgins' },
      { nombre: 'Deportes Linares', ciudad: 'Linares', region: 'Región del Maule' },
      { nombre: 'Deportes Rengo', ciudad: 'Rengo', region: 'Región de O\'Higgins' },
      { nombre: 'Deportes Concepción', ciudad: 'Concepción', region: 'Región del Biobío' },
      { nombre: 'San Antonio Unido', ciudad: 'San Antonio', region: 'Región de Valparaíso' },
      { nombre: 'Real San Joaquín', ciudad: 'Santiago', region: 'Región Metropolitana' },
      { nombre: 'Trasandino', ciudad: 'Los Andes', region: 'Región de Valparaíso' },
      { nombre: 'Concón National', ciudad: 'Concón', region: 'Región de Valparaíso' },
      { nombre: 'Brujas de Salamanca', ciudad: 'Salamanca', region: 'Región de Coquimbo' },
      { nombre: 'Deportes Melipilla', ciudad: 'Melipilla', region: 'Región Metropolitana' },
      { nombre: 'Santiago City', ciudad: 'Santiago', region: 'Región Metropolitana' }
    ];

    for (const equipo of segundaDivision) {
      await pool.query(
        `INSERT INTO t_planteles (nombre, division, ciudad, region)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (nombre) DO NOTHING`,
        [equipo.nombre, 'Segunda División', equipo.ciudad, equipo.region]
      );
    }
    console.log('✓ Insertados 14 equipos de Segunda División\\n');

    // ========== TABLA t_sesion_mediciones ==========
    console.log('Creando tabla t_sesion_mediciones...');

    // Eliminar tabla existente si existe (depende de t_planteles y t_categorias)
    await pool.query(`DROP TABLE IF EXISTS t_sesion_mediciones CASCADE;`);

    await pool.query(`
      CREATE TABLE t_sesion_mediciones (
        id SERIAL PRIMARY KEY,
        plantel_id INTEGER REFERENCES t_planteles(id) ON DELETE RESTRICT,
        categoria_id INTEGER REFERENCES t_categorias(id) ON DELETE RESTRICT,
        fecha_sesion DATE NOT NULL,
        nutricionista_id INTEGER REFERENCES t_usuarios(id) ON DELETE SET NULL,
        archivo_hash VARCHAR(64) NOT NULL,
        cantidad_registros INTEGER NOT NULL,
        fecha_carga TIMESTAMP DEFAULT NOW(),
        UNIQUE(plantel_id, categoria_id, fecha_sesion, archivo_hash)
      );
    `);
    console.log('✓ Tabla t_sesion_mediciones creada');

    // Índices para t_sesion_mediciones
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sesion_plantel ON t_sesion_mediciones(plantel_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sesion_categoria ON t_sesion_mediciones(categoria_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sesion_fecha ON t_sesion_mediciones(fecha_sesion);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sesion_nutricionista ON t_sesion_mediciones(nutricionista_id);`);
    console.log('✓ Índices en t_sesion_mediciones creados\\n');

    // ========== TABLA t_informe_antropometrico ==========
    console.log('Creando tabla t_informe_antropometrico...');

    // Eliminar tabla existente si existe (depende de t_sesion_mediciones)
    await pool.query(`DROP TABLE IF EXISTS t_informe_antropometrico CASCADE;`);

    await pool.query(`
      CREATE TABLE t_informe_antropometrico (
        id SERIAL PRIMARY KEY,
        paciente_id INTEGER NOT NULL,
        fecha_medicion DATE NOT NULL,
        sesion_id INTEGER NOT NULL,
        nutricionista_id INTEGER NOT NULL,
        fecha_registro TIMESTAMP DEFAULT NOW(),

        -- Medidas básicas [kg, cm]
        peso DECIMAL(6, 2),
        talla DECIMAL(5, 2),
        talla_sentado DECIMAL(5, 2),

        -- Diámetros [cm]
        diametro_biacromial DECIMAL(6, 2),
        diametro_torax DECIMAL(6, 2),
        diametro_antpost_torax DECIMAL(6, 2),
        diametro_biiliocristal DECIMAL(6, 2),
        diametro_bitrocanterea DECIMAL(6, 2),
        diametro_humero DECIMAL(6, 2),
        diametro_femur DECIMAL(6, 2),

        -- Perímetros [cm]
        perimetro_brazo_relajado DECIMAL(6, 2),
        perimetro_brazo_flexionado DECIMAL(6, 2),
        perimetro_muslo_anterior DECIMAL(6, 2),
        perimetro_pantorrilla DECIMAL(6, 2),

        -- Pliegues [mm]
        pliegue_triceps DECIMAL(6, 2),
        pliegue_subescapular DECIMAL(6, 2),
        pliegue_supraespinal DECIMAL(6, 2),
        pliegue_abdominal DECIMAL(6, 2),
        pliegue_muslo_anterior DECIMAL(6, 2),
        pliegue_pantorrilla_medial DECIMAL(6, 2),

        -- Masa Adiposa por Zona [%]
        masa_adiposa_superior DECIMAL(5, 2),
        masa_adiposa_media DECIMAL(5, 2),
        masa_adiposa_inferior DECIMAL(5, 2),

        -- Índices
        imo DECIMAL(5, 2),
        imc DECIMAL(5, 2),
        icc DECIMAL(5, 2),
        ica DECIMAL(5, 2),

        -- Sumatoria de Pliegues [mm]
        suma_6_pliegues DECIMAL(6, 2),
        suma_8_pliegues DECIMAL(6, 2),

        -- Notas
        notas TEXT,

        FOREIGN KEY (paciente_id) REFERENCES t_pacientes(id) ON DELETE CASCADE,
        FOREIGN KEY (sesion_id) REFERENCES t_sesion_mediciones(id) ON DELETE CASCADE,
        FOREIGN KEY (nutricionista_id) REFERENCES t_usuarios(id) ON DELETE SET NULL
      );
    `);
    console.log('✓ Tabla t_informe_antropometrico creada');

    // Índices para t_informe_antropometrico (CRÍTICO PARA PERFORMANCE)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_informe_paciente_id ON t_informe_antropometrico(paciente_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_informe_sesion_id ON t_informe_antropometrico(sesion_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_informe_nutricionista_id ON t_informe_antropometrico(nutricionista_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_informe_paciente_sesion ON t_informe_antropometrico(paciente_id, sesion_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_informe_fecha_medicion ON t_informe_antropometrico(fecha_medicion);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_informe_fecha_registro ON t_informe_antropometrico(fecha_registro);`);
    console.log('✓ Índices en t_informe_antropometrico creados\\n');

    // ========== TABLA t_excel_uploads ==========
    console.log('Creando tabla t_excel_uploads...');

    // Eliminar tabla existente si existe (depende de t_sesion_mediciones)
    await pool.query(`DROP TABLE IF EXISTS t_excel_uploads CASCADE;`);

    await pool.query(`
      CREATE TABLE t_excel_uploads (
        id SERIAL PRIMARY KEY,
        sesion_id INTEGER NOT NULL,
        nutricionista_id INTEGER NOT NULL,
        nombre_archivo VARCHAR(255) NOT NULL,
        hash_archivo VARCHAR(64) NOT NULL,
        cantidad_registros INTEGER DEFAULT 0,
        fecha_carga TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (sesion_id) REFERENCES t_sesion_mediciones(id) ON DELETE CASCADE,
        FOREIGN KEY (nutricionista_id) REFERENCES t_usuarios(id) ON DELETE CASCADE,
        UNIQUE(hash_archivo)
      );
    `);
    console.log('✓ Tabla t_excel_uploads creada');

    // Índices para t_excel_uploads
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_excel_uploads_sesion_id ON t_excel_uploads(sesion_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_excel_uploads_nutricionista_id ON t_excel_uploads(nutricionista_id);`);
    console.log('✓ Índices en t_excel_uploads creados\\n');

    // ========== TABLA t_recovery_tokens ==========
    console.log('Creando tabla t_recovery_tokens...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_recovery_tokens (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        fecha_expiracion TIMESTAMP NOT NULL,
        usado BOOLEAN DEFAULT false,
        fecha_uso TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ Tabla t_recovery_tokens creada');

    // Índices para t_recovery_tokens
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_recovery_tokens_usuario_id ON t_recovery_tokens(usuario_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_recovery_tokens_token ON t_recovery_tokens(token);`);
    console.log('✓ Índices en t_recovery_tokens creados\\n');

    // ========== TABLA t_cuotas_mensuales (GLOBAL) ==========
    console.log('Creando tabla t_cuotas_mensuales (Cuotas Globales)...');
    // Eliminar tablas antiguas si existen (en orden de dependencias)
    await pool.query(`DROP TABLE IF EXISTS t_pagos_cuotas CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS t_cuotas_usuario CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS t_cuotas_mensuales CASCADE;`);
    await pool.query(`
      CREATE TABLE t_cuotas_mensuales (
        id SERIAL PRIMARY KEY,
        mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
        ano INTEGER NOT NULL,
        monto DECIMAL(10, 2) NOT NULL,
        fecha_vencimiento DATE NOT NULL,
        descripcion TEXT,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        UNIQUE(mes, ano)
      );
    `);
    console.log('✓ Tabla t_cuotas_mensuales creada (Cuotas Globales)');

    // Índices para t_cuotas_mensuales
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cuotas_mes_ano ON t_cuotas_mensuales(mes, ano);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cuotas_fecha_vencimiento ON t_cuotas_mensuales(fecha_vencimiento);`);
    console.log('✓ Índices en t_cuotas_mensuales creados\\n');

    // ========== TABLA t_cuotas_usuario ==========
    console.log('Creando tabla t_cuotas_usuario...');
    await pool.query(`
      CREATE TABLE t_cuotas_usuario (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        cuota_id INTEGER NOT NULL,
        estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'vencido', 'cancelado')),
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (cuota_id) REFERENCES t_cuotas_mensuales(id) ON DELETE CASCADE,
        UNIQUE(usuario_id, cuota_id)
      );
    `);
    console.log('✓ Tabla t_cuotas_usuario creada');

    // Índices para t_cuotas_usuario
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cuotas_usuario_id ON t_cuotas_usuario(usuario_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cuotas_usuario_cuota_id ON t_cuotas_usuario(cuota_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cuotas_usuario_estado ON t_cuotas_usuario(estado);`);
    console.log('✓ Índices en t_cuotas_usuario creados\\n');

    // ========== TABLA t_pagos_cuotas ==========
    console.log('Creando tabla t_pagos_cuotas...');
    // Eliminar tabla antigua si existe
    await pool.query(`DROP TABLE IF EXISTS t_pagos_cuotas CASCADE;`);
    await pool.query(`
      CREATE TABLE t_pagos_cuotas (
        id SERIAL PRIMARY KEY,
        cuota_usuario_id INTEGER NOT NULL,
        monto_pagado DECIMAL(10, 2) NOT NULL,
        metodo_pago VARCHAR(50) DEFAULT 'mercado_pago' CHECK (metodo_pago IN ('mercado_pago', 'transferencia', 'efectivo')),
        referencia_pago VARCHAR(255),
        estado_pago VARCHAR(50) DEFAULT 'completado' CHECK (estado_pago IN ('pendiente', 'completado', 'rechazado', 'cancelado')),
        id_mercado_pago VARCHAR(255),
        estado_mercado_pago VARCHAR(50),
        fecha_pago TIMESTAMP DEFAULT NOW(),
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        notas TEXT,
        FOREIGN KEY (cuota_usuario_id) REFERENCES t_cuotas_usuario(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ Tabla t_pagos_cuotas creada');

    // Índices para t_pagos_cuotas
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pagos_cuota_usuario_id ON t_pagos_cuotas(cuota_usuario_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pagos_estado ON t_pagos_cuotas(estado_pago);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pagos_id_mercado_pago ON t_pagos_cuotas(id_mercado_pago);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pagos_fecha_pago ON t_pagos_cuotas(fecha_pago);`);
    console.log('✓ Índices en t_pagos_cuotas creados\\n');

    // ========== TABLA t_documentos ==========
    console.log('Creando tabla t_documentos...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_documentos (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        archivo_url VARCHAR(255) NOT NULL,
        categoria VARCHAR(100),
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP DEFAULT NOW(),
        visible BOOLEAN DEFAULT true,
        usuario_creacion INTEGER REFERENCES t_usuarios(id) ON DELETE SET NULL
      );
    `);
    console.log('✓ Tabla t_documentos creada');

    // Índices para t_documentos
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON t_documentos(categoria);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_documentos_visible ON t_documentos(visible);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_documentos_fecha_creacion ON t_documentos(fecha_creacion);`);
    console.log('✓ Índices en t_documentos creados\\n');

    console.log('\\n========================================');
    console.log('✓ BASE DE DATOS INICIALIZADA CORRECTAMENTE');
    console.log('========================================\\n');
    console.log('Tablas creadas:');
    console.log('  • t_usuarios (admin, nutricionista, cliente)');
    console.log('  • t_pacientes (datos de pacientes)');
    console.log('  • t_clientes (relación usuario-cliente)');
    console.log('  • t_nutricionistas (relación usuario-nutricionista)');
    console.log('  • t_cursos (cursos disponibles)');
    console.log('  • t_inscripciones (inscripciones a cursos)');
    console.log('  • t_planteles (equipos/planteles)');
    console.log('  • t_sesion_mediciones (sesiones de mediciones)');
    console.log('  • t_informe_antropometrico (mediciones detalladas)');
    console.log('  • t_excel_uploads (control de cargas Excel)');
    console.log('  • t_recovery_tokens (tokens de recuperación)');
    console.log('  • t_cuotas_mensuales (cuotas mensuales)');
    console.log('  • t_pagos_cuotas (registro de pagos de cuotas)');
    console.log('  • t_documentos (documentos y papers)\\n');
    console.log('Índices creados para optimizar consultas frecuentes.\\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

inicializarBD();
