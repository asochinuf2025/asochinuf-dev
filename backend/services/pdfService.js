import { createCanvas } from 'canvas';

// Variable para almacenar pdfjs-dist
let pdfjsLib = null;

// Función async para cargar pdfjs-dist cuando sea necesario
const cargarPdfjs = async () => {
  if (!pdfjsLib) {
    try {
      const mod = await import('pdfjs-dist/legacy/build/pdf.js');
      pdfjsLib = mod.default;
    } catch (e) {
      console.warn('No se pudo cargar pdfjs-dist:', e.message);
      return null;
    }
  }
  return pdfjsLib;
};

/**
 * Generar miniatura para documentos e imágenes
 * Para PDFs: extrae la primera página y la renderiza
 * Para imágenes: usa la imagen misma escalada como miniatura
 * Para otros archivos: crea una miniatura genérica con icono
 */
export const generarMiniatura = async (archivoBuffer, tipoArchivo, nombreArchivo) => {
  try {
    // Si es imagen, usar la imagen como miniatura (escalada)
    if (tipoArchivo?.includes('image')) {
      console.log('Thumbnail type: IMAGEN (returning original buffer)');
      return await generarMiniaturaImagen(archivoBuffer, tipoArchivo);
    }

    // Si es PDF, intentar extraer primera página
    if (tipoArchivo?.includes('pdf')) {
      console.log('Thumbnail type: PDF (extracting first page)');
      return await generarMiniaturaPDF(archivoBuffer, nombreArchivo);
    }

    // Para otros archivos, generar miniatura genérica
    console.log(`Thumbnail type: GENÉRICA para ${tipoArchivo}`);
    return generarMiniaturaPorTipo(archivoBuffer, tipoArchivo, nombreArchivo);
  } catch (error) {
    console.error('Error generando miniatura de documento:', error);
    // En caso de error, devolver una miniatura genérica
    console.log('Fallback: generando miniatura genérica por error');
    return generarMiniaturaPorTipo(archivoBuffer, tipoArchivo, nombreArchivo);
  }
};

/**
 * Generar miniatura para imágenes
 * Para imágenes, devolvemos la imagen original como miniatura
 * (el navegador la escalará al tamaño del card automáticamente)
 */
const generarMiniaturaImagen = async (archivoBuffer, tipoArchivo) => {
  try {
    // Simplemente devolver el buffer original
    // El navegador escalará la imagen al tamaño del card (aspect-video)
    // Esto es más eficiente que procesar la imagen en Node.js
    return archivoBuffer;
  } catch (error) {
    console.error('Error procesando miniatura de imagen:', error);
    // Si falla, devolver miniatura genérica
    return generarMiniaturaPorTipo(archivoBuffer, tipoArchivo, 'imagen.jpg');
  }
};

/**
 * Generar miniatura extrayendo la primera página del PDF
 * Maneja PDFs complejos con timeout y fallback
 */
const generarMiniaturaPDF = async (archivoBuffer, nombreArchivo) => {
  let intentoSimple = false;

  try {
    console.log(`Intentando extraer página de PDF: ${nombreArchivo}, tamaño: ${archivoBuffer.length} bytes`);
    const pdfjs = await cargarPdfjs();

    if (!pdfjs) {
      console.log('pdfjs-dist no disponible, usando miniatura genérica');
      return generarMiniaturaPorTipo(archivoBuffer, 'application/pdf', nombreArchivo);
    }

    // Convertir Buffer a Uint8Array para pdfjs-dist
    const uint8Array = new Uint8Array(archivoBuffer);
    console.log(`Cargando documento PDF...`);

    // Intentar carga con rendering de imágenes deshabilitado para PDFs complejos
    const pdf = await pdfjs.getDocument({
      data: uint8Array,
      disableAutoFetch: true
    }).promise;
    console.log(`PDF cargado, número de páginas: ${pdf.numPages}`);

    const page = await pdf.getPage(1);
    console.log(`Primera página obtenida`);

    // Para PDFs complejos, usar escala más pequeña (menos demanda de memoria)
    const scale = archivoBuffer.length > 500000 ? 0.8 : 1.5;
    console.log(`Escala de renderizado: ${scale} (tamaño archivo: ${archivoBuffer.length} bytes)`);

    // Calcular dimensiones manteniendo aspecto 3/4
    const viewport = page.getViewport({ scale });
    console.log(`Viewport: ${viewport.width}x${viewport.height}`);

    // Limitar tamaño máximo de canvas para evitar problemas de memoria
    const maxCanvasWidth = 800;
    const maxCanvasHeight = 1200;

    let finalWidth = Math.round(viewport.width);
    let finalHeight = Math.round(viewport.height);
    let finalScale = scale;

    if (viewport.width > maxCanvasWidth || viewport.height > maxCanvasHeight) {
      const scaleX = maxCanvasWidth / viewport.width;
      const scaleY = maxCanvasHeight / viewport.height;
      finalScale = Math.min(scaleX, scaleY, scale);
      const finalViewport = page.getViewport({ scale: finalScale });
      finalWidth = Math.round(finalViewport.width);
      finalHeight = Math.round(finalViewport.height);
      console.log(`Canvas ajustado: ${finalWidth}x${finalHeight} (escala reducida a ${finalScale})`);
    }

    const canvas = createCanvas(finalWidth, finalHeight);
    const context = canvas.getContext('2d');

    // Llenar fondo blanco para mejor compatibilidad
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, finalWidth, finalHeight);

    console.log(`Iniciando renderizado del PDF con canvas ${finalWidth}x${finalHeight}...`);
    intentoSimple = true;

    // Renderizar con timeout de 15 segundos
    const renderPromise = page.render({
      canvasContext: context,
      viewport: page.getViewport({ scale: finalScale })
    }).promise;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Render timeout - PDF demasiado complejo')), 15000)
    );

    await Promise.race([renderPromise, timeoutPromise]);

    const buffer = canvas.toBuffer('image/png');
    console.log(`Miniatura PDF generada exitosamente: ${buffer.length} bytes`);
    return buffer;
  } catch (error) {
    console.error('Error al renderizar PDF para miniatura:', error.message);

    // Detectar si es error de imagen o timeout
    if (intentoSimple && (error.message.includes('Image') || error.message.includes('Canvas'))) {
      console.warn(`PDF contiene imágenes o contenido que Node.js canvas no puede procesar (${error.message})`);
      console.log('Este es un PDF con contenido visual complejo - se usará miniatura genérica');
    }

    console.error('Stack:', error.stack);
    // Si falla, devolver miniatura genérica
    console.log('Usando miniatura genérica para PDF');
    return generarMiniaturaPorTipo(archivoBuffer, 'application/pdf', nombreArchivo);
  }
};

/**
 * Generar miniatura genérica con icono según tipo de archivo
 */
const generarMiniaturaPorTipo = (archivoBuffer, tipoArchivo, nombreArchivo) => {
  try {
    console.log(`Generando miniatura genérica: archivo=${nombreArchivo}, tipo=${tipoArchivo}, buffer=${archivoBuffer?.length || 0} bytes`);

    // Usar dimensiones más pequeñas y simples para mayor compatibilidad
    const width = 300;
    const height = 400;

    console.log(`Canvas: ${width}x${height}`);
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Determinar colores según tipo de archivo
    let colorPrimario = '#8c5cff';
    let colorSecundario = '#6a3adb';
    let icono = '📄';
    let tipo = 'ARCHIVO';

    if (tipoArchivo?.includes('pdf')) {
      colorPrimario = '#dc2626';
      colorSecundario = '#991b1b';
      icono = '📕';
      tipo = 'PDF';
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

    // Fondo degradado
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colorPrimario);
    gradient.addColorStop(1, colorSecundario);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    // Patrón de líneas sutiles
    context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    context.lineWidth = 1;
    for (let i = 0; i < height; i += 20) {
      context.beginPath();
      context.moveTo(0, i);
      context.lineTo(width, i);
      context.stroke();
    }

    // Bordo blanco/claro
    context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    context.lineWidth = 2;
    context.strokeRect(10, 10, width - 20, height - 20);

    // Icono grande
    context.font = 'bold 90px Arial';
    context.textAlign = 'center';
    context.fillText(icono, width / 2, height / 3);

    // Tipo de archivo
    context.fillStyle = '#ffffff';
    context.font = 'bold 32px Arial';
    context.fillText(tipo, width / 2, height / 2 + 15);

    // Nombre del archivo (truncado)
    context.font = '24px Arial';
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    const nombreLimpio = nombreArchivo
      .replace(/\.[^/.]+$/, '') // Quitar extensión
      .substring(0, 25);
    const palabras = nombreLimpio.split(/[\s\-_]/);
    let texto = '';
    for (let palabra of palabras) {
      if ((texto + palabra).length > 20) break;
      texto += (texto ? ' ' : '') + palabra;
    }

    // Dividir en dos líneas si es muy largo
    if (texto.length > 15) {
      const mitad = Math.ceil(texto.length / 2);
      let pos = mitad;
      while (pos > 0 && texto[pos] !== ' ') pos--;
      const linea1 = texto.substring(0, pos);
      const linea2 = texto.substring(pos + 1);
      context.fillText(linea1, width / 2, height - 60);
      if (linea2) context.fillText(linea2, width / 2, height - 30);
    } else {
      context.fillText(texto, width / 2, height - 50);
    }

    // Tamaño del archivo (abajo)
    const tamaño = archivoBuffer.length;
    let tamañoTexto = '';
    if (tamaño > 1024 * 1024) {
      tamañoTexto = (tamaño / (1024 * 1024)).toFixed(1) + ' MB';
    } else if (tamaño > 1024) {
      tamañoTexto = (tamaño / 1024).toFixed(1) + ' KB';
    } else {
      tamañoTexto = tamaño + ' B';
    }

    context.font = '16px Arial';
    context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    context.fillText(tamañoTexto, width / 2, height - 8);

    const buffer = canvas.toBuffer('image/png');
    console.log(`Miniatura genérica generada correctamente: ${buffer?.length || 0} bytes`);

    // Validar que el buffer sea válido (un PNG debe tener al menos 67 bytes)
    if (!buffer || buffer.length < 67) {
      console.warn(`Buffer inválido o muy pequeño: ${buffer?.length || 0} bytes. Usando fallback.`);
      // Si el buffer es inválido, crear uno pequeño como fallback
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
