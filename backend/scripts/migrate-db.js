import pool from '../config/database.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

/**
 * Script de migración de datos desde Neon a Railway
 *
 * INSTRUCCIONES:
 * 1. Actualizar .env con ambas URLs:
 *    - DATABASE_URL: Neon (origen)
 *    - RAILWAY_DATABASE_URL: Railway (destino)
 * 2. Ejecutar: node scripts/migrate-db.js
 */

const NEON_URL = process.env.DATABASE_URL; // BD Neon (origen)
const RAILWAY_URL = process.env.RAILWAY_DATABASE_URL; // BD Railway (destino)

// Validar variables de entorno
if (!NEON_URL) {
  console.error('❌ ERROR: DATABASE_URL (Neon) no está configurada en .env');
  process.exit(1);
}

if (!RAILWAY_URL) {
  console.error('❌ ERROR: RAILWAY_DATABASE_URL no está configurada en .env');
  console.log('Agrega esta línea a tu .env:');
  console.log('RAILWAY_DATABASE_URL=postgresql://user:pass@host/dbname');
  process.exit(1);
}

let sourcePool; // Pool de Neon
let targetPool; // Pool de Railway

const connect = async () => {
  console.log('🔌 Conectando a bases de datos...\n');

  try {
    // Conexión a Neon (origen)
    sourcePool = new Pool({
      connectionString: NEON_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });

    // Conexión a Railway (destino)
    targetPool = new Pool({
      connectionString: RAILWAY_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });

    // Probar conexiones
    const neonTest = await sourcePool.query('SELECT NOW()');
    const railwayTest = await targetPool.query('SELECT NOW()');

    console.log('✓ Conectado a Neon (origen)');
    console.log('✓ Conectado a Railway (destino)\n');

    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
};

const migrateData = async () => {
  try {
    console.log('📋 Iniciando migración de datos...\n');

    // Deshabilitar constraint checks temporalmente en Railway
    console.log('1️⃣  Deshabilitando constraints en Railway...');
    await targetPool.query('SET session_replication_role = replica;');

    // Tabla: t_usuarios
    console.log('2️⃣  Migrando t_usuarios...');
    const usuarios = await sourcePool.query('SELECT * FROM t_usuarios;');
    for (const usuario of usuarios.rows) {
      await targetPool.query(
        `INSERT INTO t_usuarios (id, email, password_hash, nombre, apellido, tipo_perfil, activo, foto, fecha_registro)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email`,
        [
          usuario.id,
          usuario.email,
          usuario.password_hash,
          usuario.nombre,
          usuario.apellido,
          usuario.tipo_perfil,
          usuario.activo,
          usuario.foto,
          usuario.fecha_registro,
        ]
      );
    }
    console.log(`   ✓ ${usuarios.rows.length} usuarios migrados`);

    // Actualizar secuencia de t_usuarios
    const maxUserId = await targetPool.query('SELECT MAX(id) FROM t_usuarios;');
    const maxId = maxUserId.rows[0].max || 0;
    await targetPool.query(`SELECT setval('t_usuarios_id_seq', ${maxId + 1})`);

    // Tabla: t_pacientes
    console.log('3️⃣  Migrando t_pacientes...');
    const pacientes = await sourcePool.query('SELECT * FROM t_pacientes;');
    for (const paciente of pacientes.rows) {
      await targetPool.query(
        `INSERT INTO t_pacientes (id, nombre, apellido, cedula, email, telefono, fecha_nacimiento, activo, fecha_registro)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET cedula = EXCLUDED.cedula`,
        [
          paciente.id,
          paciente.nombre,
          paciente.apellido,
          paciente.cedula,
          paciente.email,
          paciente.telefono,
          paciente.fecha_nacimiento,
          paciente.activo,
          paciente.fecha_registro,
        ]
      );
    }
    console.log(`   ✓ ${pacientes.rows.length} pacientes migrados`);

    // Actualizar secuencia de t_pacientes
    const maxPacienteId = await targetPool.query('SELECT MAX(id) FROM t_pacientes;');
    const maxPacId = maxPacienteId.rows[0].max || 0;
    await targetPool.query(`SELECT setval('t_pacientes_id_seq', ${maxPacId + 1})`);

    // Tabla: t_clientes
    console.log('4️⃣  Migrando t_clientes...');
    const clientes = await sourcePool.query('SELECT * FROM t_clientes;');
    for (const cliente of clientes.rows) {
      await targetPool.query(
        `INSERT INTO t_clientes (id, usuario_id, telefono, fecha_nacimiento, activo, fecha_registro)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET usuario_id = EXCLUDED.usuario_id`,
        [
          cliente.id,
          cliente.usuario_id,
          cliente.telefono,
          cliente.fecha_nacimiento,
          cliente.activo,
          cliente.fecha_registro,
        ]
      );
    }
    console.log(`   ✓ ${clientes.rows.length} clientes migrados`);

    // Actualizar secuencia de t_clientes
    const maxClienteId = await targetPool.query('SELECT MAX(id) FROM t_clientes;');
    const maxCliId = maxClienteId.rows[0].max || 0;
    await targetPool.query(`SELECT setval('t_clientes_id_seq', ${maxCliId + 1})`);

    // Tabla: t_nutricionistas
    console.log('5️⃣  Migrando t_nutricionistas...');
    const nutricionistas = await sourcePool.query('SELECT * FROM t_nutricionistas;');
    for (const nut of nutricionistas.rows) {
      await targetPool.query(
        `INSERT INTO t_nutricionistas (id, usuario_id, especialidad, licencia, activo, fecha_registro)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET usuario_id = EXCLUDED.usuario_id`,
        [nut.id, nut.usuario_id, nut.especialidad, nut.licencia, nut.activo, nut.fecha_registro]
      );
    }
    console.log(`   ✓ ${nutricionistas.rows.length} nutricionistas migrados`);

    // Actualizar secuencia
    const maxNutId = await targetPool.query('SELECT MAX(id) FROM t_nutricionistas;');
    const maxNId = maxNutId.rows[0].max || 0;
    await targetPool.query(`SELECT setval('t_nutricionistas_id_seq', ${maxNId + 1})`);

    // Tabla: t_planteles (datos predefinidos, solo actualizar si hay custom)
    console.log('6️⃣  Verificando t_planteles...');
    const planteles = await sourcePool.query('SELECT * FROM t_planteles;');
    const planteleCount = await targetPool.query('SELECT COUNT(*) as count FROM t_planteles;');

    if (planteleCount.rows[0].count === 0) {
      console.log('   BD destino vacía, migrando planteles...');
      for (const plantel of planteles.rows) {
        await targetPool.query(
          `INSERT INTO t_planteles (id, nombre, division, ciudad, region, activo, fecha_creacion, usuario_creacion)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (nombre) DO NOTHING`,
          [
            plantel.id,
            plantel.nombre,
            plantel.division,
            plantel.ciudad,
            plantel.region,
            plantel.activo,
            plantel.fecha_creacion,
            plantel.usuario_creacion,
          ]
        );
      }
      const maxPlantelId = await targetPool.query('SELECT MAX(id) FROM t_planteles;');
      const maxPId = maxPlantelId.rows[0].max || 0;
      await targetPool.query(`SELECT setval('t_planteles_id_seq', ${maxPId + 1})`);
      console.log(`   ✓ ${planteles.rows.length} planteles migrados`);
    } else {
      console.log('   ✓ Planteles ya existen en destino, omitiendo');
    }

    // Tabla: t_categorias (datos predefinidos)
    console.log('7️⃣  Verificando t_categorias...');
    const categoriaCount = await targetPool.query('SELECT COUNT(*) as count FROM t_categorias;');

    if (categoriaCount.rows[0].count === 0) {
      const categorias = await sourcePool.query('SELECT * FROM t_categorias;');
      for (const cat of categorias.rows) {
        await targetPool.query(
          `INSERT INTO t_categorias (id, nombre, descripcion, orden, activo, fecha_creacion)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (nombre) DO NOTHING`,
          [cat.id, cat.nombre, cat.descripcion, cat.orden, cat.activo, cat.fecha_creacion]
        );
      }
      const maxCatId = await targetPool.query('SELECT MAX(id) FROM t_categorias;');
      const maxCId = maxCatId.rows[0].max || 0;
      await targetPool.query(`SELECT setval('t_categorias_id_seq', ${maxCId + 1})`);
      console.log(`   ✓ ${categorias.rows.length} categorías migradas`);
    } else {
      console.log('   ✓ Categorías ya existen en destino, omitiendo');
    }

    // Tabla: t_sesion_mediciones
    console.log('8️⃣  Migrando t_sesion_mediciones...');
    const sesiones = await sourcePool.query('SELECT * FROM t_sesion_mediciones;');
    for (const sesion of sesiones.rows) {
      await targetPool.query(
        `INSERT INTO t_sesion_mediciones (id, plantel_id, categoria_id, fecha_sesion, nutricionista_id, archivo_hash, cantidad_registros, fecha_carga)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET fecha_sesion = EXCLUDED.fecha_sesion`,
        [
          sesion.id,
          sesion.plantel_id,
          sesion.categoria_id,
          sesion.fecha_sesion,
          sesion.nutricionista_id,
          sesion.archivo_hash,
          sesion.cantidad_registros,
          sesion.fecha_carga,
        ]
      );
    }
    console.log(`   ✓ ${sesiones.rows.length} sesiones de mediciones migradas`);

    // Actualizar secuencia
    const maxSesionId = await targetPool.query('SELECT MAX(id) FROM t_sesion_mediciones;');
    const maxSId = maxSesionId.rows[0].max || 0;
    await targetPool.query(`SELECT setval('t_sesion_mediciones_id_seq', ${maxSId + 1})`);

    // Tabla: t_informe_antropometrico (MÁS IMPORTANTE - DATOS DE MEDICIONES)
    console.log('9️⃣  Migrando t_informe_antropometrico...');
    const informes = await sourcePool.query('SELECT * FROM t_informe_antropometrico;');

    for (const informe of informes.rows) {
      await targetPool.query(
        `INSERT INTO t_informe_antropometrico (
          id, paciente_id, fecha_medicion, sesion_id, nutricionista_id, fecha_registro,
          peso, talla, talla_sentado,
          diametro_biacromial, diametro_torax, diametro_antpost_torax, diametro_biiliocristal,
          diametro_bitrocanterea, diametro_humero, diametro_femur,
          perimetro_brazo_relajado, perimetro_brazo_flexionado, perimetro_muslo_anterior, perimetro_pantorrilla,
          pliegue_triceps, pliegue_subescapular, pliegue_supraespinal, pliegue_abdominal,
          pliegue_muslo_anterior, pliegue_pantorrilla_medial,
          masa_adiposa_superior, masa_adiposa_media, masa_adiposa_inferior,
          imo, imc, icc, ica, suma_6_pliegues, suma_8_pliegues, notas
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9,
          $10, $11, $12, $13,
          $14, $15, $16,
          $17, $18, $19, $20,
          $21, $22, $23, $24,
          $25, $26,
          $27, $28, $29,
          $30, $31, $32, $33, $34, $35, $36
        )
         ON CONFLICT (id) DO UPDATE SET paciente_id = EXCLUDED.paciente_id`,
        [
          informe.id,
          informe.paciente_id,
          informe.fecha_medicion,
          informe.sesion_id,
          informe.nutricionista_id,
          informe.fecha_registro,
          informe.peso,
          informe.talla,
          informe.talla_sentado,
          informe.diametro_biacromial,
          informe.diametro_torax,
          informe.diametro_antpost_torax,
          informe.diametro_biiliocristal,
          informe.diametro_bitrocanterea,
          informe.diametro_humero,
          informe.diametro_femur,
          informe.perimetro_brazo_relajado,
          informe.perimetro_brazo_flexionado,
          informe.perimetro_muslo_anterior,
          informe.perimetro_pantorrilla,
          informe.pliegue_triceps,
          informe.pliegue_subescapular,
          informe.pliegue_supraespinal,
          informe.pliegue_abdominal,
          informe.pliegue_muslo_anterior,
          informe.pliegue_pantorrilla_medial,
          informe.masa_adiposa_superior,
          informe.masa_adiposa_media,
          informe.masa_adiposa_inferior,
          informe.imo,
          informe.imc,
          informe.icc,
          informe.ica,
          informe.suma_6_pliegues,
          informe.suma_8_pliegues,
          informe.notas,
        ]
      );
    }
    console.log(`   ✓ ${informes.rows.length} informes antropométricos migrados`);

    // Actualizar secuencia
    const maxInformeId = await targetPool.query('SELECT MAX(id) FROM t_informe_antropometrico;');
    const maxIId = maxInformeId.rows[0].max || 0;
    await targetPool.query(`SELECT setval('t_informe_antropometrico_id_seq', ${maxIId + 1})`);

    // Tabla: t_cursos
    console.log('🔟 Migrando t_cursos...');
    const cursos = await sourcePool.query('SELECT * FROM t_cursos;');
    for (const curso of cursos.rows) {
      await targetPool.query(
        `INSERT INTO t_cursos (
          id_curso, codigo_curso, nombre, descripcion, categoria_id, nivel,
          duracion_horas, modalidad, fecha_inicio, fecha_fin, precio, descuento,
          precio_final, moneda, nombre_instructor, imagen_portada, video_promocional,
          materiales, url_curso, estado, fecha_creacion
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        )
         ON CONFLICT (id_curso) DO UPDATE SET codigo_curso = EXCLUDED.codigo_curso`,
        [
          curso.id_curso,
          curso.codigo_curso,
          curso.nombre,
          curso.descripcion,
          curso.categoria_id,
          curso.nivel,
          curso.duracion_horas,
          curso.modalidad,
          curso.fecha_inicio,
          curso.fecha_fin,
          curso.precio,
          curso.descuento,
          curso.precio_final,
          curso.moneda,
          curso.nombre_instructor,
          curso.imagen_portada,
          curso.video_promocional,
          curso.materiales,
          curso.url_curso,
          curso.estado,
          curso.fecha_creacion,
        ]
      );
    }
    console.log(`   ✓ ${cursos.rows.length} cursos migrados`);

    // Tabla: t_inscripciones
    console.log('1️⃣1️⃣ Migrando t_inscripciones...');
    const inscripciones = await sourcePool.query('SELECT * FROM t_inscripciones;');
    for (const insc of inscripciones.rows) {
      await targetPool.query(
        `INSERT INTO t_inscripciones (id, usuario_id, id_curso, fecha_inscripcion, estado)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET usuario_id = EXCLUDED.usuario_id`,
        [insc.id, insc.usuario_id, insc.id_curso, insc.fecha_inscripcion, insc.estado]
      );
    }
    console.log(`   ✓ ${inscripciones.rows.length} inscripciones migradas`);

    // Tabla: t_recovery_tokens
    console.log('1️⃣2️⃣ Migrando t_recovery_tokens...');
    const tokens = await sourcePool.query('SELECT * FROM t_recovery_tokens;');
    for (const token of tokens.rows) {
      await targetPool.query(
        `INSERT INTO t_recovery_tokens (id, usuario_id, token, fecha_creacion, fecha_expiracion, usado, fecha_uso)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET token = EXCLUDED.token`,
        [
          token.id,
          token.usuario_id,
          token.token,
          token.fecha_creacion,
          token.fecha_expiracion,
          token.usado,
          token.fecha_uso,
        ]
      );
    }
    console.log(`   ✓ ${tokens.rows.length} tokens de recuperación migrados`);

    // Tabla: t_cuotas_mensuales
    console.log('1️⃣3️⃣ Migrando t_cuotas_mensuales...');
    const cuotas = await sourcePool.query('SELECT * FROM t_cuotas_mensuales;');
    for (const cuota of cuotas.rows) {
      await targetPool.query(
        `INSERT INTO t_cuotas_mensuales (id, mes, ano, monto, fecha_vencimiento, descripcion, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET monto = EXCLUDED.monto`,
        [
          cuota.id,
          cuota.mes,
          cuota.ano,
          cuota.monto,
          cuota.fecha_vencimiento,
          cuota.descripcion,
          cuota.fecha_creacion,
        ]
      );
    }
    console.log(`   ✓ ${cuotas.rows.length} cuotas mensuales migradas`);

    // Tabla: t_cuotas_usuario
    console.log('1️⃣4️⃣ Migrando t_cuotas_usuario...');
    const cuotasUsuario = await sourcePool.query('SELECT * FROM t_cuotas_usuario;');
    for (const cu of cuotasUsuario.rows) {
      await targetPool.query(
        `INSERT INTO t_cuotas_usuario (id, usuario_id, cuota_id, estado, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado`,
        [cu.id, cu.usuario_id, cu.cuota_id, cu.estado, cu.fecha_creacion]
      );
    }
    console.log(`   ✓ ${cuotasUsuario.rows.length} cuotas de usuario migradas`);

    // Tabla: t_pagos_cuotas
    console.log('1️⃣5️⃣ Migrando t_pagos_cuotas...');
    const pagos = await sourcePool.query('SELECT * FROM t_pagos_cuotas;');
    for (const pago of pagos.rows) {
      await targetPool.query(
        `INSERT INTO t_pagos_cuotas (
          id, cuota_usuario_id, monto_pagado, metodo_pago, referencia_pago,
          estado_pago, id_mercado_pago, estado_mercado_pago, fecha_pago, fecha_creacion, notas
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
         ON CONFLICT (id) DO UPDATE SET monto_pagado = EXCLUDED.monto_pagado`,
        [
          pago.id,
          pago.cuota_usuario_id,
          pago.monto_pagado,
          pago.metodo_pago,
          pago.referencia_pago,
          pago.estado_pago,
          pago.id_mercado_pago,
          pago.estado_mercado_pago,
          pago.fecha_pago,
          pago.fecha_creacion,
          pago.notas,
        ]
      );
    }
    console.log(`   ✓ ${pagos.rows.length} pagos de cuotas migrados`);

    // Tabla: t_excel_uploads
    console.log('1️⃣6️⃣ Migrando t_excel_uploads...');
    const uploads = await sourcePool.query('SELECT * FROM t_excel_uploads;');
    for (const upload of uploads.rows) {
      await targetPool.query(
        `INSERT INTO t_excel_uploads (id, sesion_id, nutricionista_id, nombre_archivo, hash_archivo, cantidad_registros, fecha_carga)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET nombre_archivo = EXCLUDED.nombre_archivo`,
        [
          upload.id,
          upload.sesion_id,
          upload.nutricionista_id,
          upload.nombre_archivo,
          upload.hash_archivo,
          upload.cantidad_registros,
          upload.fecha_carga,
        ]
      );
    }
    console.log(`   ✓ ${uploads.rows.length} cargas Excel migradas`);

    // Actualizar secuencia
    const maxUploadId = await targetPool.query('SELECT MAX(id) FROM t_excel_uploads;');
    const maxUId = maxUploadId.rows[0].max || 0;
    await targetPool.query(`SELECT setval('t_excel_uploads_id_seq', ${maxUId + 1})`);

    // Habilitar constraints nuevamente
    console.log('\n✅ Habilitando constraints en Railway...');
    await targetPool.query('SET session_replication_role = default;');

    console.log('\n✅ MIGRACIÓN COMPLETADA CON ÉXITO\n');

    return true;
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error(error);

    // Intentar habilitar constraints de todas formas
    try {
      await targetPool.query('SET session_replication_role = default;');
    } catch (e) {
      console.log('(No se pudo habilitar constraints)');
    }

    return false;
  }
};

const disconnect = async () => {
  if (sourcePool) await sourcePool.end();
  if (targetPool) await targetPool.end();
};

const main = async () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   MIGRACIÓN DE BD: NEON → RAILWAY');
  console.log('═══════════════════════════════════════════════════════\n');

  const connected = await connect();
  if (!connected) {
    await disconnect();
    process.exit(1);
  }

  const success = await migrateData();
  await disconnect();

  if (success) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ MIGRACIÓN EXITOSA');
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.log('═══════════════════════════════════════════════════════');
    console.log('❌ MIGRACIÓN FALLIDA');
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(1);
  }
};

main();
