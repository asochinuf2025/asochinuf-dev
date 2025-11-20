import pool from '../config/database.js';

const cleanExcelTables = async () => {
  try {
    console.log('Limpiando tablas de Excel...');

    // Limpiar en orden correcto (respetando foreign keys)
    // Primero t_informe_antropometrico (depende de t_sesion_mediciones)
    try {
      console.log('Eliminando datos de t_informe_antropometrico...');
      await pool.query('DELETE FROM t_informe_antropometrico');
    } catch (err) {
      if (!err.message.includes('does not exist')) throw err;
    }

    // Luego t_sesion_mediciones
    try {
      console.log('Eliminando datos de t_sesion_mediciones...');
      await pool.query('DELETE FROM t_sesion_mediciones');
    } catch (err) {
      if (!err.message.includes('does not exist')) throw err;
    }

    // Finalmente t_excel_uploads
    try {
      console.log('Eliminando datos de t_excel_uploads...');
      await pool.query('DELETE FROM t_excel_uploads');
    } catch (err) {
      if (!err.message.includes('does not exist')) throw err;
      console.log('⚠️ Tabla t_excel_uploads no existe (OK)');
    }

    console.log('✓ Tablas limpias exitosamente');
    console.log('Ahora puedes cargar nuevamente el archivo Excel');
    process.exit(0);
  } catch (error) {
    console.error('Error al limpiar tablas:', error.message);
    process.exit(1);
  }
};

cleanExcelTables();
