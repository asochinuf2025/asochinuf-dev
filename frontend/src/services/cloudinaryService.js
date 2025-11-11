import { API_ENDPOINTS } from '../config/apiConfig';
import axios from 'axios';

/**
 * Servicio para subir archivos a Cloudinary a través del backend
 */

const uploadDocument = async (base64Data, fileName) => {
  try {
    // El backend maneja el upload a Cloudinary
    // Solo enviamos el base64 y el nombre del archivo
    const response = await axios.post(
      `${API_ENDPOINTS.BASE || ''}/api/cloudinary/upload-documento`,
      {
        imagen: base64Data,
        nombrePublico: fileName.replace(/\.[^/.]+$/, '') // Quitar extensión
      }
    );

    if (response.data.url) {
      return {
        url: response.data.url,
        publicId: response.data.publicId,
        urlOriginal: response.data.urlOriginal
      };
    }

    throw new Error('No se recibió URL del servidor');
  } catch (error) {
    console.error('Error subiendo documento:', error);
    throw new Error(error.response?.data?.error || error.message || 'Error al subir documento');
  }
};

export default {
  uploadDocument
};
