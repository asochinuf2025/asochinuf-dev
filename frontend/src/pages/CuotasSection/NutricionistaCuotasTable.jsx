import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';
import PaymentModal from './PaymentModal';

const NutricionistaCuotasTable = ({ cuotas, onRefresh, containerVariants }) => {
  const { isDarkMode, token } = useAuth();
  const [selectedCuota, setSelectedCuota] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { bg: 'bg-yellow-500/20', text: 'text-yellow-600', label: 'Pendiente' },
      pagado: { bg: 'bg-green-500/20', text: 'text-green-600', label: 'Pagado' },
      vencido: { bg: 'bg-red-500/20', text: 'text-red-600', label: 'Vencido' },
      cancelado: { bg: 'bg-gray-500/20', text: 'text-gray-600', label: 'Cancelado' }
    };
    return badges[estado] || badges.pendiente;
  };

  const getStatusIcon = (estado) => {
    if (estado === 'pagado') return <Check size={16} className="text-green-500" />;
    if (estado === 'vencido') return <X size={16} className="text-red-500" />;
    return null;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const handlePay = (cuota) => {
    setSelectedCuota(cuota);
    setShowPaymentModal(true);
  };

  const cuotasPorEstado = {
    pendiente: cuotas.filter(c => c.estado === 'pendiente' || c.estado === 'vencido'),
    pagado: cuotas.filter(c => c.estado === 'pagado')
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Cuotas Pendientes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Cuotas Pendientes
        </h2>

        {cuotasPorEstado.pendiente.length === 0 ? (
          <motion.div
            className={`p-8 rounded-xl border-2 border-dashed text-center ${
              isDarkMode
                ? 'border-[#8c5cff]/20 bg-[#8c5cff]/5'
                : 'border-purple-200 bg-purple-50'
            }`}
          >
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              No tienes cuotas pendientes
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {cuotasPorEstado.pendiente.map((cuota, idx) => {
              const badge = getEstadoBadge(cuota.estado);
              const estaVencida = new Date(cuota.fecha_vencimiento) < new Date();

              return (
                <motion.div
                  key={cuota.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-xl border ${
                    isDarkMode
                      ? 'bg-[#1a1c22] border-[#8c5cff]/20 hover:border-[#8c5cff]/40'
                      : 'bg-white border-purple-200 hover:border-purple-400'
                  } transition-all`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {meses[cuota.mes - 1]} {cuota.ano}
                        </h3>
                        {getStatusIcon(cuota.estado)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>Monto</p>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            CLP ${Number(cuota.monto).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div>
                          <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>Vencimiento</p>
                          <p className={`font-semibold ${estaVencida ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatFecha(cuota.fecha_vencimiento)}
                            {estaVencida && ' (Vencida)'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePay(cuota)}
                      disabled={cuota.estado === 'cancelado'}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                        cuota.estado === 'cancelado'
                          ? 'bg-gray-400/20 text-gray-500 cursor-not-allowed'
                          : 'bg-[#8c5cff] text-white hover:bg-[#7a4cde]'
                      }`}
                    >
                      <CreditCard size={18} />
                      Pagar
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Cuotas Pagadas */}
      {cuotasPorEstado.pagado.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Cuotas Pagadas
          </h2>

          <div className="space-y-3">
            {cuotasPorEstado.pagado.map((cuota, idx) => {
              const badge = getEstadoBadge(cuota.estado);

              return (
                <motion.div
                  key={cuota.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-xl border ${
                    isDarkMode
                      ? 'bg-[#1a1c22]/50 border-[#8c5cff]/10'
                      : 'bg-gray-50 border-purple-100'
                  } transition-all`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {meses[cuota.mes - 1]} {cuota.ano}
                        </h3>
                        {getStatusIcon(cuota.estado)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>Monto</p>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            CLP ${Number(cuota.monto).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div>
                          <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>Pagado</p>
                          <p className={`font-semibold text-green-500`}>
                            {formatFecha(cuota.fecha_pago || cuota.fecha_creacion)}
                          </p>
                        </div>
                        <div>
                          <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>Vencimiento</p>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatFecha(cuota.fecha_vencimiento)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Modal de Pago */}
      {selectedCuota && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedCuota(null);
          }}
          cuota={selectedCuota}
          onSuccess={() => {
            setShowPaymentModal(false);
            setSelectedCuota(null);
            onRefresh();
          }}
        />
      )}
    </motion.div>
  );
};

export default NutricionistaCuotasTable;
