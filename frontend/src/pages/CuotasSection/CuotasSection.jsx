import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, AlertCircle, CheckCircle, Clock, Loader, Wallet, Settings, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import AdminCuotasTable from './AdminCuotasTable';
import MyQuotasSection from './MyQuotasSection';
import EstadoCuotasSection from './EstadoCuotasSection';

const CuotasSection = ({ containerVariants }) => {
  const { isDarkMode, token, usuario } = useAuth();
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estadisticas, setEstadisticas] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [activeTab, setActiveTab] = useState('mis-cuotas'); // 'mis-cuotas' o 'mantenedor' (solo para admin)
  const isAdmin = usuario?.tipo_perfil === 'admin';

  // Cargar cuotas
  const cargarCuotas = async (tabActivo = activeTab) => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Si es admin en tab mantenedor, obtener solo cuotas globales
      const endpoint = isAdmin && tabActivo === 'mantenedor'
        ? `${API_ENDPOINTS.CUOTAS.GET_ALL}/globales/todas`
        : API_ENDPOINTS.CUOTAS.GET_ALL;

      const response = await axios.get(endpoint, config);
      setCuotas(response.data);
    } catch (err) {
      console.error('Error al cargar cuotas:', err);
      setError('Error al cargar las cuotas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar resumen (notificaciones)
  const cargarResumen = async () => {
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.CUOTAS.GET_RESUMEN, config);
      setResumen(response.data);
    } catch (err) {
      console.error('Error al cargar resumen:', err);
    }
  };

  // Cargar estadísticas (solo admin)
  const cargarEstadisticas = async () => {
    if (!token || usuario?.tipo_perfil !== 'admin') return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.CUOTAS.ESTADISTICAS, config);
      setEstadisticas(response.data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  useEffect(() => {
    if (token) {
      cargarCuotas();
      cargarResumen();
      cargarEstadisticas();
    }
  }, [token, usuario?.tipo_perfil]);

  // Recargar cuotas cuando cambia el tab (para mostrar globales vs personales)
  useEffect(() => {
    if (token && isAdmin) {
      cargarCuotas(activeTab);
    }
  }, [activeTab]);

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
        <DollarSign size={32} className="text-[#8c5cff]" />
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isAdmin ? 'Gestión de Cuotas' : 'Mis Cuotas'}
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isAdmin ? 'Gestiona las cuotas mensuales de nutricionistas y administradores' : 'Administra tus cuotas mensuales y realiza pagos'}
          </p>
        </div>
      </div>

      {/* Resumen para nutricionista */}
      {!isAdmin && resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#1a1c22] to-[#0f1117] border-[#8c5cff]/20'
                : 'bg-white border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cuotas Pendientes</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {resumen.totalPendientes}
                </p>
              </div>
              <Clock size={32} className={resumen.totalPendientes > 0 ? 'text-yellow-500' : 'text-green-500'} />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#1a1c22] to-[#0f1117] border-[#8c5cff]/20'
                : 'bg-white border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cuotas Vencidas</p>
                <p className={`text-2xl font-bold ${resumen.totalVencidas > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {resumen.totalVencidas}
                </p>
              </div>
              {resumen.totalVencidas > 0 ? (
                <AlertCircle size={32} className="text-red-500" />
              ) : (
                <CheckCircle size={32} className="text-green-500" />
              )}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#1a1c22] to-[#0f1117] border-[#8c5cff]/20'
                : 'bg-white border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estado</p>
                <p className={`text-sm font-semibold ${
                  resumen.esMoroso ? 'text-red-500' : 'text-green-500'
                }`}>
                  {resumen.esMoroso ? 'Moroso' : 'Al día'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Alerta de morosidad */}
      {!isAdmin && resumen?.esMoroso && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border-l-4 border-red-500 ${
            isDarkMode ? 'bg-red-500/10' : 'bg-red-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className={`font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                Tienes cuotas vencidas
              </p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-300/80' : 'text-red-600/80'}`}>
                Por favor, realiza el pago lo antes posible para evitar problemas administrativos.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700'
          }`}
        >
          {error}
        </motion.div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-[#8c5cff]" size={32} />
        </div>
      ) : (
        <>
          {/* Tabs para Admin */}
          {isAdmin && (
            <div className={`flex gap-1 md:gap-2 border-b overflow-x-auto ${
              isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
            } pb-1 mb-6`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('mis-cuotas')}
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-t-lg font-semibold text-xs md:text-sm flex-shrink-0 transition-all ${
                  activeTab === 'mis-cuotas'
                    ? isDarkMode
                      ? 'bg-[#8c5cff] text-white'
                      : 'bg-purple-600 text-white'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/20'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
                }`}
              >
                <Wallet size={16} className="md:block hidden" />
                <span className="whitespace-nowrap">Mis Cuotas</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('estado-usuarios')}
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-t-lg font-semibold text-xs md:text-sm flex-shrink-0 transition-all ${
                  activeTab === 'estado-usuarios'
                    ? isDarkMode
                      ? 'bg-[#8c5cff] text-white'
                      : 'bg-purple-600 text-white'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/20'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
                }`}
              >
                <Users size={16} className="md:block hidden" />
                <span className="whitespace-nowrap">Estado</span>
              </motion.button>

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
                <Settings size={16} className="md:block hidden" />
                <span className="whitespace-nowrap">Mantenedor</span>
              </motion.button>
            </div>
          )}

          {/* Content por Tab */}
          {isAdmin ? (
            activeTab === 'mis-cuotas' ? (
              <MyQuotasSection containerVariants={containerVariants} />
            ) : activeTab === 'estado-usuarios' ? (
              <EstadoCuotasSection containerVariants={containerVariants} />
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-l-4 border-[#8c5cff] mb-4 ${
                    isDarkMode ? 'bg-[#8c5cff]/10' : 'bg-purple-50'
                  }`}
                >
                  <p className={isDarkMode ? 'text-[#8c5cff]' : 'text-purple-700'}>
                    Las estadísticas y gráficos de cuotas están disponibles en el Dashboard → Cuotas
                  </p>
                </motion.div>

                <AdminCuotasTable cuotas={cuotas} onRefresh={cargarCuotas} containerVariants={containerVariants} />
              </>
            )
          ) : (
            // Nutritionist View - Always show MyQuotasSection
            <MyQuotasSection containerVariants={containerVariants} />
          )}
        </>
      )}
    </motion.div>
  );
};

export default CuotasSection;
