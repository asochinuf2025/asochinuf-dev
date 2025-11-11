import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCw, Upload, Loader } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * Componente para crop de imágenes y subida a Cloudinary
 * Uso:
 * - Perfil: <CloudinaryImageCrop tipo="perfil" onUploadComplete={callback} />
 * - Curso: <CloudinaryImageCrop tipo="curso" cursoId={123} onUploadComplete={callback} />
 */
const CloudinaryImageCrop = ({
  isOpen,
  onClose,
  imageSrc,
  onUploadComplete,
  isDarkMode,
  tipo = 'perfil', // 'perfil' o 'curso'
  cursoId = null, // requerido si tipo='curso'
  token
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Convertir imagen cropeada a base64 para enviar a Cloudinary
  const getCroppedImg = useCallback(async (imageSrc, pixelCrop, rotation) => {
    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        const ctx = canvas.getContext('2d');

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        ctx.drawImage(
          image,
          pixelCrop.x * scaleX,
          pixelCrop.y * scaleY,
          pixelCrop.width * scaleX,
          pixelCrop.height * scaleY,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
    });
  }, []);

  const handleSaveAndUpload = async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsUploading(true);
      toast.loading('Procesando imagen...');

      // Obtener imagen cropeada
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);

      // Subir a Cloudinary via backend
      const endpoint = tipo === 'perfil'
        ? API_ENDPOINTS.CLOUDINARY.UPLOAD_PERFIL
        : API_ENDPOINTS.CLOUDINARY.UPLOAD_CURSO;

      const payload = {
        imagenBase64: croppedImage,
      };

      if (tipo === 'curso' && cursoId) {
        payload.cursoId = cursoId;
      }

      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.dismiss();
        toast.success(response.data.mensaje || 'Imagen subida exitosamente');

        // Pasar URL de Cloudinary al callback
        onUploadComplete({
          url: response.data.url,
          publicId: response.data.publicId,
        });

        onClose();
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error al subir imagen:', error);
      toast.error(error.response?.data?.error || 'Error al subir imagen');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative max-w-2xl w-full rounded-lg shadow-xl p-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {tipo === 'perfil' ? 'Recortar foto de perfil' : 'Recortar foto de curso'}
              </h2>
              <button
                onClick={onClose}
                disabled={isUploading}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cropper */}
            <div className="relative w-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden mb-4">
              <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: tipo === 'perfil' ? '100%' : '66.67%' // 1:1 para perfil, 3:2 para cursos
              }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={tipo === 'perfil' ? 1 : 1.5} // 1:1 para perfil, 3:2 para cursos
                  onCropChange={onCropChange}
                  onCropComplete={onCropCompleteCallback}
                  onZoomChange={onZoomChange}
                  onRotationChange={setRotation}
                  cropShape={tipo === 'perfil' ? 'round' : 'rect'} // Circular para perfil, rectangular para cursos
                  showGrid={true}
                  style={{
                    containerStyle: {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    },
                  }}
                />
              </div>
            </div>

            {/* Controles */}
            <div className="space-y-4 mb-6">
              {/* Zoom */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Zoom
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Rotar */}
              <button
                onClick={handleRotate}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50"
              >
                <RotateCw size={18} />
                Rotar 90°
              </button>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isUploading}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAndUpload}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg font-medium"
              >
                {isUploading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Guardar y Subir
                  </>
                )}
              </button>
            </div>

            {/* Info */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Arrastra, zoom y rota para ajustar tu imagen
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CloudinaryImageCrop;
