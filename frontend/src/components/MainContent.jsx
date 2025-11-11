import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import DashboardSection from '../pages/DashboardSection/DashboardSection';
import UnifiedCursosSection from '../pages/CursosSection/UnifiedCursosSection';
import DatosSection from '../pages/DatosSection/DatosSection';
import UnifiedExcelSection from '../pages/ExcelSection/UnifiedExcelSection';
import ConfiguracionSection from '../pages/ConfiguracionSection/ConfiguracionSection';
import GestionUsuariosSection from '../pages/GestionUsuariosSection/GestionUsuariosSection';
import GestionPlantelesSection from '../pages/GestionPlantelesSection/GestionPlantelesSection';
import MiPerfil from '../pages/PerfilSection/MiPerfil';
import CuotasSection from '../pages/CuotasSection/CuotasSection';
import DocumentosSection from '../pages/DocumentosSection/DocumentosSection';

const MainContent = ({ activeTab }) => {
  const { isDarkMode } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className={`flex-1 overflow-y-auto p-4 md:p-10 pt-6 md:pt-12 pb-32 md:pb-12 ${isDarkMode ? '' : 'bg-gradient-to-b from-[#fafafa] to-[#f5f5f7]'}`}>
      <AnimatePresence mode="wait">
        {activeTab === 'inicio' && <DashboardSection containerVariants={containerVariants} itemVariants={itemVariants} />}
        {activeTab === 'cursos' && <UnifiedCursosSection containerVariants={containerVariants} />}
        {activeTab === 'datos' && <DatosSection containerVariants={containerVariants} />}
        {activeTab === 'excel' && <UnifiedExcelSection containerVariants={containerVariants} />}
        {activeTab === 'cuotas' && <CuotasSection containerVariants={containerVariants} />}
        {activeTab === 'documentos' && <DocumentosSection containerVariants={containerVariants} itemVariants={itemVariants} />}
        {activeTab === 'perfil' && <MiPerfil />}
        {activeTab === 'configuracion' && <ConfiguracionSection containerVariants={containerVariants} />}
        {activeTab === 'gestionplanteles' && <GestionPlantelesSection containerVariants={containerVariants} />}
        {activeTab === 'gestion' && <GestionUsuariosSection containerVariants={containerVariants} />}
      </AnimatePresence>
    </main>
  );
};

export default MainContent;
