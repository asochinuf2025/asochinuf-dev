/**
 * Utility para optimizar imágenes de Cloudinary
 * Reduce el tamaño y mejora la velocidad de carga
 */

export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url) return url;

  // Si no es una URL HTTP, retornarla como está
  if (!url.startsWith('http')) {
    return url;
  }

  // Si no es de Cloudinary, retornar como está
  if (!url.includes('cloudinary')) {
    return url;
  }

  // Parámetros de optimización
  const {
    width = 600,
    quality = 80,
    format = 'auto',
    crop = false
  } = options;

  // Construir los parámetros de transformación
  let transformation = `c_auto,f_${format},q_${quality},w_${width}`;

  if (crop) {
    transformation = `c_fill,${transformation}`;
  }

  try {
    // Dividir la URL por 'upload' e insertar los parámetros
    const parts = url.split('upload');
    if (parts.length === 2) {
      return `${parts[0]}upload/${transformation}${parts[1]}`;
    }
  } catch (error) {
    console.error('Error optimizing Cloudinary URL:', error);
  }

  return url;
};

/**
 * Hook para cargar imagen de manera optimizada
 * Útil cuando necesitas diferentes tamaños según el dispositivo
 */
export const getResponsiveCloudinaryUrl = (url, screenWidth = 'desktop') => {
  const widths = {
    mobile: 400,
    tablet: 600,
    desktop: 800
  };

  return optimizeCloudinaryUrl(url, {
    width: widths[screenWidth] || widths.desktop,
    quality: 80,
    format: 'auto'
  });
};
