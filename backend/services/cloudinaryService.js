import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Subir imagen a Cloudinary
 * @param {string} imagenBase64 - Imagen en base64
 * @param {string} carpeta - Carpeta en Cloudinary (ej: 'asochinuf/perfiles' o 'asochinuf/cursos')
 * @param {string} nombrePublico - Nombre público para la imagen
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const subirImagenCloudinary = async (imagenBase64, carpeta, nombrePublico) => {
  try {
    if (!imagenBase64.includes('base64,')) {
      throw new Error('Imagen debe estar en formato base64 Data URL');
    }

    const resultado = await cloudinary.uploader.upload(imagenBase64, {
      folder: carpeta,
      public_id: nombrePublico,
      overwrite: true, // Sobrescribir si ya existe
      resource_type: 'auto',
      transformation: [
        {
          quality: 'auto:good', // Optimizar calidad automáticamente
          format: 'auto', // Formato automático según navegador
        },
      ],
    });

    return {
      url: resultado.secure_url,
      publicId: resultado.public_id,
      urlOriginal: resultado.url,
    };
  } catch (error) {
    console.error('Error subiendo a Cloudinary:', error);
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
};

/**
 * Eliminar imagen de Cloudinary
 * @param {string} publicId - ID público de la imagen
 * @returns {Promise<{resultado: string}>}
 */
export const eliminarImagenCloudinary = async (publicId) => {
  try {
    const resultado = await cloudinary.uploader.destroy(publicId);
    return {
      resultado: resultado.result === 'ok' ? 'Imagen eliminada' : 'Error al eliminar',
    };
  } catch (error) {
    console.error('Error eliminando de Cloudinary:', error);
    throw new Error(`Error al eliminar imagen: ${error.message}`);
  }
};

/**
 * Obtener URL de Cloudinary con transformaciones
 * @param {string} publicId - ID público de la imagen
 * @param {object} transformaciones - Objeto con transformaciones (ancho, alto, etc)
 * @returns {string} URL transformada
 */
export const obtenerURLTransformada = (publicId, transformaciones = {}) => {
  const {
    ancho = 400,
    alto = 400,
    crop = 'fill', // fill, crop, scale, fit, thumb
  } = transformaciones;

  return cloudinary.url(publicId, {
    width: ancho,
    height: alto,
    crop: crop,
    quality: 'auto',
    format: 'auto',
  });
};

export default {
  subirImagenCloudinary,
  eliminarImagenCloudinary,
  obtenerURLTransformada,
};
