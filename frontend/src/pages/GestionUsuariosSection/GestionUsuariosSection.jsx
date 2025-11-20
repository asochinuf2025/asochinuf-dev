import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import UsuarioModal from './UsuarioModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import GestionPacientes from './GestionPacientes';
import { API_ENDPOINTS } from '../../config/apiConfig';

const GestionUsuariosSection = ({ containerVariants }) => {
  const { isDarkMode, token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('usuarios');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    tipo_perfil: 'cliente',
    cuotasSeleccionadas: [],
  });

  const API_BASE = API_ENDPOINTS.AUTH.LOGIN.substring(0, API_ENDPOINTS.AUTH.LOGIN.lastIndexOf('/'));

  // Obtener usuarios
  const obtenerUsuarios = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_BASE}/usuarios`, config);
      setUsuarios(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // Crear usuario
  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_BASE}/usuarios`, formData, config);
      setUsuarios([response.data.usuario, ...usuarios]);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        tipo_perfil: 'cliente',
        cuotasSeleccionadas: [],
      });
      setShowModal(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear usuario');
    }
  };

  // Actualizar usuario
  const handleActualizarUsuario = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const dataToSend = { ...formData };
      if (!dataToSend.password) delete dataToSend.password;

      const response = await axios.put(
        `${API_BASE}/usuarios/${editingId}`,
        dataToSend,
        config
      );

      setUsuarios(
        usuarios.map((u) => (u.id === editingId ? response.data.usuario : u))
      );
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        tipo_perfil: 'cliente',
        cuotasSeleccionadas: [],
      });
      setEditingId(null);
      setShowModal(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar usuario');
    }
  };

  // Abrir dialog de confirmación para eliminar
  const handleAbrirConfirmDialog = (usuario) => {
    setUsuarioAEliminar(usuario);
    setShowConfirmDialog(true);
  };

  // Confirmar eliminación de usuario
  const handleConfirmarEliminar = async () => {
    if (!usuarioAEliminar) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/usuarios/${usuarioAEliminar.id}`, config);
      setUsuarios(usuarios.filter((u) => u.id !== usuarioAEliminar.id));
      setShowConfirmDialog(false);
      setUsuarioAEliminar(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar usuario');
      setShowConfirmDialog(false);
      setUsuarioAEliminar(null);
    }
  };

  // Editar usuario
  const handleEditarUsuario = (usuario) => {
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      password: '',
      tipo_perfil: usuario.tipo_perfil,
      cuotasSeleccionadas: [],
    });
    setEditingId(usuario.id);
    setShowModal(true);
  };

  // Abrir modal para crear nuevo usuario
  const handleAbrirModalNuevo = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      tipo_perfil: 'cliente',
      cuotasSeleccionadas: [],
    });
    setEditingId(null);
    setShowModal(true);
  };

  // Cerrar modal
  const handleCerrarModal = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      tipo_perfil: 'cliente',
      cuotasSeleccionadas: [],
    });
    setEditingId(null);
    setShowModal(false);
    setError('');
  };

  // Filtrar usuarios por nombre/apellido
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      usuario.nombre.toLowerCase().includes(searchLower) ||
      usuario.apellido.toLowerCase().includes(searchLower) ||
      usuario.email.toLowerCase().includes(searchLower)
    );
  });

  const containerVariantsLocal = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      variants={containerVariantsLocal}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Administración
          </h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {activeTab === 'usuarios' ? `Total de usuarios: ${usuarios.length} • Mostrando: ${usuariosFiltrados.length}` : 'Gestión de pacientes y jugadores'}
          </p>
        </div>
        {activeTab === 'usuarios' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAbrirModalNuevo}
            disabled={showModal}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              showModal
                ? 'bg-gray-400 cursor-not-allowed'
                : isDarkMode
                ? 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white hover:shadow-lg hover:shadow-[#8c5cff]/50'
                : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg'
            }`}
          >
            <Plus size={20} />
            Nuevo Usuario
          </motion.button>
        )}
      </div>

      {/* Tabs */}
      <div className={`flex gap-4 border-b ${
        isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
      }`}>
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`px-4 py-2 font-semibold transition-all border-b-2 ${
            activeTab === 'usuarios'
              ? `border-[#8c5cff] ${isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'}`
              : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          Usuarios
        </button>
        <button
          onClick={() => setActiveTab('pacientes')}
          className={`px-4 py-2 font-semibold transition-all border-b-2 ${
            activeTab === 'pacientes'
              ? `border-[#8c5cff] ${isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'}`
              : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          Pacientes/Jugadores
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'usuarios' && (
        <>
          {/* Search Filter */}
          <div className="relative">
            <Search
              size={20}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-2 rounded-lg border transition-all ${
                isDarkMode
                  ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20 text-white placeholder-gray-500 focus:border-[#8c5cff]/40'
                  : 'bg-white/50 border-purple-200 text-gray-900 placeholder-gray-400 focus:border-purple-400'
              } focus:outline-none`}
            />
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && !showModal && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/20 border border-red-500 text-red-600 p-4 rounded-lg flex items-center justify-between"
              >
                <span>{error}</span>
                <button onClick={() => setError('')}>
                  <X size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal */}
          <UsuarioModal
            isOpen={showModal}
            isEditing={!!editingId}
            formData={formData}
            setFormData={setFormData}
            onSubmit={editingId ? handleActualizarUsuario : handleCrearUsuario}
            onCancel={handleCerrarModal}
            error={error}
            setError={setError}
          />

          {/* Usuarios Table */}
          <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'}`}>
            {loading ? (
              <div
                className={`p-8 text-center ${
                  isDarkMode ? 'bg-[#1a1c22]/50' : 'bg-white/50'
                }`}
              >
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Cargando usuarios...</p>
              </div>
            ) : usuarios.length === 0 ? (
              <div
                className={`p-8 text-center ${
                  isDarkMode ? 'bg-[#1a1c22]/50' : 'bg-white/50'
                }`}
              >
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  No hay usuarios registrados aún. Crea uno para empezar.
                </p>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div
                className={`p-8 text-center ${
                  isDarkMode ? 'bg-[#1a1c22]/50' : 'bg-white/50'
                }`}
              >
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  No hay resultados que coincidan con tu búsqueda.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`${
                        isDarkMode
                          ? 'bg-[#1a1c22]/50 border-b border-[#8c5cff]/20'
                          : 'bg-purple-50 border-b border-purple-200'
                      }`}
                    >
                      <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Nombre
                      </th>
                      <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Email
                      </th>
                      <th className={`px-4 py-3 text-center font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Tipo
                      </th>
                      <th className={`px-4 py-3 text-center font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((usuario) => (
                      <motion.tr
                        key={usuario.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`border-b transition-colors ${
                          isDarkMode
                            ? 'border-[#8c5cff]/10 hover:bg-[#1a1c22]/30'
                            : 'border-purple-100 hover:bg-purple-50/50'
                        }`}
                      >
                        <td className={`px-4 py-3 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {usuario.nombre} {usuario.apellido}
                        </td>
                        <td className={`px-4 py-3 text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {usuario.email}
                        </td>
                        <td className={`px-4 py-3 text-center`}>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-semibold inline-block ${
                              usuario.tipo_perfil === 'admin'
                                ? isDarkMode
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-red-100 text-red-600'
                                : usuario.tipo_perfil === 'nutricionista'
                                ? isDarkMode
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-blue-100 text-blue-600'
                                : isDarkMode
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-purple-100 text-purple-600'
                            }`}
                          >
                            {usuario.tipo_perfil === 'admin'
                              ? 'Admin'
                              : usuario.tipo_perfil === 'nutricionista'
                              ? 'Nutricionista'
                              : 'Cliente'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-center`}>
                          <div className="flex gap-2 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEditarUsuario(usuario)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode ? 'text-blue-400 hover:bg-blue-500/20' : 'text-blue-600 hover:bg-blue-100'
                              }`}
                              title="Editar usuario"
                            >
                              <Edit2 size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAbrirConfirmDialog(usuario)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-100'
                              }`}
                              title="Eliminar usuario"
                            >
                              <Trash2 size={18} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Confirm Delete Dialog */}
          <ConfirmDialog
            isOpen={showConfirmDialog}
            title="Eliminar Usuario"
            message={`¿Está seguro de que desea eliminar a ${usuarioAEliminar?.nombre} ${usuarioAEliminar?.apellido}? Esta acción no se puede deshacer.`}
            onConfirm={handleConfirmarEliminar}
            onCancel={() => {
              setShowConfirmDialog(false);
              setUsuarioAEliminar(null);
            }}
            confirmText="Eliminar"
            cancelText="Cancelar"
            isDanger={true}
          />
        </>
      )}

      {/* Pacientes/Jugadores Tab */}
      {activeTab === 'pacientes' && (
        <GestionPacientes isDarkMode={isDarkMode} />
      )}
    </motion.div>
  );
};

export default GestionUsuariosSection;
