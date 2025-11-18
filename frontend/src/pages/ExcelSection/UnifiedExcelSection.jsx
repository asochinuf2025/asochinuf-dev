import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, History, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CargarExcelSection from './CargarExcelSection';
import HistorialExcelSection from './HistorialExcelSection';

const UnifiedExcelSection = ({ containerVariants }) => {
  const { isDarkMode, usuario } = useAuth();
  const [activeTab, setActiveTab] = useState('cargar'); // 'cargar' o 'historial'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Validar que sea nutricionista o admin
  const isAuthorized = usuario?.tipo_perfil === 'nutricionista' || usuario?.tipo_perfil === 'admin';

  // Callback para refrescar el historial cuando se carga un archivo exitosamente
  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    // Cambiar automáticamente a la pestaña de historial después de cargar
    setTimeout(() => {
      setActiveTab('historial');
    }, 3000);
  };

  if (!isAuthorized) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Upload size={32} className="text-[#8c5cff]" />
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Carga de Excel
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestión de archivos Excel con datos antropométricos
            </p>
          </div>
        </div>

        {/* Mensaje de acceso restringido */}
        <div
          className={`p-8 rounded-2xl border text-center ${
            isDarkMode ? 'bg-[#1a1c22]/50 border-red-500/20' : 'bg-red-50 border-red-200'
          }`}
        >
          <AlertCircle
            size={48}
            className={`mx-auto mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}
          />
          <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Acceso Restringido
          </h3>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Solo los nutricionistas y administradores pueden acceder a esta sección.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Upload size={32} className="text-[#8c5cff]" />
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Excel
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Carga archivos Excel y consulta el historial de cargas
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 md:gap-2 border-b overflow-x-auto ${
        isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
      } pb-1 mb-6`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('cargar')}
          className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-t-lg font-semibold text-xs md:text-sm flex-shrink-0 transition-all ${
            activeTab === 'cargar'
              ? isDarkMode
                ? 'bg-[#8c5cff] text-white'
                : 'bg-purple-600 text-white'
              : isDarkMode
              ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
          }`}
        >
          <Upload size={16} className="md:block hidden" />
          <span className="whitespace-nowrap">Cargar</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-t-lg font-semibold text-xs md:text-sm flex-shrink-0 transition-all ${
            activeTab === 'historial'
              ? isDarkMode
                ? 'bg-[#8c5cff] text-white'
                : 'bg-purple-600 text-white'
              : isDarkMode
              ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
          }`}
        >
          <History size={16} className="md:block hidden" />
          <span className="whitespace-nowrap">Historial</span>
        </motion.button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'cargar' && (
          <motion.div
            key="cargar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CargarExcelSection
              containerVariants={containerVariants}
              onUploadSuccess={handleUploadSuccess}
            />
          </motion.div>
        )}

        {activeTab === 'historial' && (
          <motion.div
            key="historial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <HistorialExcelSection
              containerVariants={containerVariants}
              refreshTrigger={refreshTrigger}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UnifiedExcelSection;
