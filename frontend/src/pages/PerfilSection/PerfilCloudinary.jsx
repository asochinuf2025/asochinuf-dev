import React, { useState, useContext } from 'react';
import { Camera, User } from 'lucide-react';
import { toast } from 'sonner';
import CloudinaryImageCrop from '../../components/CloudinaryImageCrop';
import { AuthContext } from '../../context/AuthContext';

/**
 * Componente para cambiar foto de perfil usando Cloudinary
 */
const PerfilCloudinary = ({ usuario, onFotoActualizada }) => {
  const [fotoPerfil, setFotoPerfil] = useState(usuario?.foto || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { token } = useContext(AuthContext);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se aceptan archivos de imagen');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    // Convertir a base64
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setIsModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadComplete = ({ url, publicId }) => {
    setFotoPerfil(url);
    setSelectedImage(null);

    // Llamar callback para actualizar datos en BD si es necesario
    if (onFotoActualizada) {
      onFotoActualizada({
        url,
        publicId,
      });
    }

    toast.success('Foto de perfil actualizada');
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {fotoPerfil ? (
            <img
              src={fotoPerfil}
              alt="Foto de perfil"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <User size={64} className="text-gray-600 dark:text-gray-400" />
            </div>
          )}

          {/* Botón de cambiar foto */}
          <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 p-2 rounded-full cursor-pointer shadow-lg transition">
            <Camera size={20} className="text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isModalOpen}
            />
          </label>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold">{usuario?.nombre} {usuario?.apellido}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {usuario?.email}
          </p>
        </div>
      </div>

      {/* Modal de crop */}
      <CloudinaryImageCrop
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedImage(null);
        }}
        imageSrc={selectedImage}
        onUploadComplete={handleUploadComplete}
        tipo="perfil"
        token={token}
      />

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 <strong>Tip:</strong> Haz clic en la cámara para cambiar tu foto de perfil.
          Podrás recortar y ajustar la imagen antes de guardarla.
        </p>
      </div>
    </div>
  );
};

export default PerfilCloudinary;
