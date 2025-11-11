import React from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, Upload, Users, Trophy, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const { isDarkMode, usuario } = useAuth();

  const baseMenuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'cursos', label: 'Cursos', icon: BookOpen },
    // { id: 'datos', label: 'Inf. Antropométrico', icon: User },
  ];

  // Excel solo para nutricionistas y admins
  const excelItem = usuario?.tipo_perfil !== 'cliente'
    ? [{ id: 'excel', label: 'Excel', icon: Upload }]
    : [];

  // Documentos para todos
  const documentosItem = [{ id: 'documentos', label: 'Documentos', icon: FileText }];

  // Cuotas solo para nutricionistas y admins
  const cuotasItem = usuario?.tipo_perfil !== 'cliente'
    ? [{ id: 'cuotas', label: 'Cuotas', icon: DollarSign }]
    : [];

  // Gestión de Planteles solo para admins
  const gestionPlantelesItem = usuario?.tipo_perfil === 'admin'
    ? [{ id: 'gestionplanteles', label: 'Planteles', icon: Trophy }]
    : [];

  // Gestión de Usuarios solo para admins
  const gestionUsuariosItem = usuario?.tipo_perfil === 'admin'
    ? [{ id: 'gestion', label: 'Usuarios', icon: Users }]
    : [];

  const menuItems = [...baseMenuItems, ...excelItem, ...documentosItem, ...cuotasItem, ...gestionPlantelesItem, ...gestionUsuariosItem];

  return (
    <motion.nav
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`md:hidden fixed bottom-0 left-0 right-0 ${
        isDarkMode
          ? 'bg-gradient-to-t from-[#1a1c22] to-[#0f1117] border-[#8c5cff]/20'
          : 'bg-gradient-to-t from-white to-[#f5f5f7] border-purple-200'
      } border-t backdrop-blur-xl z-40`}
    >
      <div className="flex items-center justify-around py-3 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'text-[#8c5cff]'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={24} className="flex-shrink-0" />
              <span className="text-xs font-semibold whitespace-nowrap">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="h-1 w-12 rounded-full bg-[#8c5cff] mt-1"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
