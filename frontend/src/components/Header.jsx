import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CuotasNotification from './CuotasNotification';

const Header = ({ setActiveTab, setSettingsMenuOpen, settingsMenuOpen, handleLogout }) => {
  const { usuario, isDarkMode, toggleTheme } = useAuth();
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth > 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`md:hidden ${
          isDarkMode
            ? 'bg-gradient-to-r from-[#1a1c22] to-[#0f1117] border-[#8c5cff]/20'
            : 'bg-gradient-to-r from-white to-[#f5f5f7] border-purple-200'
        } border-b backdrop-blur-xl z-40 px-4 py-3 flex items-center justify-between flex-shrink-0 mt-1`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] flex items-center justify-center text-xs font-bold overflow-hidden">
            {usuario?.foto ? (
              <img
                src={
                  usuario.foto.startsWith('http')
                    ? usuario.foto
                    : `/foto_perfil/${usuario.foto}?t=${Date.now()}`
                }
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              usuario?.nombre[0]
            )}
          </div>
          <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usuario?.nombre}</p>
        </div>

        <div className="flex items-center gap-2">
          <CuotasNotification isDarkMode={isDarkMode} setActiveTab={setActiveTab} />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-[#8c5cff]/20 rounded-lg transition-colors duration-300"
            title="Opciones"
          >
            <Settings size={18} className="text-[#8c5cff]" />
          </motion.button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full right-4 mt-2 ${
                isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
              } border rounded-lg shadow-lg overflow-hidden z-50 min-w-max`}
            >
              {/* Mi Perfil */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(140, 92, 255, 0.1)' }}
                onClick={() => {
                  setActiveTab('perfil');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors border-b ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white border-[#8c5cff]/10'
                    : 'text-gray-700 hover:text-gray-900 border-purple-100'
                }`}
              >
                <User size={16} className="text-[#8c5cff]" />
                <span>Mi Perfil</span>
              </motion.button>

              {/* Configuración */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(140, 92, 255, 0.1)' }}
                onClick={() => {
                  setActiveTab('configuracion');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors border-b ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white border-[#8c5cff]/10'
                    : 'text-gray-700 hover:text-gray-900 border-purple-100'
                }`}
              >
                <Settings size={16} className="text-[#8c5cff]" />
                <span>Configuración</span>
              </motion.button>

              {/* Modo Claro/Oscuro */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(140, 92, 255, 0.1)' }}
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors border-b ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white border-[#8c5cff]/10'
                    : 'text-gray-700 hover:text-gray-900 border-purple-100'
                }`}
              >
                {isDarkMode ? (
                  <Sun size={16} className="text-[#8c5cff]" />
                ) : (
                  <Moon size={16} className="text-[#8c5cff]" />
                )}
                <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </motion.button>

              {/* Cerrar Sesión */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-red-400'
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                <LogOut size={16} className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
                <span>Cerrar sesión</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    );
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`hidden md:flex ${
        isDarkMode
          ? 'bg-gradient-to-r from-[#1a1c22] to-[#0f1117] border-[#8c5cff]/20'
          : 'bg-gradient-to-r from-white to-[#f5f5f7] border-purple-200'
      } border backdrop-blur-xl z-40 px-6 py-4 items-center justify-end gap-6 mx-4 rounded-2xl shadow-lg flex-shrink-0 mt-2`}
    >
      <div className="flex items-center gap-4">
        {/* Notificación de Cuotas */}
        <CuotasNotification isDarkMode={isDarkMode} setActiveTab={setActiveTab} />

        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] flex items-center justify-center text-sm font-bold overflow-hidden">
            {usuario?.foto ? (
              <img
                src={
                  usuario.foto.startsWith('http')
                    ? usuario.foto
                    : `/foto_perfil/${usuario.foto}?t=${Date.now()}`
                }
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              usuario?.nombre[0]
            )}
          </div>
          <div className="hidden sm:block">
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usuario?.nombre} {usuario?.apellido}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} capitalize`}>{usuario?.tipo_perfil}</p>
          </div>

          {/* Settings Dropdown */}
          <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
          className="ml-2 p-2 hover:bg-[#8c5cff]/20 rounded-lg transition-colors duration-300"
          title="Opciones"
        >
          <motion.div
            animate={{ rotate: settingsMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Settings size={20} className="text-[#8c5cff]" />
          </motion.div>
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {settingsMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full right-0 mt-2 ${
                isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
              } border rounded-lg shadow-lg overflow-hidden z-50 min-w-max`}
            >
              {/* Mi Perfil */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(140, 92, 255, 0.1)' }}
                onClick={() => {
                  setActiveTab('perfil');
                  setSettingsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors border-b ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white border-[#8c5cff]/10'
                    : 'text-gray-700 hover:text-gray-900 border-purple-100'
                }`}
              >
                <User size={16} className="text-[#8c5cff]" />
                <span>Mi Perfil</span>
              </motion.button>

              {/* Configuración */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(140, 92, 255, 0.1)' }}
                onClick={() => {
                  setActiveTab('configuracion');
                  setSettingsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors border-b ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white border-[#8c5cff]/10'
                    : 'text-gray-700 hover:text-gray-900 border-purple-100'
                }`}
              >
                <Settings size={16} className="text-[#8c5cff]" />
                <span>Configuración</span>
              </motion.button>

              {/* Cerrar Sesión */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                onClick={() => {
                  handleLogout();
                  setSettingsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-red-400'
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                <LogOut size={16} className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
                <span>Cerrar sesión</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
