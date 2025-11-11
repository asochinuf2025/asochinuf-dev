import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Camera, Save, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import CloudinaryImageCrop from '../../components/CloudinaryImageCrop';
import { API_ENDPOINTS } from '../../config/apiConfig';

const MiPerfil = () => {
  const { usuario, isDarkMode, actualizarUsuario } = useAuth();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const { token } = useAuth();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.CAMBIAR_CONTRASENA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('asochinuf_token')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Contraseña actualizada exitosamente');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsEditingPassword(false);
      } else {
        toast.error(data.error || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    // Leer imagen y abrir modal de recorte
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadComplete = ({ url, publicId }) => {
    console.log('✅ Imagen subida a Cloudinary:', url);
    setCloudinaryUrl(url);
    setIsCropModalOpen(false);
    setSelectedImage(null);
    toast.success('Foto de perfil actualizada exitosamente');

    // Actualizar el contexto con la nueva URL
    if (url) {
      actualizarUsuario({ foto: url });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          isDarkMode ? 'bg-[#1a1c22]' : 'bg-white'
        } rounded-xl p-6 border ${
          isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
        }`}
      >
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Mi Perfil
        </h1>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
          Administra tu información personal y configuración de cuenta
        </p>
      </motion.div>

      {/* Foto de Perfil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${
          isDarkMode ? 'bg-[#1a1c22]' : 'bg-white'
        } rounded-xl p-6 border ${
          isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
        }`}
      >
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Foto de Perfil
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Preview de la foto */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
              {cloudinaryUrl || usuario?.foto ? (
                <img
                  src={cloudinaryUrl || usuario?.foto}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                usuario?.nombre[0]
              )}
            </div>

            {/* Botón para cambiar foto */}
            <label
              htmlFor="foto-input"
              className="absolute bottom-0 right-0 w-10 h-10 bg-[#8c5cff] hover:bg-[#7a4de8] rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300 shadow-lg"
            >
              <Camera size={20} className="text-white" />
              <input
                id="foto-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {usuario?.nombre} {usuario?.apellido}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
              {usuario?.tipo_perfil}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
              Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-[#8c5cff]' : 'text-[#6a3dcf]'} mt-1`}>
              Recorta tu foto y cárgala en Cloudinary
            </p>
          </div>
        </div>
      </motion.div>

      {/* Información Personal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${
          isDarkMode ? 'bg-[#1a1c22]' : 'bg-white'
        } rounded-xl p-6 border ${
          isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
        }`}
      >
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Información Personal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2 mb-2`}>
              <User size={16} />
              Nombre
            </label>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-[#0f1117]' : 'bg-gray-100'}`}>
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{usuario?.nombre}</p>
            </div>
          </div>

          <div>
            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2 mb-2`}>
              <User size={16} />
              Apellido
            </label>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-[#0f1117]' : 'bg-gray-100'}`}>
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{usuario?.apellido}</p>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2 mb-2`}>
              <Mail size={16} />
              Correo Electrónico
            </label>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-[#0f1117]' : 'bg-gray-100'}`}>
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{usuario?.email}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cambiar Contraseña */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`${
          isDarkMode ? 'bg-[#1a1c22]' : 'bg-white'
        } rounded-xl p-6 border ${
          isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Seguridad
          </h2>
          {!isEditingPassword && (
            <button
              onClick={() => setIsEditingPassword(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white rounded-lg hover:shadow-lg hover:shadow-[#8c5cff]/25 transition-all duration-300 text-sm font-semibold"
            >
              Cambiar Contraseña
            </button>
          )}
        </div>

        {isEditingPassword ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Contraseña Actual */}
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                Contraseña Actual
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className={`w-full pl-10 pr-10 py-3 rounded-lg ${
                    isDarkMode ? 'bg-[#0f1117] text-white border-[#8c5cff]/20' : 'bg-gray-100 text-gray-900 border-gray-300'
                  } border focus:border-[#8c5cff] focus:ring-2 focus:ring-[#8c5cff]/30 outline-none transition-all`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#8c5cff] transition-colors"
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  className={`w-full pl-10 pr-10 py-3 rounded-lg ${
                    isDarkMode ? 'bg-[#0f1117] text-white border-[#8c5cff]/20' : 'bg-gray-100 text-gray-900 border-gray-300'
                  } border focus:border-[#8c5cff] focus:ring-2 focus:ring-[#8c5cff]/30 outline-none transition-all`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#8c5cff] transition-colors"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  className={`w-full pl-10 pr-10 py-3 rounded-lg ${
                    isDarkMode ? 'bg-[#0f1117] text-white border-[#8c5cff]/20' : 'bg-gray-100 text-gray-900 border-gray-300'
                  } border focus:border-[#8c5cff] focus:ring-2 focus:ring-[#8c5cff]/30 outline-none transition-all`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#8c5cff] transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white rounded-lg hover:shadow-lg hover:shadow-[#8c5cff]/25 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingPassword(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className={`px-4 py-3 ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2`}
              >
                <X size={18} />
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Tu contraseña fue actualizada por última vez hace X días
          </p>
        )}
      </motion.div>

      {/* Modal de recorte de imagen con Cloudinary */}
      <CloudinaryImageCrop
        isOpen={isCropModalOpen}
        onClose={() => {
          setIsCropModalOpen(false);
          setSelectedImage(null);
        }}
        imageSrc={selectedImage}
        onUploadComplete={handleUploadComplete}
        isDarkMode={isDarkMode}
        tipo="perfil"
        token={token}
      />
    </div>
  );
};

export default MiPerfil;
