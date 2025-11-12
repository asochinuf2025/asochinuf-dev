import * as pdfjsLib from 'pdfjs-dist';
import { createCanvas } from 'canvas';

// Configurar worker para pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Generar miniatura (thumbnail) de la primera página de un PDF
 * @param {Buffer} pdfBuffer - Buffer con contenido del PDF
 * @param {number} width - Ancho de la miniatura (default: 150px)
 * @param {number} height - Alto de la miniatura (default: 200px)
 * @returns {Promise<Buffer>} Buffer PNG de la miniatura
 */
export const generarMiniaturasPDF = async (pdfBuffer, width = 150, height = 200) => {
  try {
    // Cargar documento PDF
    const pdf = await pdfjsLib.getDocument({
      data: pdfBuffer,
      isEvalSupported: false
    }).promise;

    // Obtener primera página
    const page = await pdf.getPage(1);

    // Calcular escala para que quepa en las dimensiones especificadas
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(width / viewport.width, height / viewport.height);
    const scaledViewport = page.getViewport({ scale });

    // Crear canvas
    const canvas = createCanvas(scaledViewport.width, scaledViewport.height);
    const context = canvas.getContext('2d');

    // Renderizar página en canvas
    await page.render({
      canvasContext: context,
      viewport: scaledViewport
    }).promise;

    // Convertir canvas a PNG buffer
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error generando miniatura de PDF:', error);
    // Si hay error, retornar null para que se maneje sin miniatura
    return null;
  }
};

/**
 * Generar miniatura genérica para documentos no-PDF
 * Retorna una imagen PNG simple con el icono y nombre del archivo
 */
export const generarMiniaturasDocumento = async (tipoArchivo, nombreArchivo) => {
  try {
    const width = 150;
    const height = 200;

    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Fondo degradado
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#8c5cff');
    gradient.addColorStop(1, '#6a3adb');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    // Bordo blanco
    context.strokeStyle = '#ffffff';
    context.lineWidth = 2;
    context.strokeRect(5, 5, width - 10, height - 10);

    // Icono (símbolos simples)
    context.fillStyle = '#ffffff';
    context.font = 'bold 40px Arial';
    context.textAlign = 'center';

    // Determinar icono basado en tipo
    let icon = '📄';
    if (tipoArchivo?.includes('word')) icon = '📝';
    if (tipoArchivo?.includes('text')) icon = '📋';

    context.fillText(icon, width / 2, height / 2 - 20);

    // Nombre del archivo
    context.font = 'bold 12px Arial';
    context.fillStyle = '#ffffff';
    const nombreCorto = nombreArchivo.substring(0, 20);
    context.fillText(nombreCorto, width / 2, height / 2 + 40);

    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error generando miniatura de documento:', error);
    return null;
  }
};

/**
 * Generar miniatura según el tipo de archivo
 */
export const generarMiniatura = async (pdfBuffer, tipoArchivo, nombreArchivo) => {
  // Si es PDF, intentar generar miniatura de la primera página
  if (tipoArchivo?.includes('pdf')) {
    return await generarMiniaturasPDF(pdfBuffer);
  }

  // Para otros tipos, generar miniatura genérica
  return await generarMiniaturasDocumento(tipoArchivo, nombreArchivo);
};
