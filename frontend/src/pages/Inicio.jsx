import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MainContent from '../components/MainContent';
import BottomNav from '../components/BottomNav';

const Inicio = () => {
  const { usuario, logout, isDarkMode } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    // Recuperar activeTab de sessionStorage si existe
    return sessionStorage.getItem('asochinuf_activeTab') || 'inicio';
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  // Guardar activeTab en sessionStorage cuando cambie
  React.useEffect(() => {
    sessionStorage.setItem('asochinuf_activeTab', activeTab);
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleVerDetalleCurso = (curso) => {
    setCursoSeleccionado(curso);
  };

  const handleCloseCursoDetalle = () => {
    setCursoSeleccionado(null);
  };

  return (
    <div className={`h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-gradient-to-b from-[#fafafa] to-[#f5f5f7] text-gray-900'} flex`}>
      {/* Sidebar - Desktop only (Fixed) */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      {/* Main container with fixed header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Fixed at top */}
        <Header
          setActiveTab={setActiveTab}
          setSettingsMenuOpen={setSettingsMenuOpen}
          settingsMenuOpen={settingsMenuOpen}
          handleLogout={handleLogout}
        />

        {/* Main Content - Scrollable only this section */}
        <MainContent
          activeTab={activeTab}
          cursoSeleccionado={cursoSeleccionado}
          onCloseCursoDetalle={handleCloseCursoDetalle}
          setActiveTab={setActiveTab}
          onVerDetalleCurso={handleVerDetalleCurso}
        />
      </div>

      {/* Bottom Navigation Bar - Mobile only (Fixed) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Inicio;
