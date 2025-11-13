import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Bell, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';

const CuotasNotification = ({ isDarkMode, setActiveTab }) => {
  const { token, usuario } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (token && usuario?.tipo_perfil !== 'cliente') {
      cargarResumen();
      // Recargar cada 30 segundos
      const interval = setInterval(cargarResumen, 30000);
      return () => clearInterval(interval);
    }
  }, [token, usuario?.tipo_perfil]);

  const cargarResumen = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.CUOTAS.GET_RESUMEN, config);
      setResumen(response.data);
    } catch (err) {
      console.error('Error al cargar resumen de cuotas:', err);
    }
  };

  const tieneAlerta = resumen && (resumen.esMoroso || resumen.totalPendientes > 0);
  const totalVencidas = resumen?.totalVencidas || 0;
  const esCliente = usuario?.tipo_perfil === 'cliente';

  return (
    <div className="flex items-center gap-2">
      {/* Badge Notificación - Siempre visible */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer"
      >
        <motion.div
          animate={tieneAlerta ? { y: [0, -3, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={`relative p-2 rounded-lg ${
            isDarkMode ? 'hover:bg-[#8c5cff]/20' : 'hover:bg-purple-100'
          }`}
        >
          <Bell
            size={20}
            className={
              resumen?.esMoroso
                ? 'text-red-500'
                : tieneAlerta
                  ? 'text-yellow-500'
                  : isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-500'
            }
          />
          {tieneAlerta && totalVencidas > 0 && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-lg"
            >
              {totalVencidas}
            </motion.div>
          )}
          {tieneAlerta && totalVencidas === 0 && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-yellow-500"
            />
          )}
        </motion.div>
      </motion.div>

      {/* Popup Notificación */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className={`absolute top-full right-0 mt-2 w-80 rounded-xl shadow-2xl border z-50 ${
                isDarkMode
                  ? 'bg-[#1a1c22] border-[#8c5cff]/20'
                  : 'bg-white border-purple-200'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-4 border-b ${
                isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
              }`}>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Notificaciones
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className={`p-1 rounded ${isDarkMode ? 'hover:bg-[#8c5cff]/20' : 'hover:bg-purple-100'}`}
                >
                  <X size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                </motion.button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                {/* Mensaje para clientes - Sin notificaciones de cuotas */}
                {esCliente && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border-l-4 border-gray-400 ${
                      isDarkMode ? 'bg-gray-500/10' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Bell size={18} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                          Sin notificaciones
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400/80' : 'text-gray-600/80'}`}>
                          No hay notificaciones disponibles en este momento
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Mensaje cuando todo está al día - Solo para admin/nutricionista */}
                {!esCliente && !tieneAlerta && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border-l-4 border-green-500 ${
                      isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                          ¡Todo al día!
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-green-300/80' : 'text-green-600/80'}`}>
                          No tienes cuotas pendientes ni vencidas
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!esCliente && resumen?.esMoroso && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border-l-4 border-red-500 ${
                      isDarkMode ? 'bg-red-500/10' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                          Estás en morosidad
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-red-300/80' : 'text-red-600/80'}`}>
                          Tienes {resumen?.totalVencidas} cuota{resumen?.totalVencidas !== 1 ? 's' : ''} vencida{resumen?.totalVencidas !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Cuotas Morosas - Solo para admin/nutricionista */}
                {!esCliente && resumen?.cuotasMorosas?.length > 0 && (
                  <div className="space-y-2">
                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Cuotas Vencidas
                    </p>
                    {resumen.cuotasMorosas.slice(0, 3).map(cuota => (
                      <motion.div
                        key={cuota.id}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-xs p-2 rounded ${
                          isDarkMode ? 'bg-[#0f1117]' : 'bg-gray-50'
                        }`}
                      >
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][cuota.mes - 1]} {cuota.ano}
                        </p>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          CLP ${cuota.monto.toLocaleString('es-CL')}
                        </p>
                      </motion.div>
                    ))}
                    {resumen.cuotasMorosas.length > 3 && (
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        +{resumen.cuotasMorosas.length - 3} más
                      </p>
                    )}
                  </div>
                )}

                {/* Cuotas Pendientes (no vencidas) - Solo para admin/nutricionista */}
                {!esCliente && resumen?.totalPendientes > 0 && !resumen?.esMoroso && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border-l-4 border-yellow-500 ${
                      isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                          Cuotas Pendientes
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-yellow-300/80' : 'text-yellow-600/80'}`}>
                          Tienes {resumen?.totalPendientes} cuota{resumen?.totalPendientes !== 1 ? 's' : ''} pendiente{resumen?.totalPendientes !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Próximas a Vencer - Solo para admin/nutricionista */}
                {!esCliente && resumen?.proximasAVencer?.length > 0 && (
                  <div className="space-y-2">
                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Próximas a Vencer
                    </p>
                    {resumen.proximasAVencer.slice(0, 2).map(cuota => (
                      <motion.div
                        key={cuota.id}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-xs p-2 rounded border-l-2 border-yellow-500 ${
                          isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'
                        }`}
                      >
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][cuota.mes - 1]} {cuota.ano}
                        </p>
                        <p className={isDarkMode ? 'text-yellow-300/80' : 'text-yellow-700/80'}>
                          Vence: {new Date(cuota.fecha_vencimiento).toLocaleDateString('es-CL')}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Botón Ver Todas - Solo para admin/nutricionista si hay notificaciones de cuotas */}
                {!esCliente && (resumen?.esMoroso || resumen?.totalPendientes > 0 || resumen?.proximasAVencer?.length > 0) && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveTab('cuotas');
                      setIsOpen(false);
                    }}
                    className={`w-full mt-4 py-2 rounded-lg font-semibold transition-colors ${
                      isDarkMode
                        ? 'bg-[#8c5cff] text-white hover:bg-[#7a4cde]'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    Ver Cuotas y Pagos
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CuotasNotification;
