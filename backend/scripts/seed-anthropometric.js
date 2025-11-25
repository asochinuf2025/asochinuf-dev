import pool from '../config/database.js';

/**
 * Script para insertar datos de prueba en las tablas antropométricas
 */

const seedAnthropometricData = async () => {
  try {
    console.log('🌱 Iniciando carga de datos antropométricos de prueba...');

    // 1. Crear pacientes de prueba
    console.log('📍 Insertando pacientes de prueba...');
    const pacientesData = [
      { nombre: 'Juan', apellido: 'García', cedula: '12345678-1', fecha_nacimiento: '2000-05-15', posicion_juego: 'Portero' },
      { nombre: 'Carlos', apellido: 'López', cedula: '12345678-2', fecha_nacimiento: '2000-06-20', posicion_juego: 'Defensa' },
      { nombre: 'Miguel', apellido: 'Martínez', cedula: '12345678-3', fecha_nacimiento: '2001-07-10', posicion_juego: 'Centrocampista' },
      { nombre: 'Antonio', apellido: 'Rodríguez', cedula: '12345678-4', fecha_nacimiento: '2001-08-25', posicion_juego: 'Delantero' },
      { nombre: 'Luis', apellido: 'Fernández', cedula: '12345678-5', fecha_nacimiento: '2000-09-12', posicion_juego: 'Defensa' },
      { nombre: 'David', apellido: 'González', cedula: '12345678-6', fecha_nacimiento: '2000-10-30', posicion_juego: 'Centrocampista' },
      { nombre: 'Manuel', apellido: 'Sánchez', cedula: '12345678-7', fecha_nacimiento: '2001-11-15', posicion_juego: 'Delantero' },
      { nombre: 'José', apellido: 'Pérez', cedula: '12345678-8', fecha_nacimiento: '2000-12-05', posicion_juego: 'Portero' },
    ];

    const pacientesIds = [];
    for (const paciente of pacientesData) {
      const result = await pool.query(
        `INSERT INTO t_pacientes (nombre, apellido, cedula, fecha_nacimiento, posicion_juego)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (cedula) DO UPDATE SET
           nombre = $1,
           apellido = $2,
           posicion_juego = $5
         RETURNING id`,
        [paciente.nombre, paciente.apellido, paciente.cedula, paciente.fecha_nacimiento, paciente.posicion_juego]
      );
      pacientesIds.push(result.rows[0].id);
    }
    console.log(`✓ ${pacientesIds.length} pacientes insertados`);

    // 2. Obtener categorías
    console.log('📍 Obteniendo categorías...');
    const categoriasResult = await pool.query('SELECT id FROM t_categorias LIMIT 2');
    const categoriaId = categoriasResult.rows[0]?.id;
    if (!categoriaId) {
      throw new Error('No hay categorías en la base de datos');
    }
    console.log(`✓ Categoría ID: ${categoriaId}`);

    // 3. Obtener planteles, ligas y nutricionista
    console.log('📍 Obteniendo planteles, ligas y nutricionista...');
    const plantelesResult = await pool.query('SELECT id FROM t_planteles LIMIT 3');
    const plantelIds = plantelesResult.rows.map(r => r.id);
    if (plantelIds.length === 0) {
      throw new Error('No hay planteles en la base de datos');
    }

    const ligasResult = await pool.query('SELECT id FROM t_ligas LIMIT 1');
    const ligaId = ligasResult.rows[0]?.id;
    if (!ligaId) {
      throw new Error('No hay ligas en la base de datos');
    }

    // Obtener o crear usuario nutricionista
    let nutricionistaId = null;
    const nutricionistaResult = await pool.query(
      `SELECT id FROM t_usuarios WHERE tipo_perfil = 'nutricionista' LIMIT 1`
    );
    if (nutricionistaResult.rows.length > 0) {
      nutricionistaId = nutricionistaResult.rows[0].id;
    } else {
      // Crear un usuario nutricionista de prueba si no existe
      const newNutricionistaResult = await pool.query(
        `INSERT INTO t_usuarios (email, contraseña, tipo_perfil)
         VALUES ('nutricionista@test.com', 'test123', 'nutricionista')
         RETURNING id`
      );
      nutricionistaId = newNutricionistaResult.rows[0].id;
    }

    console.log(`✓ Planteles encontrados: ${plantelIds.length}`);
    console.log(`✓ Liga ID: ${ligaId}`);
    console.log(`✓ Nutricionista ID: ${nutricionistaId}`);

    // 4. Crear sesión de mediciones
    console.log('📍 Creando sesión de mediciones...');
    const sesionResult = await pool.query(
      `INSERT INTO t_sesion_mediciones (plantel_id, categoria_id, liga_id, fecha_sesion, nutricionista_id, archivo_hash, cantidad_registros)
       VALUES ($1, $2, $3, NOW()::DATE, $4, $5, 8)
       RETURNING id`,
      [plantelIds[0], categoriaId, ligaId, nutricionistaId, 'test_seed_' + Date.now()]
    );
    const sesionId = sesionResult.rows[0].id;
    console.log(`✓ Sesión creada con ID: ${sesionId}`);

    // 5. Insertar mediciones antropométricas
    console.log('📍 Insertando mediciones antropométricas...');
    const mediciones = [
      { paciente_id: pacientesIds[0], peso: 72, talla: 182, imc: 21.7, posicion: 'Portero', zona: 'Centro' },
      { paciente_id: pacientesIds[1], peso: 68, talla: 176, imc: 21.9, posicion: 'Defensa', zona: 'Centro' },
      { paciente_id: pacientesIds[2], peso: 70, talla: 180, imc: 21.6, posicion: 'Centrocampista', zona: 'Centro' },
      { paciente_id: pacientesIds[3], peso: 75, talla: 185, imc: 21.9, posicion: 'Delantero', zona: 'Centro' },
      { paciente_id: pacientesIds[4], peso: 69, talla: 178, imc: 21.8, posicion: 'Defensa', zona: 'Norte' },
      { paciente_id: pacientesIds[5], peso: 71, talla: 181, imc: 21.7, posicion: 'Centrocampista', zona: 'Sur' },
      { paciente_id: pacientesIds[6], peso: 73, talla: 183, imc: 21.8, posicion: 'Delantero', zona: 'Sur' },
      { paciente_id: pacientesIds[7], peso: 70, talla: 179, imc: 21.8, posicion: 'Portero', zona: 'Norte' },
    ];

    for (const med of mediciones) {
      await pool.query(
        `INSERT INTO t_informe_antropometrico
         (sesion_id, paciente_id, fecha_medicion, peso, talla, imc, nutricionista_id)
         VALUES ($1, $2, NOW()::DATE, $3, $4, $5, $6)`,
        [sesionId, med.paciente_id, med.peso, med.talla, med.imc, nutricionistaId]
      );
    }
    console.log(`✓ ${mediciones.length} mediciones insertadas`);

    console.log('✅ Carga de datos de prueba completada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cargar datos de prueba:', error.message);
    process.exit(1);
  }
};

seedAnthropometricData();
