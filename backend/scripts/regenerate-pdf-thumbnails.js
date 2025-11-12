import pool from '../config/database.js';
import { generarMiniatura } from '../services/pdfService.js';

/**
 * Script para regenerar miniaturas de PDFs
 * Extrae la primera página del PDF como miniatura
 */
async function regenerateThumbnails() {
  try {
    console.log('Buscando documentos PDF sin miniaturas o con miniaturas antiguas...');

    // Buscar documentos PDF
    const result = await pool.query(
      `SELECT id, archivo_contenido, archivo_nombre, archivo_tipo
       FROM t_documentos
       WHERE archivo_tipo LIKE '%pdf%'
       ORDER BY fecha_creacion DESC`
    );

    const documentosPDF = result.rows;
    console.log(`Encontrados ${documentosPDF.length} documentos PDF`);

    if (documentosPDF.length === 0) {
      console.log('No hay documentos PDF para regenerar.');
      return;
    }

    let actualizados = 0;
    let errores = 0;

    for (const doc of documentosPDF) {
      try {
        console.log(`\nProcesando: ${doc.archivo_nombre} (ID: ${doc.id})`);

        // Generar miniatura nueva desde el PDF
        const miniaturaNueva = await generarMiniatura(
          doc.archivo_contenido,
          doc.archivo_tipo,
          doc.archivo_nombre
        );

        if (miniaturaNueva) {
          // Actualizar en la BD
          await pool.query(
            `UPDATE t_documentos SET miniatura = $1 WHERE id = $2`,
            [miniaturaNueva, doc.id]
          );
          console.log(`✓ Miniatura regenerada exitosamente`);
          actualizados++;
        } else {
          console.log(`⚠ No se pudo generar miniatura (devolvió null)`);
          errores++;
        }
      } catch (error) {
        console.error(`✗ Error procesando ${doc.archivo_nombre}:`, error.message);
        errores++;
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Resumen:`);
    console.log(`- Total documentos: ${documentosPDF.length}`);
    console.log(`- Actualizados: ${actualizados}`);
    console.log(`- Errores: ${errores}`);
    console.log(`${'='.repeat(50)}`);

  } catch (error) {
    console.error('Error en el script:', error);
    process.exit(1);
  }
}

// Ejecutar
regenerateThumbnails().then(() => {
  console.log('\nScript completado.');
  process.exit(0);
});
