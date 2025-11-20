import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';

const POSICIONES_JUEGO = [
  'Portero',
  'Defensa Central',
  'defensa lateral',
  'Volante Defensivo',
  'Volante ofensivo',
  'Volante mixto',
  'delantero centro',
  'delantero extremo'
];

const GestionPacientes = ({ isDarkMode }) => {
  const { token } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosicion, setSelectedPosicion] = useState('todas');
  const [showModal, setShowModal] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    posicion_juego: ''
  });

  const cargarPacientes = useCallback(async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const params = {};

      if (selectedPosicion !== 'todas') {
        params.posicion = selectedPosicion;
      }

      const response = await axios.get(API_ENDPOINTS.PACIENTES.GET_ALL, {
        headers: config.headers,
        params
      });

      setPacientes(response.data.pacientes);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      toast.error('Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  }, [token, selectedPosicion]);

  // Cargar pacientes
  useEffect(() => {
    if (token) {
      cargarPacientes();
    }
  }, [cargarPacientes, token]);

  const handleOpenModal = (paciente = null) => {
    if (paciente) {
      setEditingPaciente(paciente);
      setFormData(paciente);
    } else {
      setEditingPaciente(null);
      setFormData({
        nombre: '',
        apellido: '',
        cedula: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        posicion_juego: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPaciente(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingPaciente) {
        // Actualizar
        await axios.put(
          API_ENDPOINTS.PACIENTES.UPDATE(editingPaciente.id),
          formData,
          config
        );
        toast.success('Paciente actualizado exitosamente');
      } else {
        // Crear
        await axios.post(
          API_ENDPOINTS.PACIENTES.GET_ALL,
          formData,
          config
        );
        toast.success('Paciente creado exitosamente');
      }

      handleCloseModal();
      cargarPacientes();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar paciente');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(API_ENDPOINTS.PACIENTES.DELETE(id), config);
      toast.success('Paciente eliminado');
      cargarPacientes();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar paciente');
    }
  };

  const pacientesFiltrados = pacientes.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.cedula && p.cedula.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Gestión de Pacientes/Jugadores
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8c5cff] text-white font-semibold hover:bg-[#7a4cde] transition-colors"
        >
          <Plus size={20} />
          Nuevo Paciente
        </motion.button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Búsqueda */}
        <div className={`relative rounded-lg border ${
          isDarkMode
            ? 'bg-[#0f1117] border-[#8c5cff]/20'
            : 'bg-white border-purple-200'
        }`}>
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border-0 outline-none ${
              isDarkMode
                ? 'bg-[#0f1117] text-white placeholder-gray-500'
                : 'bg-white text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        {/* Filtro de posición */}
        <select
          value={selectedPosicion}
          onChange={(e) => setSelectedPosicion(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
              : 'bg-white border-purple-200 text-gray-900'
          }`}
        >
          <option value="todas">Todas las posiciones</option>
          {POSICIONES_JUEGO.map(pos => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </select>
      </div>

      {/* Tabla de pacientes */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin">
            <div className="w-8 h-8 border-4 border-[#8c5cff] border-t-transparent rounded-full"></div>
          </div>
        </div>
      ) : pacientesFiltrados.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
          isDarkMode
            ? 'border-[#8c5cff]/20 bg-[#0f1117]'
            : 'border-purple-200 bg-purple-50'
        }`}>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No hay pacientes registrados
          </p>
        </div>
      ) : (
        <div className={`rounded-lg border overflow-hidden ${
          isDarkMode
            ? 'border-[#8c5cff]/20 bg-[#0f1117]'
            : 'border-purple-200 bg-white'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-[#161b22]' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Nombre
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Cédula
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Posición
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Plantel
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Categoría
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Liga
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{
                borderColor: isDarkMode ? 'rgba(140, 92, 255, 0.1)' : 'rgba(168, 85, 247, 0.1)'
              }}>
                {pacientesFiltrados.map(paciente => (
                  <tr key={paciente.id} className={isDarkMode ? 'hover:bg-[#161b22]' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {paciente.nombre} {paciente.apellido || ''}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {paciente.cedula || '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm`}>
                      {paciente.posicion_juego ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          paciente.posicion_juego === 'Portero'
                            ? isDarkMode ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                            : paciente.posicion_juego.includes('Defensa')
                            ? isDarkMode ? 'bg-green-500/30 text-green-300' : 'bg-green-100 text-green-800'
                            : paciente.posicion_juego.includes('Volante')
                            ? isDarkMode ? 'bg-yellow-500/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                            : isDarkMode ? 'bg-red-500/30 text-red-300' : 'bg-red-100 text-red-800'
                        }`}>
                          {paciente.posicion_juego}
                        </span>
                      ) : (
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>-</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {paciente.plantel_nombre || '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {paciente.categoria_nombre || '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {paciente.liga_nombre || '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm`}>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenModal(paciente)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-[#8c5cff]/20 text-[#8c5cff]'
                              : 'hover:bg-purple-100 text-purple-600'
                          }`}
                        >
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEliminar(paciente.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-red-500/20 text-red-400'
                              : 'hover:bg-red-100 text-red-600'
                          }`}
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-xl shadow-2xl p-6 ${
                isDarkMode
                  ? 'bg-[#0f1117] border border-[#8c5cff]/20'
                  : 'bg-white border border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className={`p-1 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-[#8c5cff]/20 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 rounded-lg border outline-none ${
                        isDarkMode
                          ? 'bg-[#161b22] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-purple-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border outline-none ${
                        isDarkMode
                          ? 'bg-[#161b22] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-purple-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cédula
                  </label>
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border outline-none ${
                      isDarkMode
                        ? 'bg-[#161b22] border-[#8c5cff]/20 text-white'
                        : 'bg-white border-purple-200 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento ? formData.fecha_nacimiento.split('T')[0] : ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border outline-none ${
                      isDarkMode
                        ? 'bg-[#161b22] border-[#8c5cff]/20 text-white'
                        : 'bg-white border-purple-200 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Posición de Juego
                  </label>
                  <select
                    name="posicion_juego"
                    value={formData.posicion_juego}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border outline-none ${
                      isDarkMode
                        ? 'bg-[#161b22] border-[#8c5cff]/20 text-white'
                        : 'bg-white border-purple-200 text-gray-900'
                    }`}
                  >
                    <option value="">Seleccionar posición...</option>
                    {POSICIONES_JUEGO.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border outline-none ${
                        isDarkMode
                          ? 'bg-[#161b22] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-purple-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Teléfono
                    </label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border outline-none ${
                        isDarkMode
                          ? 'bg-[#161b22] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-purple-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      isDarkMode
                        ? 'bg-[#161b22] text-gray-300 hover:bg-[#1c2128]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg font-semibold bg-[#8c5cff] text-white hover:bg-[#7a4cde] transition-colors"
                  >
                    {editingPaciente ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestionPacientes;
