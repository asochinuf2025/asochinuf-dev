import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';

const AdminPaymentModal = ({ isOpen, onClose, cuota, onSuccess }) => {
  const { isDarkMode, token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [metodoPago, setMetodoPago] = useState('transferencia');
  const [referencia, setReferencia] = useState('');

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Resetear el estado cuando el modal se abre o cierra
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess(false);
      setReferencia('');
      setMetodoPago('transferencia');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!referencia.trim()) {
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
        referenciaPago: referencia.trim()
      }, config);

      setSuccess(true);
      toast.success('Pago registrado exitosamente');

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setError(err.response?.data?.error || 'Error al registrar pago');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cuota) return null;

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

          {/* Container centrado */}
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
                  {success ? 'Pago Registrado' : 'Registrar Pago Manual'}
                </h2>
                {!submitting && (
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
                        Usuario
                      </p>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {cuota.nombre} {cuota.apellido}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Período
                      </p>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {meses[cuota.mes - 1]} {cuota.ano}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Monto
                      </p>
                      <p className={`font-semibold text-[#8c5cff]`}>
                        CLP ${Number(cuota.monto).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                {success && (
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
                          La cuota ha sido marcada como pagada.
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

                {/* Formulario Pago Manual */}
                {!success && (
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
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
                        Referencia de Pago *
                      </label>
                      <input
                        type="text"
                        value={referencia}
                        onChange={(e) => setReferencia(e.target.value)}
                        placeholder="Número de transferencia, comprobante, etc."
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                            : 'bg-gray-50 border-purple-200 text-gray-900 placeholder-gray-400'
                        } focus:outline-none focus:border-[#8c5cff]`}
                        disabled={submitting}
                      />
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Ej: N° de transferencia, comprobante, o cualquier referencia que identifique el pago
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className={`flex-1 px-4 py-2 rounded-lg border font-semibold transition-colors ${
                          submitting
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        } ${
                          isDarkMode
                            ? 'border-[#8c5cff]/20 text-gray-300 hover:bg-[#8c5cff]/10'
                            : 'border-purple-200 text-gray-700 hover:bg-purple-50'
                        }`}
                      >
                        Cancelar
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={submitting || !referencia.trim()}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white ${
                          submitting || !referencia.trim()
                            ? 'bg-[#8c5cff]/50 cursor-not-allowed'
                            : 'bg-[#8c5cff] hover:bg-[#7a4cde]'
                        }`}
                      >
                        {submitting ? (
                          <>
                            <Loader size={18} className="animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          <>
                            <CreditCard size={18} />
                            Registrar Pago
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

export default AdminPaymentModal;
