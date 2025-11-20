import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronsLeft, Home, BookOpen, User, Upload, Settings, Moon, Sun, Users, Trophy, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, handleLogout }) => {
  const { isDarkMode, toggleTheme, usuario } = useAuth();

  const baseMenuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'cursos', label: 'Cursos', icon: BookOpen },
    // { id: 'datos', label: 'Inf. Antropométrico', icon: User },
  ];

  // Excel solo para nutricionistas y admins
  const excelItem = usuario?.tipo_perfil !== 'cliente'
    ? [{ id: 'excel', label: 'Cargar Excel', icon: Upload }]
    : [];

  // Eventos para todos
  const documentosItem = [{ id: 'documentos', label: 'Eventos', icon: FileText }];

  // Cuotas para nutricionistas y admins
  const cuotasItem = usuario?.tipo_perfil !== 'cliente'
    ? [{ id: 'cuotas', label: 'Cuotas y Pagos', icon: DollarSign }]
    : [];

  // Gestión Planteles solo para admins
  const gestionPlantelesItem = usuario?.tipo_perfil === 'admin'
    ? [{ id: 'gestionplanteles', label: 'Gestión Planteles', icon: Trophy }]
    : [];

  // Gestión Usuarios solo para admins
  const gestionUsuariosItem = usuario?.tipo_perfil === 'admin'
    ? [{ id: 'gestion', label: 'Gestión Usuarios', icon: Users }]
    : [];

  const menuItems = [...baseMenuItems, ...excelItem, ...documentosItem, ...cuotasItem, ...gestionPlantelesItem, ...gestionUsuariosItem];

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: sidebarOpen ? 256 : 110 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`hidden md:flex ${
        isDarkMode
          ? 'bg-gradient-to-b from-[#1a1c22] to-[#0f1117] border-[#8c5cff]/20'
          : 'bg-gradient-to-b from-white to-[#f5f5f7] border-purple-200'
      } border-r flex flex-col p-6 gap-8 overflow-y-auto relative fixed h-screen left-0 top-0 z-50`}
    >
      {/* Sidebar Header - Logo y nombre */}
      <div className={`pb-6 border-b ${isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer justify-center"
          onClick={() => setActiveTab('inicio')}
        >
          <img
            src="/logos/logo.png"
            alt="ASOCHINUF"
            className={`flex-shrink-0 ${sidebarOpen ? 'h-16' : 'h-10'} w-auto`}
          />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className={`text-lg font-bold bg-clip-text text-transparent whitespace-nowrap ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-white via-[#8c5cff] to-white'
                      : 'bg-gradient-to-r from-gray-900 via-[#8c5cff] to-gray-900'
                  }`}
                >
                  ASOCHINUF
                </h2>
                <p className={`text-xs whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Panel de Control</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col gap-3 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: sidebarOpen ? 5 : 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                sidebarOpen ? 'w-full justify-start' : 'w-full justify-center'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white shadow-lg shadow-[#8c5cff]/25'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                    className="font-semibold whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && sidebarOpen && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-2 h-2 rounded-full bg-white"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className={`space-y-3 border-t ${isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'} pt-4`}>
        {/* Theme Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.02, x: sidebarOpen ? 5 : 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleTheme}
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 w-full ${
            sidebarOpen ? 'justify-start' : 'justify-center'
          } ${
            isDarkMode
              ? 'text-gray-400 hover:text-[#8c5cff] hover:bg-[#8c5cff]/10'
              : 'text-gray-600 hover:text-[#8c5cff] hover:bg-purple-100'
          }`}
        >
          {isDarkMode ? (
            <Sun size={20} className="flex-shrink-0" />
          ) : (
            <Moon size={20} className="flex-shrink-0" />
          )}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                className="font-semibold whitespace-nowrap"
              >
                {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Collapse Button */}
        <motion.button
          whileHover={{ scale: 1.02, x: sidebarOpen ? 5 : 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Colapsar' : 'Expandir'}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 w-full ${
            sidebarOpen ? 'justify-start' : 'justify-center'
          } ${
            isDarkMode
              ? 'text-gray-400 hover:text-[#8c5cff] hover:bg-[#8c5cff]/10'
              : 'text-gray-600 hover:text-[#8c5cff] hover:bg-purple-100'
          }`}
        >
          <ChevronsLeft size={20} className={`flex-shrink-0 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                className="font-semibold whitespace-nowrap"
              >
                {sidebarOpen ? 'Colapsar' : 'Expandir'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Logout Button - DISABLED */}
        {/*
        <motion.button
          whileHover={{ scale: 1.02, x: sidebarOpen ? 5 : 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          title="Cerrar sesión"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 w-full ${
            sidebarOpen ? 'justify-start' : 'justify-center'
          } ${
            isDarkMode
              ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10'
              : 'text-gray-600 hover:text-red-600 hover:bg-red-100'
          }`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                className="font-semibold whitespace-nowrap"
              >
                Cerrar sesión
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        */}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
