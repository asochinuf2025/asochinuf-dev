import { createCanvas } from 'canvas';

/**
 * Generar miniatura para documentos e imágenes
 * - Para PDFs: miniatura inteligente con metadatos
 * - Para imágenes: usa la imagen misma como miniatura
 * - Para otros archivos: miniatura genérica con icono
 */
export const generarMiniatura = async (archivoBuffer, tipoArchivo, nombreArchivo) => {
  try {
    // Si es imagen, usar la imagen como miniatura
    if (tipoArchivo?.includes('image')) {
      console.log('📷 Tipo: IMAGEN');
      return await generarMiniaturaImagen(archivoBuffer, tipoArchivo);
    }

    // Si es PDF, generar miniatura inteligente
    if (tipoArchivo?.includes('pdf')) {
      console.log('📄 Tipo: PDF');
      return generarMiniaturaPDF(archivoBuffer, nombreArchivo);
    }

    // Para otros archivos, generar miniatura genérica
    console.log(`📎 Tipo: GENÉRICA`);
    return generarMiniaturaPorTipo(archivoBuffer, tipoArchivo, nombreArchivo);
  } catch (error) {
    console.error('❌ Error generando miniatura:', error.message);
    // En caso de error, devolver una miniatura genérica
    console.log('⚠️ Fallback: miniatura genérica');
    return generarMiniaturaPorTipo(archivoBuffer, tipoArchivo, nombreArchivo);
  }
};

/**
 * Generar miniatura para imágenes
 */
const generarMiniaturaImagen = async (archivoBuffer, tipoArchivo) => {
  try {
    // Devolver la imagen original como miniatura
    return archivoBuffer;
  } catch (error) {
    console.error('Error procesando miniatura de imagen:', error);
    return generarMiniaturaPorTipo(archivoBuffer, tipoArchivo, 'imagen.jpg');
  }
};

/**
 * Generar miniatura para PDF
 * Miniatura inteligente sin dependencias externas
 */
const generarMiniaturaPDF = (archivoBuffer, nombreArchivo) => {
  console.log(`📄 PDF detectado: ${nombreArchivo}`);
  console.log(`📎 Generando miniatura inteligente...`);

  // Generar miniatura inteligente del PDF
  return generarMiniaturaPDFInteligente(archivoBuffer, nombreArchivo);
};

/**
 * Generar miniatura inteligente para PDF
 * Muestra: icono, nombre del archivo, tamaño
 */
const generarMiniaturaPDFInteligente = (archivoBuffer, nombreArchivo) => {
  try {
    const width = 320;
    const height = 420;

    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Colores para PDF
    const colorPrimario = '#dc2626';
    const colorSecundario = '#991b1b';

    // Fondo con degradado
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colorPrimario);
    gradient.addColorStop(1, colorSecundario);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    // Patrón sutil de líneas (simulando páginas de PDF)
    context.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    context.lineWidth = 1;
    for (let i = 0; i < height; i += 18) {
      context.beginPath();
      context.moveTo(20, i);
      context.lineTo(width - 20, i);
      context.stroke();
    }

    // Borde elegante
    context.shadowColor = 'rgba(0, 0, 0, 0.2)';
    context.shadowBlur = 10;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 2;
    context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    context.lineWidth = 2;
    context.strokeRect(12, 12, width - 24, height - 24);
    context.shadowColor = 'transparent';

    // Icono PDF grande
    context.font = 'bold 100px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';
    context.fillText('📕', width / 2, 80);

    // Etiqueta "PDF"
    context.font = 'bold 24px Arial';
    context.fillText('PDF', width / 2, 150);

    // Separador
    context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(40, 175);
    context.lineTo(width - 40, 175);
    context.stroke();

    // Nombre del archivo (truncado)
    const nombreLimpio = nombreArchivo.replace(/\.pdf$/i, '').substring(0, 30);
    let nombreMostrar = nombreLimpio;
    if (nombreLimpio.length > 25) {
      nombreMostrar = nombreLimpio.substring(0, 22) + '...';
    }
    context.font = '14px Arial';
    context.fillStyle = 'rgba(255, 255, 255, 0.95)';
    context.fillText(nombreMostrar, width / 2, 220);

    // Tamaño del archivo
    const tamaño = archivoBuffer.length;
    let tamañoTexto = '';
    if (tamaño > 1024 * 1024) {
      tamañoTexto = (tamaño / (1024 * 1024)).toFixed(1) + ' MB';
    } else if (tamaño > 1024) {
      tamañoTexto = (tamaño / 1024).toFixed(1) + ' KB';
    } else {
      tamañoTexto = tamaño + ' B';
    }
    context.font = '12px Arial';
    context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    context.fillText(tamañoTexto, width / 2, 245);

    // Indicador de disponibilidad
    context.font = '11px Arial';
    context.fillStyle = 'rgba(255, 255, 255, 0.6)';
    context.fillText('Click para ver documento', width / 2, 400);

    const buffer = canvas.toBuffer('image/png');
    console.log(`✅ Miniatura inteligente de PDF generada: ${buffer?.length || 0} bytes`);
    return buffer;
  } catch (error) {
    console.error('Error generando miniatura inteligente:', error);
    // Fallback final: miniatura genérica
    return generarMiniaturaPorTipo(archivoBuffer, 'application/pdf', nombreArchivo);
  }
};

/**
 * Generar miniatura genérica con icono según tipo de archivo
 */
export const generarMiniaturaPorTipo = (archivoBuffer, tipoArchivo, nombreArchivo) => {
  try {
    console.log(`📎 Generando miniatura genérica: ${nombreArchivo} (${tipoArchivo})`);

    // Usar dimensiones óptimas para miniaturas
    const width = 320;
    const height = 420;

    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Determinar colores según tipo de archivo
    let colorPrimario = '#8c5cff';
    let colorSecundario = '#6a3adb';
    let icono = '📄';
    let tipo = 'ARCHIVO';
    let bgPattern = null;

    if (tipoArchivo?.includes('pdf')) {
      colorPrimario = '#dc2626';
      colorSecundario = '#991b1b';
      icono = '📕';
      tipo = 'PDF';
      bgPattern = 'lines';
    } else if (tipoArchivo?.includes('word') || tipoArchivo?.includes('document')) {
      colorPrimario = '#2563eb';
      colorSecundario = '#1e40af';
      icono = '📘';
      tipo = 'WORD';
    } else if (tipoArchivo?.includes('text')) {
      colorPrimario = '#16a34a';
      colorSecundario = '#15803d';
      icono = '📗';
      tipo = 'TXT';
    } else if (tipoArchivo?.includes('sheet') || tipoArchivo?.includes('excel')) {
      colorPrimario = '#059669';
      colorSecundario = '#047857';
      icono = '📙';
      tipo = 'SHEET';
    } else if (tipoArchivo?.includes('image')) {
      colorPrimario = '#d946ef';
      colorSecundario = '#be185d';
      icono = '🖼️';
      tipo = 'IMAGEN';
    }

    // Fondo con degradado
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colorPrimario);
    gradient.addColorStop(1, colorSecundario);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    // Patrón sutil de fondo (para PDFs, líneas de texto)
    if (bgPattern === 'lines') {
      context.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      context.lineWidth = 1;
      for (let i = 0; i < height; i += 18) {
        context.beginPath();
        context.moveTo(20, i);
        context.lineTo(width - 20, i);
        context.stroke();
      }
    }

    // Sombra/borde elegante
    context.shadowColor = 'rgba(0, 0, 0, 0.2)';
    context.shadowBlur = 10;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 2;
    context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    context.lineWidth = 2;
    context.strokeRect(12, 12, width - 24, height - 24);
    context.shadowColor = 'transparent';

    // Icono grande
    context.font = 'bold 100px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(icono, width / 2, height / 3 - 10);

    // Tipo de archivo
    context.fillStyle = '#ffffff';
    context.font = 'bold 36px Arial';
    context.textBaseline = 'middle';
    context.fillText(tipo, width / 2, height / 2);

    // Separador visual
    context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(40, height / 2 + 30);
    context.lineTo(width - 40, height / 2 + 30);
    context.stroke();

    // Nombre del archivo (truncado de forma inteligente)
    context.font = '16px Arial';
    context.fillStyle = 'rgba(255, 255, 255, 0.95)';
    context.textAlign = 'center';
    const nombreLimpio = nombreArchivo
      .replace(/\.[^/.]+$/, '')
      .substring(0, 30);

    let nombreMostrar = nombreLimpio;
    if (nombreLimpio.length > 25) {
      nombreMostrar = nombreLimpio.substring(0, 22) + '...';
    }
    context.fillText(nombreMostrar, width / 2, height / 2 + 60);

    // Tamaño del archivo
    const tamaño = archivoBuffer.length;
    let tamañoTexto = '';
    if (tamaño > 1024 * 1024) {
      tamañoTexto = (tamaño / (1024 * 1024)).toFixed(1) + ' MB';
    } else if (tamaño > 1024) {
      tamañoTexto = (tamaño / 1024).toFixed(1) + ' KB';
    } else {
      tamañoTexto = tamaño + ' B';
    }

    context.font = '14px Arial';
    context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    context.fillText(tamañoTexto, width / 2, height - 20);

    const buffer = canvas.toBuffer('image/png');
    console.log(`Miniatura genérica generada correctamente: ${buffer?.length || 0} bytes`);

    // Validar que el buffer sea válido
    if (!buffer || buffer.length < 67) {
      console.warn(`Buffer inválido o muy pequeño: ${buffer?.length || 0} bytes. Usando fallback.`);
      try {
        const fallbackCanvas = createCanvas(200, 250);
        const fallbackContext = fallbackCanvas.getContext('2d');
        fallbackContext.fillStyle = '#8c5cff';
        fallbackContext.fillRect(0, 0, 200, 250);
        const fallbackBuffer = fallbackCanvas.toBuffer('image/png');
        console.log(`Fallback canvas generado: ${fallbackBuffer?.length || 0} bytes`);
        return fallbackBuffer;
      } catch (e) {
        console.error('Error creando fallback canvas:', e);
        return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      }
    }

    return buffer;
  } catch (error) {
    console.error('Error generando miniatura genérica:', error);
    // Crear una miniatura vacía pero válida como fallback
    try {
      console.log('Intentando crear miniatura fallback en canvas más pequeño');
      const canvas = createCanvas(200, 250);
      const context = canvas.getContext('2d');
      context.fillStyle = '#8c5cff';
      context.fillRect(0, 0, 200, 250);
      const buffer = canvas.toBuffer('image/png');
      console.log(`Miniatura fallback generada: ${buffer?.length || 0} bytes`);
      return buffer;
    } catch (e) {
      // Si todo falla, retornar un buffer mínimo válido
      console.log('Usando miniatura genérica mínima (1x1 PNG)');
      return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    }
  }
};
