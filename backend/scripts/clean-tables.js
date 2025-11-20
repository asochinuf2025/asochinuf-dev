import pool from '../config/database.js';

const cleanTables = async () => {
  try {
    console.log('Limpiando datos de las tablas...');

    // Limpiar en orden correcto (respetando foreign keys)
    // Primero t_informe_antropometrico (depende de t_sesion_mediciones y t_pacientes)
    console.log('Eliminando datos de t_informe_antropometrico...');
    await pool.query('DELETE FROM t_informe_antropometrico');

    // Luego t_sesion_mediciones (depende de planteles y categorias)
    console.log('Eliminando datos de t_sesion_mediciones...');
    await pool.query('DELETE FROM t_sesion_mediciones');

    // Finalmente t_pacientes (puede tener datos huérfanos después de limpiar informe)
    console.log('Eliminando datos de t_pacientes...');
    await pool.query('DELETE FROM t_pacientes');

    console.log('✓ Tablas limpias exitosamente');
    console.log('Ahora puedes cargar nuevos datos');
    process.exit(0);
  } catch (error) {
    console.error('Error al limpiar tablas:', error.message);
    process.exit(1);
  }
};

cleanTables();
