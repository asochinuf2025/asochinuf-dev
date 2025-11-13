import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';

const UsuarioModal = ({ isOpen, isEditing, formData, setFormData, onSubmit, onCancel, error, setError }) => {
  const { isDarkMode, token } = useAuth();
  const [cuotas, setCuotas] = useState([]);
  const [cargandoCuotas, setCargandoCuotas] = useState(false);

  // Cargar cuotas disponibles cuando se abre el modal
  useEffect(() => {
    if (isOpen && (formData.tipo_perfil === 'nutricionista' || formData.tipo_perfil === 'admin')) {
      cargarCuotas();
    }
  }, [isOpen, formData.tipo_perfil]);

  const cargarCuotas = async () => {
    try {
      setCargandoCuotas(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.CUOTAS.GET_DISPONIBLES, config);
      const data = Array.isArray(response.data) ? response.data : [];
      setCuotas(data);
      console.log('✅ Cuotas cargadas:', data);
    } catch (err) {
      console.error('❌ Error al cargar cuotas:', err);
      console.error('Response error:', err.response?.data);
      console.error('Status:', err.response?.status);
      setCuotas([]);
      const errorMsg = err.response?.data?.error || err.message || 'No se pudieron cargar las cuotas';
      setError(errorMsg);
    } finally {
      setCargandoCuotas(false);
    }
  };

  const toggleCuota = (cuotaId) => {
    const cuotasActuales = formData.cuotasSeleccionadas || [];
    const nuevosCuotas = cuotasActuales.includes(cuotaId)
      ? cuotasActuales.filter(id => id !== cuotaId)
      : [...cuotasActuales, cuotaId];

    setFormData({ ...formData, cuotasSeleccionadas: nuevosCuotas });
  };

  const seleccionarTodas = () => {
    setFormData({ ...formData, cuotasSeleccionadas: cuotas.map(c => c.id) });
  };

  const deseleccionarTodas = () => {
    setFormData({ ...formData, cuotasSeleccionadas: [] });
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15 },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
                isDarkMode
                  ? 'bg-[#1a1c22] border border-[#8c5cff]/20'
                  : 'bg-white border border-purple-200'
              }`}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between p-6 border-b ${
                  isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
                }`}
              >
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h2>
                <button
                  onClick={onCancel}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
                  }`}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mx-6 mt-4 bg-red-500/20 border border-red-500 text-red-600 p-3 rounded-lg flex items-center justify-between"
                  >
                    <span>{error}</span>
                    <button onClick={() => setError('')}>
                      <X size={18} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={onSubmit} className="p-6 space-y-4">
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombre *
                    </label>
                    <input
                      type="text"
                      placeholder="Ingrese el nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                          : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Apellido *
                    </label>
                    <input
                      type="text"
                      placeholder="Ingrese el apellido"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      required
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                          : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email {isEditing && '(no editable)'} *
                  </label>
                  <input
                    type="email"
                    placeholder="Ingrese el email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isEditing}
                    autoComplete="off"
                    className={`w-full px-4 py-2 rounded-lg border transition-all ${
                      isDarkMode
                        ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500 disabled:opacity-50'
                        : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400 disabled:opacity-50'
                    } focus:outline-none focus:border-[#8c5cff]`}
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Contraseña {isEditing && '(dejar en blanco para no cambiar)'} {!isEditing && '*'}
                  </label>
                  <input
                    type="password"
                    placeholder={isEditing ? 'Ingrese nueva contraseña' : 'Ingrese la contraseña'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!isEditing}
                    autoComplete="new-password"
                    className={`w-full px-4 py-2 rounded-lg border transition-all ${
                      isDarkMode
                        ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                        : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:border-[#8c5cff]`}
                  />
                </div>

                {/* Tipo de Perfil */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Perfil *
                  </label>
                  <select
                    value={formData.tipo_perfil}
                    onChange={(e) => setFormData({ ...formData, tipo_perfil: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border transition-all ${
                      isDarkMode
                        ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                        : 'bg-white border-purple-200 text-gray-900'
                    } focus:outline-none focus:border-[#8c5cff]`}
                  >
                    <option value="cliente">Cliente</option>
                    <option value="nutricionista">Nutricionista</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {/* Selección de Cuotas - Solo para nutricionista/admin */}
                {(formData.tipo_perfil === 'nutricionista' || formData.tipo_perfil === 'admin') && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#0f1117]/50 border-[#8c5cff]/20'
                        : 'bg-purple-50 border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Asignar Cuotas
                      </label>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={seleccionarTodas}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isDarkMode
                              ? 'bg-[#8c5cff]/20 text-[#8c5cff] hover:bg-[#8c5cff]/30'
                              : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                          }`}
                        >
                          Seleccionar Todas
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={deseleccionarTodas}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isDarkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          Deseleccionar Todas
                        </motion.button>
                      </div>
                    </div>

                    {cargandoCuotas ? (
                      <div className={`text-center py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Cargando cuotas...
                      </div>
                    ) : cuotas.length === 0 ? (
                      <div className={`text-center py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No hay cuotas disponibles
                      </div>
                    ) : (
                      <div className={`max-h-48 overflow-y-auto space-y-2 ${isDarkMode ? 'scrollbar-dark' : ''}`}>
                        {cuotas.map((cuota) => (
                          <label
                            key={cuota.id}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                              isDarkMode
                                ? 'hover:bg-[#8c5cff]/10'
                                : 'hover:bg-purple-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={(formData.cuotasSeleccionadas || []).includes(cuota.id)}
                              onChange={() => toggleCuota(cuota.id)}
                              className="w-4 h-4 rounded"
                            />
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][cuota.mes - 1]} {cuota.ano}
                              <span className={`ml-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                CLP ${cuota.monto.toLocaleString('es-CL')}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all flex-1 ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white hover:shadow-lg'
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg'
                    }`}
                  >
                    <Check size={20} />
                    {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={onCancel}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all flex-1 ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <X size={20} />
                    Cancelar
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UsuarioModal;
