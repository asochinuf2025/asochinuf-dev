import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';
import PaymentModal from './PaymentModal';

const MyQuotasSection = ({ containerVariants }) => {
  const { isDarkMode, token, usuario } = useAuth();
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cuotaPagando, setCuotaPagando] = useState(null);
  const isAdmin = usuario?.tipo_perfil === 'admin';

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Cargar cuotas del usuario actual
  useEffect(() => {
    if (usuario?.id) {
      cargarCuotas();
    }
  }, [token, usuario?.id]);

  const cargarCuotas = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Cargar cuotas del usuario actual
      const response = await axios.get(API_ENDPOINTS.CUOTAS.GET_ALL, config);

      // Filtrar solo las cuotas del usuario actual
      if (isAdmin) {
        const cuotasUsuarioActual = response.data.filter(c => c.usuario_id === usuario.id);
        setCuotas(cuotasUsuarioActual);
      } else {
        setCuotas(response.data);
      }
    } catch (err) {
      console.error('Error al cargar cuotas:', err);
      toast.error('Error al cargar las cuotas');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pagado':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'pendiente':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'vencido':
        return 'bg-red-500/10 text-red-600 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getEstadoLabel = (estado) => {
    switch(estado) {
      case 'pagado':
        return 'Pagada';
      case 'pendiente':
        return 'Pendiente';
      case 'vencido':
        return 'Vencida';
      default:
        return estado;
    }
  };

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'pagado':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'vencido':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'pendiente':
        return <Clock size={20} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  const handlePagarClick = (cuota) => {
    setCuotaPagando(cuota);
    setShowPaymentModal(true);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="space-y-6"
    >
      {loading ? (
        <div className={`flex justify-center items-center py-12 ${isDarkMode ? 'bg-[#1a1c22]' : 'bg-white'} rounded-xl`}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8c5cff]"></div>
        </div>
      ) : (
        <>
          {/* Tabla de Mis Cuotas */}
          {cuotas.length === 0 ? (
            <div className={`p-8 rounded-xl border-2 border-dashed text-center ${
              isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-gray-400' : 'bg-purple-50 border-purple-200 text-gray-600'
            }`}>
              <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>No tienes cuotas asignadas</p>
            </div>
          ) : (
            <div className={`overflow-x-auto rounded-xl border ${
              isDarkMode
                ? 'bg-[#1a1c22] border-[#8c5cff]/20'
                : 'bg-white border-purple-200'
            }`}>
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${
                    isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
                  }`}>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300 bg-[#0f1117]' : 'text-gray-700 bg-purple-50'
                    }`}>
                      Período
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300 bg-[#0f1117]' : 'text-gray-700 bg-purple-50'
                    }`}>
                      Monto
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300 bg-[#0f1117]' : 'text-gray-700 bg-purple-50'
                    }`}>
                      Vencimiento
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300 bg-[#0f1117]' : 'text-gray-700 bg-purple-50'
                    }`}>
                      Estado
                    </th>
                    <th className={`px-6 py-4 text-center text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300 bg-[#0f1117]' : 'text-gray-700 bg-purple-50'
                    }`}>
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cuotas.map((cuota, idx) => (
                    <tr
                      key={cuota.id}
                      className={`border-b ${
                        idx % 2 === 0
                          ? isDarkMode
                            ? 'bg-[#1a1c22]'
                            : 'bg-white'
                          : isDarkMode
                          ? 'bg-[#0f1117]'
                          : 'bg-purple-50/30'
                      } ${isDarkMode ? 'border-[#8c5cff]/10' : 'border-purple-100'} hover:bg-opacity-75 transition-colors`}
                    >
                      <td className={`px-6 py-4 text-sm font-medium ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {meses[cuota.mes - 1]} {cuota.ano}
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${
                        isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'
                      }`}>
                        CLP ${Number(cuota.monto).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className={`px-6 py-4 text-sm`}>
                        <div className="flex flex-col gap-1">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            {formatFecha(cuota.fecha_vencimiento)}
                          </span>
                          {cuota.estado === 'vencido' && (
                            <span className="text-xs font-semibold text-red-500">
                              ⚠ Vencida
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm`}>
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(cuota.estado)}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(cuota.estado)}`}>
                            {getEstadoLabel(cuota.estado)}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm text-center`}>
                        {cuota.estado !== 'pagado' ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePagarClick(cuota)}
                            className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                              isDarkMode
                                ? 'bg-[#8c5cff] hover:bg-[#7a4cde]'
                                : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                          >
                            Pagar
                          </motion.button>
                        ) : (
                          <span className="text-green-600 font-semibold">✓ Pagada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Payment Modal (para usuarios) */}
      <PaymentModal
        isOpen={showPaymentModal}
        cuota={cuotaPagando}
        onClose={() => {
          setShowPaymentModal(false);
          setCuotaPagando(null);
        }}
        onSuccess={() => {
          setShowPaymentModal(false);
          setCuotaPagando(null);
          cargarCuotas();
        }}
      />
    </motion.div>
  );
};

export default MyQuotasSection;
