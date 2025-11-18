import pool from '../config/database.js';
import { parseExcelFile, generateFileHash, validateExcelStructure } from '../utils/excelParser.js';
import fs from 'fs';
import path from 'path';

/**
 * Cargar archivo Excel con datos antropométricos
 * Solo nutricionistas y administradores pueden acceder
 */
export const uploadExcelFile = async (req, res) => {
  try {
    // Verificar que se envió un archivo
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }

    const usuarioId = req.usuario.id;
    const tipoPerf = req.usuario.tipo_perfil;
    const { plantel_id, categoria_id, liga_id } = req.body;

    // Verificar que sea nutricionista o admin
    if (tipoPerf !== 'nutricionista' && tipoPerf !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para cargar archivos Excel' });
    }

    // Verificar que se hayan seleccionado plantel, categoría y liga
    if (!plantel_id) {
      return res.status(400).json({ error: 'Debe seleccionar un plantel antes de cargar el archivo' });
    }

    if (!categoria_id) {
      return res.status(400).json({ error: 'Debe seleccionar una categoría antes de cargar el archivo' });
    }

    if (!liga_id) {
      return res.status(400).json({ error: 'Debe seleccionar una liga antes de cargar el archivo' });
    }

    // Verificar que el plantel existe y está activo
    const plantelResult = await pool.query(
      `SELECT p.id, p.nombre, p.division
       FROM t_planteles p
       WHERE p.id = $1 AND p.activo = true`,
      [plantel_id]
    );

    if (plantelResult.rows.length === 0) {
      return res.status(400).json({ error: 'El plantel seleccionado no existe o está inactivo' });
    }

    // Verificar que la categoría existe y está activa
    const categoriaResult = await pool.query(
      `SELECT c.id, c.nombre
       FROM t_categorias c
       WHERE c.id = $1 AND c.activo = true`,
      [categoria_id]
    );

    if (categoriaResult.rows.length === 0) {
      return res.status(400).json({ error: 'La categoría seleccionada no existe o está inactiva' });
    }

    // Verificar que la liga existe, está activa y pertenece a la categoría
    const ligaResult = await pool.query(
      `SELECT l.id, l.nombre
       FROM t_ligas l
       WHERE l.id = $1 AND l.categoria_id = $2 AND l.activo = true`,
      [liga_id, categoria_id]
    );

    if (ligaResult.rows.length === 0) {
      return res.status(400).json({ error: 'La liga seleccionada no existe, está inactiva o no pertenece a la categoría' });
    }

    const plantelId = plantelResult.rows[0].id;
    const plantelNombre = plantelResult.rows[0].nombre;
    const categoriaId = categoriaResult.rows[0].id;
    const categoriaNombre = categoriaResult.rows[0].nombre;
    const ligaId = ligaResult.rows[0].id;
    const ligaNombre = ligaResult.rows[0].nombre;

    // 1. Generar hash del archivo ANTES de procesar (para detectar duplicados rápidamente)
    const fileHash = generateFileHash(req.file.buffer);

    // 2. Verificar si el archivo ya existe por hash (validación rápida ANTES de parsear)
    const existingFileResult = await pool.query(
      'SELECT eu.id, eu.nombre_archivo, sm.fecha_sesion, p.nombre as plantel, c.nombre as categoria, l.nombre as liga FROM t_excel_uploads eu INNER JOIN t_sesion_mediciones sm ON eu.sesion_id = sm.id INNER JOIN t_planteles p ON sm.plantel_id = p.id INNER JOIN t_categorias c ON sm.categoria_id = c.id INNER JOIN t_ligas l ON sm.liga_id = l.id WHERE eu.hash_archivo = $1',
      [fileHash]
    );

    if (existingFileResult.rows.length > 0) {
      const existing = existingFileResult.rows[0];
      return res.status(409).json({
        error: 'Este archivo ya ha sido cargado anteriormente',
        duplicado: true,
        detalles: {
          archivo: existing.nombre_archivo,
          fecha_sesion: existing.fecha_sesion,
          plantel: existing.plantel,
          categoria: existing.categoria,
          liga: existing.liga
        }
      });
    }

    // 3. Parsear el archivo Excel (solo si NO es duplicado)
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempPath = path.join(tempDir, req.file.originalname);
    fs.writeFileSync(tempPath, req.file.buffer);

    const parsedData = parseExcelFile(tempPath);

    // Limpiar archivo temporal
    fs.unlinkSync(tempPath);

    // Validar estructura del Excel
    validateExcelStructure(parsedData);

    const { fecha_sesion, measurements, cantidad_registros } = parsedData;

    // 3. Crear sesión de mediciones
    // Primero, obtener el máximo ID actual para evitar conflictos de secuencia
    const maxIdResult = await pool.query(
      'SELECT COALESCE(MAX(id), 0) as max_id FROM t_sesion_mediciones'
    );
    const nextSessionId = maxIdResult.rows[0].max_id + 1;

    const sessionResult = await pool.query(
      `INSERT INTO t_sesion_mediciones
       (id, plantel_id, categoria_id, liga_id, fecha_sesion, nutricionista_id, archivo_hash, cantidad_registros)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [nextSessionId, plantelId, categoriaId, ligaId, fecha_sesion, usuarioId, fileHash, cantidad_registros]
    );

    const sesionId = sessionResult.rows[0].id;

    // 4. Insertar mediciones, evitando duplicados
    let registrosInsertados = 0;
    let registrosDuplicados = 0;

    for (const measurement of measurements) {
      // Buscar o crear paciente en t_pacientes
      let pacienteResult = await pool.query(
        `SELECT id FROM t_pacientes WHERE nombre ILIKE $1`,
        [measurement.nombre_paciente]
      );

      let pacienteId;
      if (pacienteResult.rows.length === 0) {
        // Crear nuevo paciente
        const createPacienteResult = await pool.query(
          `INSERT INTO t_pacientes (nombre, activo, fecha_registro)
           VALUES ($1, true, NOW())
           RETURNING id`,
          [measurement.nombre_paciente]
        );
        pacienteId = createPacienteResult.rows[0].id;
      } else {
        pacienteId = pacienteResult.rows[0].id;
      }

      // Verificar si ya existe un registro para este paciente con esta fecha_medicion
      // Búsqueda GLOBAL (sin restricción de sesión) usando nombre de paciente + fecha_medicion
      const duplicateCheck = await pool.query(
        `SELECT id FROM t_informe_antropometrico ia
         WHERE ia.paciente_id = $1
         AND (ia.fecha_medicion::date = $2::date OR ($2 IS NULL AND ia.fecha_medicion IS NULL))`,
        [pacienteId, measurement.fecha_medicion]
      );

      if (duplicateCheck.rows.length > 0) {
        registrosDuplicados++;
        continue;
      }

      // Insertar la medición con paciente_id
      await pool.query(
        `INSERT INTO t_informe_antropometrico
         (paciente_id, nutricionista_id, sesion_id,
          peso, talla, talla_sentado,
          diametro_biacromial, diametro_torax, diametro_antpost_torax,
          diametro_biiliocristal, diametro_bitrocanterea, diametro_humero, diametro_femur,
          perimetro_brazo_relajado, perimetro_brazo_flexionado, perimetro_muslo_anterior, perimetro_pantorrilla,
          pliegue_triceps, pliegue_subescapular, pliegue_supraespinal, pliegue_abdominal,
          pliegue_muslo_anterior, pliegue_pantorrilla_medial,
          masa_adiposa_superior, masa_adiposa_media, masa_adiposa_inferior,
          imo, imc, icc, ica,
          suma_6_pliegues, suma_8_pliegues,
          fecha_medicion, fecha_registro)
         VALUES ($1, $2, $3,
          $4, $5, $6,
          $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23,
          $24, $25, $26,
          $27, $28, $29, $30,
          $31, $32,
          $33, CURRENT_TIMESTAMP)`,
        [
          pacienteId,
          usuarioId,
          sesionId,
          measurement.peso,
          measurement.talla,
          measurement.talla_sentado,
          measurement.diametro_biacromial,
          measurement.diametro_torax,
          measurement.diametro_antpost_torax,
          measurement.diametro_biiliocristal,
          measurement.diametro_bitrocanterea,
          measurement.diametro_humero,
          measurement.diametro_femur,
          measurement.perimetro_brazo_relajado,
          measurement.perimetro_brazo_flexionado,
          measurement.perimetro_muslo_anterior,
          measurement.perimetro_pantorrilla,
          measurement.pliegue_triceps,
          measurement.pliegue_subescapular,
          measurement.pliegue_supraespinal,
          measurement.pliegue_abdominal,
          measurement.pliegue_muslo_anterior,
          measurement.pliegue_pantorrilla_medial,
          measurement.masa_adiposa_superior,
          measurement.masa_adiposa_media,
          measurement.masa_adiposa_inferior,
          measurement.imo,
          measurement.imc,
          measurement.icc,
          measurement.ica,
          measurement.suma_6_pliegues,
          measurement.suma_8_pliegues,
          measurement.fecha_medicion,
        ]
      );

      registrosInsertados++;
    }

    // Actualizar cantidad de registros en la sesión
    await pool.query(
      'UPDATE t_sesion_mediciones SET cantidad_registros = $1 WHERE id = $2',
      [registrosInsertados, sesionId]
    );

    // Insertar registro en t_excel_uploads con el nombre del archivo
    await pool.query(
      `INSERT INTO t_excel_uploads (sesion_id, nutricionista_id, nombre_archivo, hash_archivo, cantidad_registros)
       VALUES ($1, $2, $3, $4, $5)`,
      [sesionId, usuarioId, req.file.originalname, fileHash, registrosInsertados]
    );

    res.status(201).json({
      success: true,
      message: 'Archivo cargado exitosamente',
      sesionId,
      plantel: plantelNombre,
      categoria: categoriaNombre,
      liga: ligaNombre,
      fecha_sesion,
      registrosInsertados,
      registrosDuplicados,
      cantidad_total: measurements.length,
    });
  } catch (error) {
    console.error('Error en uploadExcelFile:', error);

    if (error.message.includes('Error al procesar archivo Excel')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Error al procesar el archivo: ' + error.message });
  }
};

/**
 * Obtener historial de cargas de Excel
 */
export const getUploadHistory = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const tipoPerf = req.usuario.tipo_perfil;

    // Verificar que sea nutricionista o admin
    if (tipoPerf !== 'nutricionista' && tipoPerf !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para acceder a esta información' });
    }

    let query = `
      SELECT
        sm.id,
        sm.fecha_carga as fecha_carga_excel,
        sm.cantidad_registros,
        eu.nombre_archivo,
        p.nombre as plantel,
        u.nombre || ' ' || u.apellido as nutricionista_nombre
      FROM t_sesion_mediciones sm
      JOIN t_planteles p ON sm.plantel_id = p.id
      JOIN t_usuarios u ON sm.nutricionista_id = u.id
      LEFT JOIN t_excel_uploads eu ON sm.id = eu.sesion_id
    `;

    const params = [];

    // Si es nutricionista, solo ver sus propias cargas
    if (tipoPerf === 'nutricionista') {
      query += ' WHERE sm.nutricionista_id = $1';
      params.push(usuarioId);
    }

    query += ' ORDER BY sm.fecha_carga DESC LIMIT 50';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getUploadHistory:', error);
    res.status(500).json({ error: 'Error al obtener historial de cargas' });
  }
};

/**
 * Obtener detalles de una sesión de mediciones
 */
export const getSessionDetails = async (req, res) => {
  try {
    const { sesionId } = req.params;
    const usuarioId = req.usuario.id;
    const tipoPerf = req.usuario.tipo_perfil;

    // Obtener detalles de la sesión
    const sessionResult = await pool.query(
      `SELECT
        sm.id,
        sm.fecha_sesion,
        sm.fecha_carga,
        sm.cantidad_registros,
        p.nombre as plantel,
        u.nombre as nutricionista_nombre
      FROM t_sesion_mediciones sm
      JOIN t_planteles p ON sm.plantel_id = p.id
      JOIN t_usuarios u ON sm.nutricionista_id = u.id
      WHERE sm.id = $1`,
      [sesionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    const session = sessionResult.rows[0];

    // Verificar permisos
    if (tipoPerf === 'nutricionista' && session.nutricionista_id !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta sesión' });
    }

    // Obtener mediciones de la sesión
    const measurementsResult = await pool.query(
      `SELECT
        ia.id,
        p.nombre as nombre_paciente,
        ia.peso,
        ia.talla,
        ia.imc,
        ia.suma_6_pliegues,
        ia.suma_8_pliegues,
        ia.fecha_registro
      FROM t_informe_antropometrico ia
      JOIN t_pacientes p ON ia.paciente_id = p.id
      WHERE ia.sesion_id = $1
      ORDER BY p.nombre`,
      [sesionId]
    );

    res.json({
      session,
      measurements: measurementsResult.rows,
    });
  } catch (error) {
    console.error('Error en getSessionDetails:', error);
    res.status(500).json({ error: 'Error al obtener detalles de la sesión' });
  }
};
