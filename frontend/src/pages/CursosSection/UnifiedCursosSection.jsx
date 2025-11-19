import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, GraduationCap, CheckCircle, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CursosSection from './CursosSection';
import MisCursosSection from './MisCursosSection';
import GestionCursosSection from './GestionCursosSection';
import GestionDetallesCursosSection from '../GestionDetallesCursosSection/GestionDetallesCursosSection';

const UnifiedCursosSection = ({ containerVariants, onVerDetalleCurso }) => {
  const { isDarkMode, usuario } = useAuth();
  const isAdmin = usuario?.tipo_perfil === 'admin';
  const [activeTab, setActiveTab] = useState('cursos'); // 'cursos', 'mis-cursos' o 'gestion' (solo para admin)

  // Si no es admin, forzar tab de cursos o mis-cursos
  useEffect(() => {
    if (!isAdmin && (activeTab === 'mantenedor' || activeTab === 'sesiones')) {
      setActiveTab('cursos');
    }
  }, [isAdmin, activeTab]);

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
        <BookOpen size={32} className="text-[#8c5cff]" />
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isAdmin ? 'Gestión de Cursos' : 'Cursos Disponibles'}
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isAdmin
              ? 'Explora el catálogo de cursos o gestiona el contenido disponible'
              : 'Explora el catálogo de cursos disponibles'}
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
          onClick={() => setActiveTab('cursos')}
          className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-t-lg font-semibold text-xs md:text-sm flex-shrink-0 transition-all ${
            activeTab === 'cursos'
              ? isDarkMode
                ? 'bg-[#8c5cff] text-white'
                : 'bg-purple-600 text-white'
              : isDarkMode
              ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
          }`}
        >
          <GraduationCap size={16} className="md:block hidden" />
          <span className="whitespace-nowrap">Cursos</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('mis-cursos')}
          className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-t-lg font-semibold text-xs md:text-sm flex-shrink-0 transition-all ${
            activeTab === 'mis-cursos'
              ? isDarkMode
                ? 'bg-[#8c5cff] text-white'
                : 'bg-purple-600 text-white'
              : isDarkMode
              ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
          }`}
        >
          <CheckCircle size={16} className="md:block hidden" />
          <span className="whitespace-nowrap">Mis Cursos</span>
        </motion.button>

        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('mantenedor')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-t-lg font-semibold text-xs md:text-sm flex-shrink-0 transition-all ${
              activeTab === 'mantenedor'
                ? isDarkMode
                  ? 'bg-[#8c5cff] text-white'
                  : 'bg-purple-600 text-white'
                : isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/20'
                : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
            }`}
          >
            <BookOpen size={16} className="md:block hidden" />
            <span className="whitespace-nowrap">Mantenedor</span>
          </motion.button>
        )}

        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('sesiones')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-t-lg font-semibold text-xs md:text-sm flex-shrink-0 transition-all ${
              activeTab === 'sesiones'
                ? isDarkMode
                  ? 'bg-[#8c5cff] text-white'
                  : 'bg-purple-600 text-white'
                : isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/20'
                : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
            }`}
          >
            <Settings size={16} className="md:block hidden" />
            <span className="whitespace-nowrap">Sesiones Cursos</span>
          </motion.button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'cursos' && (
          <motion.div
            key="cursos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CursosSection containerVariants={containerVariants} onVerDetalleCurso={onVerDetalleCurso} />
          </motion.div>
        )}

        {activeTab === 'mis-cursos' && (
          <motion.div
            key="mis-cursos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <MisCursosSection containerVariants={containerVariants} />
          </motion.div>
        )}

        {activeTab === 'mantenedor' && isAdmin && (
          <motion.div
            key="mantenedor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <GestionCursosSection containerVariants={containerVariants} />
          </motion.div>
        )}

        {activeTab === 'sesiones' && isAdmin && (
          <motion.div
            key="sesiones"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <GestionDetallesCursosSection containerVariants={containerVariants} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UnifiedCursosSection;
