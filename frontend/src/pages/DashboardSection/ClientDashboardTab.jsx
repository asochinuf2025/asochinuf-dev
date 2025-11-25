import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useClientDashboardData } from '../../hooks/useClientDashboardData';
import { BookOpen, ShoppingCart, Calendar, AlertCircle } from 'lucide-react';

const ClientDashboardTab = () => {
  const { isDarkMode } = useAuth();
  const { cursosDisponibles, misCursos, totalEventos, proximoEvento, loading, error } =
    useClientDashboardData();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-6 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-500' : 'bg-red-50 border border-red-200'}`}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-500" size={24} />
          <div>
            <p className={`font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
              Error
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* 4 Cards de Métricas */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card 1: Cursos Disponibles */}
        <ClientMetricCard
          title="Cursos Disponibles"
          value={cursosDisponibles}
          icon={<BookOpen size={24} className="text-blue-500" />}
          isDarkMode={isDarkMode}
          bgColor="blue"
          loading={loading}
        />

        {/* Card 2: Mis Cursos Comprados */}
        <ClientMetricCard
          title="Mis Cursos Comprados"
          value={misCursos.length}
          icon={<ShoppingCart size={24} className="text-green-500" />}
          isDarkMode={isDarkMode}
          bgColor="green"
          loading={loading}
        />

        {/* Card 3: Total de Eventos */}
        <ClientMetricCard
          title="Total de Eventos"
          value={totalEventos}
          icon={<Calendar size={24} className="text-purple-500" />}
          isDarkMode={isDarkMode}
          bgColor="purple"
          loading={loading}
        />

        {/* Card 4: Próximo Evento */}
        <div
          className={`p-6 rounded-lg border ${
            isDarkMode
              ? 'bg-orange-900/20 border-orange-700'
              : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p
                className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Próximo Evento
              </p>
              <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {loading ? '...' : proximoEvento ? proximoEvento.nombre || 'Sin nombre' : 'N/A'}
              </p>
              {proximoEvento && (
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date(proximoEvento.fecha_evento || proximoEvento.created_at).toLocaleDateString(
                    'es-CL'
                  )}
                </p>
              )}
            </div>
            <div className="opacity-80">
              <Calendar size={24} className="text-orange-500" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sección adicional: Mis Cursos Comprados */}
      {misCursos.length > 0 && (
        <motion.div
          variants={itemVariants}
          className={`p-6 rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Mis Cursos Comprados
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {misCursos.map((curso, index) => (
              <div
                key={index}
                className={`p-3 rounded flex justify-between items-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <div className="flex-1">
                  <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {curso.nombre}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {curso.codigo_curso || 'Sin código'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-500 font-semibold">
                    {curso.nivel ? curso.nivel.charAt(0).toUpperCase() + curso.nivel.slice(1) : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Componente reutilizable para tarjetas de métricas del cliente
 */
function ClientMetricCard({ title, value, icon, isDarkMode, bgColor, loading }) {
  const bgColorClasses = {
    blue: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
    green: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
    purple: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
    orange: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50',
  };

  const borderColorClasses = {
    blue: isDarkMode ? 'border-blue-700' : 'border-blue-200',
    green: isDarkMode ? 'border-green-700' : 'border-green-200',
    purple: isDarkMode ? 'border-purple-700' : 'border-purple-200',
    orange: isDarkMode ? 'border-orange-700' : 'border-orange-200',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 rounded-lg border ${bgColorClasses[bgColor]} ${borderColorClasses[bgColor]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {loading ? '...' : value}
          </p>
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </motion.div>
  );
}

export default ClientDashboardTab;
