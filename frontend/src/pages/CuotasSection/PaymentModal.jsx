import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';

const PaymentModal = ({ isOpen, onClose, cuota, onSuccess }) => {
  const { isDarkMode, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentStep, setPaymentStep] = useState('method'); // 'method' | 'processing' | 'success'
  const [metodoPago, setMetodoPago] = useState('mercado_pago');
  const [referencia, setReferencia] = useState('');

  // Inicializar Mercado Pago cuando el componente monta
  useEffect(() => {
    if (isOpen && window.MercadoPago && !window.mp) {
      // Obtener Public Key desde el backend
      axios.get('/api/payments/public-key')
        .then(response => {
          const publicKey = response.data.public_key;
          window.mp = new window.MercadoPago(publicKey, {
            locale: 'es-CL'
          });
          console.log('✅ Mercado Pago inicializado correctamente con Public Key desde el backend');
        })
        .catch(err => {
          console.error('❌ Error al obtener Public Key:', err);
          setError('Error al cargar Mercado Pago. Por favor, intenta de nuevo.');
        });
    }
  }, [isOpen]);

  // Resetear el estado cuando el modal se abre o cierra
  useEffect(() => {
    if (isOpen) {
      setPaymentStep('method');
      setError('');
      setSuccess(false);
      setReferencia('');
      setMetodoPago('mercado_pago');
    }
  }, [isOpen]);

  const handleInitiateMercadoPago = async () => {
    try {
      setSubmitting(true);
      setError('');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.post(API_ENDPOINTS.PAYMENTS.INICIAR_PAGO, {
        cuotaUsuarioId: cuota.cuota_usuario_id,
        montoPagado: cuota.monto,
        metodoPago: 'mercado_pago'
      }, config);

      // Redirigir a Mercado Pago
      // En producción usar init_point, en desarrollo sandbox_init_point
      const isProduction = process.env.NODE_ENV === 'production';
      const checkoutUrl = isProduction
        ? response.data.data.init_point
        : (response.data.data.sandbox_init_point || response.data.data.init_point);

      if (!checkoutUrl) {
        setError('No se pudo obtener la URL de pago de Mercado Pago');
        return;
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Error al iniciar pago:', err);
      setError(err.response?.data?.error || 'Error al iniciar pago');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualPayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!referencia) {
      setError('Por favor ingresa una referencia de pago');
      return;
    }

    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Usar cuota_usuario_id para registrar el pago
      await axios.post(`${API_ENDPOINTS.CUOTAS.GET_ALL}/${cuota.cuota_usuario_id}/pagos`, {
        cuotaUsuarioId: cuota.cuota_usuario_id,
        montoPagado: cuota.monto,
        metodoPago: metodoPago,
        referenciaPago: referencia
      }, config);

      setSuccess(true);
      setPaymentStep('success');
      toast.success('Pago registrado exitosamente');

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setError(err.response?.data?.error || 'Error al registrar pago');
    } finally {
      setSubmitting(false);
    }
  };

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Container centrado - ESTRUCTURA CORRECTA */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-md rounded-2xl shadow-2xl border ${
                isDarkMode
                  ? 'bg-[#1a1c22] border-[#8c5cff]/20'
                  : 'bg-white border-purple-200'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${
                isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
              }`}>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {paymentStep === 'success' ? 'Pago Realizado' : 'Realizar Pago'}
                </h2>
                {paymentStep !== 'processing' && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    type="button"
                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-[#8c5cff]/20' : 'hover:bg-purple-100'}`}
                  >
                    <X size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                  </motion.button>
                )}
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
              {/* Resumen de Cuota */}
              <motion.div
                className={`p-4 rounded-lg border ${
                  isDarkMode
                    ? 'bg-[#0f1117] border-[#8c5cff]/20'
                    : 'bg-purple-50 border-purple-200'
                }`}
              >
                <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Detalle de Cuota
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {meses[cuota.mes - 1]} {cuota.ano}
                    </p>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      CLP ${cuota.monto.toLocaleString('es-CL')}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Vencimiento
                    </p>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {new Date(cuota.fecha_vencimiento).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Mensaje de Éxito */}
              {paymentStep === 'success' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-4 rounded-lg border-l-4 border-green-500 ${
                    isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                        Pago registrado exitosamente
                      </p>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-green-300/80' : 'text-green-600/80'}`}>
                        Tu cuota ha sido marcada como pagada. Redirigiendo...
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
                  className={`p-4 rounded-lg border-l-4 border-red-500 flex gap-3 ${
                    isDarkMode ? 'bg-red-500/10' : 'bg-red-50'
                  }`}
                >
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className={isDarkMode ? 'text-red-400 text-sm' : 'text-red-700 text-sm'}>{error}</p>
                </motion.div>
              )}

              {/* Métodos de Pago */}
              {paymentStep === 'method' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Mercado Pago */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInitiateMercadoPago}
                    disabled={submitting}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      isDarkMode
                        ? 'border-[#8c5cff]/30 hover:border-[#8c5cff] bg-[#8c5cff]/5'
                        : 'border-purple-200 hover:border-purple-400 bg-purple-50'
                    } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-8 rounded flex items-center justify-center font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700`}>
                        MP
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Mercado Pago
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Tarjeta, transferencia o efectivo
                        </p>
                      </div>
                      {submitting && <Loader size={18} className="animate-spin" />}
                    </div>
                  </motion.button>

                  {/* Nota informativa */}
                  <div className={`p-3 rounded-lg border ${
                    isDarkMode ? 'bg-[#0f1117] border-[#8c5cff]/20' : 'bg-purple-50 border-purple-200'
                  }`}>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Para pagos por transferencia bancaria o efectivo, contacta al administrador.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Formulario Pago Manual */}
              {paymentStep === 'manual' && (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleManualPayment}
                  className="space-y-4"
                >
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Método de Pago
                    </label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                          : 'bg-gray-50 border-purple-200 text-gray-900'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    >
                      <option value="transferencia">Transferencia Bancaria</option>
                      <option value="efectivo">Efectivo</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Referencia de Pago
                    </label>
                    <input
                      type="text"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Número de transferencia, comprobante, etc."
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                          : 'bg-gray-50 border-purple-200 text-gray-900'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setPaymentStep('method');
                        setReferencia('');
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg border font-semibold transition-colors ${
                        isDarkMode
                          ? 'border-[#8c5cff]/20 text-gray-300 hover:bg-[#8c5cff]/10'
                          : 'border-purple-200 text-gray-700 hover:bg-purple-50'
                      }`}
                    >
                      Atrás
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting || !referencia}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white ${
                        submitting || !referencia
                          ? 'bg-[#8c5cff]/50 cursor-not-allowed'
                          : 'bg-[#8c5cff] hover:bg-[#7a4cde]'
                      }`}
                    >
                      {submitting ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} />
                          Confirmar Pago
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
