import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import DashboardSection from './DashboardSection';
import AnthropometricDashboardTab from './AnthropometricDashboardTab';
import CuotasDashboardTab from './CuotasDashboardTab';
import { Home, BarChart3, DollarSign } from 'lucide-react';

const UnifiedDashboardSection = ({ containerVariants, itemVariants }) => {
  const { isDarkMode, usuario } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  // Determinar si es nutricionista o admin (para mostrar pestañas extras)
  const isNutritionistOrAdmin = usuario?.tipo_perfil !== 'cliente';

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
        <Home size={32} className="text-[#8c5cff]" />
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dashboard
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Panel de control e información
          </p>
        </div>
      </div>

      {/* Tabs - Solo mostrar para nutricionistas y admins */}
      {isNutritionistOrAdmin && (
        <div className={`flex gap-1 md:gap-2 border-b overflow-x-auto ${
          isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
        } pb-1 mb-6`}>
          {/* Tab: General */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-t-lg font-semibold text-xs md:text-sm flex-shrink-0 transition-all ${
              activeTab === 'general'
                ? isDarkMode
                  ? 'bg-[#8c5cff] text-white'
                  : 'bg-purple-600 text-white'
                : isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/20'
                : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
            }`}
          >
            <Home size={16} className="md:block hidden" />
            <span className="whitespace-nowrap">General</span>
          </motion.button>

          {/* Tab: Antropometría */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('antropometria')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-t-lg font-semibold text-xs md:text-sm flex-shrink-0 transition-all ${
              activeTab === 'antropometria'
                ? isDarkMode
                  ? 'bg-[#8c5cff] text-white'
                  : 'bg-purple-600 text-white'
                : isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/20'
                : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
            }`}
          >
            <BarChart3 size={16} className="md:block hidden" />
            <span className="whitespace-nowrap">Antropometría</span>
          </motion.button>

          {/* Tab: Cuotas (Solo admin) */}
          {usuario?.tipo_perfil === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('cuotas')}
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-t-lg font-semibold text-xs md:text-sm flex-shrink-0 transition-all ${
                activeTab === 'cuotas'
                  ? isDarkMode
                    ? 'bg-[#8c5cff] text-white'
                    : 'bg-purple-600 text-white'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
              }`}
            >
              <DollarSign size={16} className="md:block hidden" />
              <span className="whitespace-nowrap">Cuotas</span>
            </motion.button>
          )}
        </div>
      )}

      {/* Content - Tab switching */}
      <AnimatePresence mode="wait">
        {activeTab === 'general' && (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DashboardSection containerVariants={containerVariants} itemVariants={itemVariants} />
          </motion.div>
        )}

        {activeTab === 'antropometria' && (
          <motion.div
            key="antropometria"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <AnthropometricDashboardTab />
          </motion.div>
        )}

        {activeTab === 'cuotas' && (
          <motion.div
            key="cuotas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CuotasDashboardTab />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UnifiedDashboardSection;
