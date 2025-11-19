import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Lazy load all dashboard sections for better performance
const DashboardSection = lazy(() => import('../pages/DashboardSection/DashboardSection'));
const UnifiedCursosSection = lazy(() => import('../pages/CursosSection/UnifiedCursosSection'));
const DatosSection = lazy(() => import('../pages/DatosSection/DatosSection'));
const UnifiedExcelSection = lazy(() => import('../pages/ExcelSection/UnifiedExcelSection'));
const ConfiguracionSection = lazy(() => import('../pages/ConfiguracionSection/ConfiguracionSection'));
const GestionUsuariosSection = lazy(() => import('../pages/GestionUsuariosSection/GestionUsuariosSection'));
const GestionPlantelesSection = lazy(() => import('../pages/GestionPlantelesSection/GestionPlantelesSection'));
const MiPerfil = lazy(() => import('../pages/PerfilSection/MiPerfil'));
const CuotasSection = lazy(() => import('../pages/CuotasSection/CuotasSection'));
const DocumentosSection = lazy(() => import('../pages/DocumentosSection/DocumentosSection'));
const CursoDetallePage = lazy(() => import('../pages/CursoDetallePage'));

// Loading fallback component
const SectionLoadingFallback = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    Cargando sección...
  </div>
);

const MainContent = ({ activeTab, cursoSeleccionado, onCloseCursoDetalle, setActiveTab, onVerDetalleCurso }) => {
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
        {cursoSeleccionado ? (
          <Suspense fallback={<SectionLoadingFallback />}>
            <CursoDetallePage
              curso={cursoSeleccionado}
              onBack={onCloseCursoDetalle}
              containerVariants={containerVariants}
            />
          </Suspense>
        ) : (
          <>
            {activeTab === 'inicio' && (
              <Suspense fallback={<SectionLoadingFallback />}>
                <DashboardSection containerVariants={containerVariants} itemVariants={itemVariants} />
              </Suspense>
            )}
            {activeTab === 'cursos' && (
              <Suspense fallback={<SectionLoadingFallback />}>
                <UnifiedCursosSection containerVariants={containerVariants} onVerDetalleCurso={onVerDetalleCurso} />
              </Suspense>
            )}
            {activeTab === 'datos' && (
              <Suspense fallback={<SectionLoadingFallback />}>
                <DatosSection containerVariants={containerVariants} />
              </Suspense>
            )}
            {activeTab === 'excel' && (
              <Suspense fallback={<SectionLoadingFallback />}>
                <UnifiedExcelSection containerVariants={containerVariants} />
              </Suspense>
            )}
            {activeTab === 'cuotas' && (
              <Suspense fallback={<SectionLoadingFallback />}>
                <CuotasSection containerVariants={containerVariants} />
              </Suspense>
            )}
            {activeTab === 'documentos' && (
              <Suspense fallback={<SectionLoadingFallback />}>
                <DocumentosSection containerVariants={containerVariants} itemVariants={itemVariants} />
              </Suspense>
            )}
            {activeTab === 'perfil' && (
              <Suspense fallback={<SectionLoadingFallback />}>
                <MiPerfil />
              </Suspense>
            )}
            {activeTab === 'configuracion' && (
              <Suspense fallback={<SectionLoadingFallback />}>
                <ConfiguracionSection containerVariants={containerVariants} />
              </Suspense>
            )}
            {activeTab === 'gestionplanteles' && (
              <Suspense fallback={<SectionLoadingFallback />}>
                <GestionPlantelesSection containerVariants={containerVariants} />
              </Suspense>
            )}
            {activeTab === 'gestion' && (
              <Suspense fallback={<SectionLoadingFallback />}>
                <GestionUsuariosSection containerVariants={containerVariants} />
              </Suspense>
            )}
          </>
        )}
      </AnimatePresence>
    </main>
  );
};

export default MainContent;
