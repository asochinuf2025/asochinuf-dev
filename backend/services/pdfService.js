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
      return await generarMiniaturaImagen(archivoBuffer, tipoArchivo);
    }

    // Si es PDF, intentar extraer primera página
    if (tipoArchivo?.includes('pdf')) {
      return await generarMiniaturaPDF(archivoBuffer, nombreArchivo);
    }

    // Para otros archivos, generar miniatura genérica
    return generarMiniaturaPorTipo(archivoBuffer, tipoArchivo, nombreArchivo);
  } catch (error) {
    console.error('Error generando miniatura de documento:', error);
    // En caso de error, devolver una miniatura genérica
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
 */
const generarMiniaturaPDF = async (archivoBuffer, nombreArchivo) => {
  try {
    const pdfjs = await cargarPdfjs();

    if (!pdfjs) {
      console.log('pdfjs-dist no disponible, usando miniatura genérica');
      return generarMiniaturaPorTipo(archivoBuffer, 'application/pdf', nombreArchivo);
    }

    // Convertir Buffer a Uint8Array para pdfjs-dist
    const uint8Array = new Uint8Array(archivoBuffer);
    const pdf = await pdfjs.getDocument({ data: uint8Array }).promise;
    const page = await pdf.getPage(1);

    // Calcular dimensiones manteniendo aspecto 3/4
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error al renderizar PDF para miniatura:', error.message);
    // Si falla, devolver miniatura genérica
    return generarMiniaturaPorTipo(archivoBuffer, 'application/pdf', nombreArchivo);
  }
};

/**
 * Generar miniatura genérica con icono según tipo de archivo
 */
const generarMiniaturaPorTipo = (archivoBuffer, tipoArchivo, nombreArchivo) => {
  try {
    const width = 400;
    const height = 500;

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
    context.font = 'bold 120px Arial';
    context.textAlign = 'center';
    context.fillText(icono, width / 2, height / 3);

    // Tipo de archivo
    context.fillStyle = '#ffffff';
    context.font = 'bold 40px Arial';
    context.fillText(tipo, width / 2, height / 2 + 20);

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
      context.fillText(linea1, width / 2, height - 80);
      if (linea2) context.fillText(linea2, width / 2, height - 40);
    } else {
      context.fillText(texto, width / 2, height - 60);
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

    context.font = '20px Arial';
    context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    context.fillText(tamañoTexto, width / 2, height - 10);

    const buffer = canvas.toBuffer('image/png');
    return buffer || Buffer.alloc(0);
  } catch (error) {
    console.error('Error generando miniatura genérica:', error);
    // Crear una miniatura vacía pero válida como fallback
    try {
      const canvas = createCanvas(200, 250);
      const context = canvas.getContext('2d');
      context.fillStyle = '#8c5cff';
      context.fillRect(0, 0, 200, 250);
      return canvas.toBuffer('image/png');
    } catch (e) {
      // Si todo falla, retornar un buffer mínimo válido
      return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    }
  }
};
