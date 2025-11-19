/**
 * Convierte URLs comunes de video a URLs embebibles
 * @param {string} url - URL del video
 * @returns {string} URL embebible
 */
export const convertirAEmbedUrl = (url) => {
  if (!url) return '';

  // YouTube - convertir múltiples formatos
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId;

    if (url.includes('youtube.com/watch')) {
      // https://www.youtube.com/watch?v=VIDEO_ID
      videoId = new URL(url).searchParams.get('v');
    } else if (url.includes('youtu.be')) {
      // https://youtu.be/VIDEO_ID
      videoId = url.split('/').pop().split('?')[0];
    } else if (url.includes('youtube.com/embed')) {
      // Ya es URL de embed
      return url;
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1`;
    }
  }

  // Vimeo - convertir múltiples formatos
  if (url.includes('vimeo.com')) {
    let videoId;

    if (url.includes('/embed/')) {
      // Ya es URL de embed
      return url;
    }

    // https://vimeo.com/VIDEO_ID
    videoId = url.split('/').pop().split('?')[0];

    if (videoId && !isNaN(videoId)) {
      return `https://player.vimeo.com/video/${videoId}`;
    }
  }

  // Google Drive - convertir a vista previa
  if (url.includes('drive.google.com')) {
    if (url.includes('/preview')) {
      return url;
    }

    // Extraer file ID
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
  }

  // Si es URL directa a video (mp4, webm, etc.), retornarla como es
  if (url.match(/\.(mp4|webm|ogg|mov)$/i)) {
    return url;
  }

  // Si ya parece ser una URL de embed, retornarla como es
  if (url.includes('embed') || url.includes('preview')) {
    return url;
  }

  // Retornar URL original si no se puede convertir
  return url;
};

/**
 * Detecta el tipo de contenido basado en la URL
 * @param {string} url - URL del contenido
 * @returns {string} 'video' | 'pdf' | 'other'
 */
export const detectarTipoContenido = (url) => {
  if (!url) return 'other';

  if (url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo') || url.match(/\.(mp4|webm|ogg|mov)$/i)) {
    return 'video';
  }

  if (url.includes('drive.google.com') && url.includes('preview')) {
    return 'pdf';
  }

  if (url.match(/\.(pdf)$/i)) {
    return 'pdf';
  }

  return 'other';
};
