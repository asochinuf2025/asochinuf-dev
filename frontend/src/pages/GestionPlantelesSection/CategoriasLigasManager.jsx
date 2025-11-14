import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  AlertCircle,
  CheckCircle,
  Filter,
  Link2,
  Unlink2,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/apiConfig';
import axios from 'axios';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ConfirmDialog';

const CategoriasLigasManager = ({ isDarkMode, containerVariants }) => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('categorias'); // categorias o ligas
  const [categorias, setCategorias] = useState([]);
  const [ligas, setLigas] = useState([]);
  const [planteles, setPlanteles] = useState([]);
  const [categoriasConConteo, setCategoriasConConteo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // edit-categoria, edit-liga, assign-planteles
  const [formData, setFormData] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, data: null });

  // Cargar datos iniciales
  useEffect(() => {
    cargarCategorias();
    cargarLigas();
    cargarPlanteles();
  }, [token]);

  const cargarCategorias = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.LIGAS.BASE + '/categorias/todas', config);
      setCategorias(response.data);
      // Cargar también el conteo
      cargarConteoPlantelPorCategoria();
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      toast.error('Error al cargar categorías');
    }
  };

  const cargarConteoPlantelPorCategoria = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.LIGAS.BASE + '/categorias/conteo/planteles', config);
      setCategoriasConConteo(response.data);
    } catch (err) {
      console.error('Error al cargar conteo:', err);
    }
  };

  const cargarLigas = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.LIGAS.GET_ALL, config);
      setLigas(response.data);
    } catch (err) {
      console.error('Error al cargar ligas:', err);
      toast.error('Error al cargar ligas');
    }
  };

  const cargarPlanteles = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.PLANTELES.GET_ALL, config);
      setPlanteles(response.data);
    } catch (err) {
      console.error('Error al cargar planteles:', err);
    }
  };

  // ========== CATEGORÍAS ==========

  const handleEditCategoria = (categoria) => {
    setModalType('edit-categoria');
    setFormData({
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      orden: categoria.orden
    });
    setShowModal(true);
  };

  const handleDeleteCategoria = (categoria) => {
    setConfirmDialog({
      visible: true,
      data: categoria,
      title: 'Eliminar Categoría',
      message: `¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`,
      onConfirm: async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.delete(`${API_ENDPOINTS.LIGAS.BASE}/categorias/${categoria.id}`, config);
          toast.success('Categoría eliminada correctamente');
          cargarCategorias();
          setConfirmDialog({ visible: false, data: null });
        } catch (err) {
          toast.error('No se pudo eliminar la categoría');
        }
      }
    });
  };

  const handleAssignPlanteles = (categoria) => {
    setSelectedCategoria(categoria);
    setModalType('assign-planteles');
    setShowModal(true);
    // Cargar planteles asignados a esta categoría
    cargarPlantelesAsignados(categoria.id);
  };

  const cargarPlantelesAsignados = async (categoriaId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        `${API_ENDPOINTS.LIGAS.BASE}/plantel/categoria/${categoriaId}/asignados`,
        config
      );
      setFormData(prev => ({
        ...prev,
        plantelesAsignados: response.data.map(p => p.plantel_id)
      }));
    } catch (err) {
      console.error('Error al cargar planteles asignados:', err);
    }
  };

  // ========== LIGAS ==========

  const handleEditLiga = (liga) => {
    setModalType('edit-liga');
    setFormData({
      id: liga.id,
      nombre: liga.nombre,
      categoria_id: liga.categoria_id,
      descripcion: liga.descripcion,
      orden: liga.orden
    });
    setShowModal(true);
  };

  const handleDeleteLiga = (liga) => {
    setConfirmDialog({
      visible: true,
      data: liga,
      title: 'Eliminar Liga',
      message: `¿Estás seguro de eliminar la liga "${liga.nombre}"?`,
      onConfirm: async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.delete(`${API_ENDPOINTS.LIGAS.DELETE(liga.id)}`, config);
          toast.success('Liga eliminada correctamente');
          cargarLigas();
          setConfirmDialog({ visible: false, data: null });
        } catch (err) {
          toast.error('No se pudo eliminar la liga');
        }
      }
    });
  };

  // ========== MODAL ACTIONS ==========

  const handleSaveCategoria = async () => {
    if (!formData.nombre) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (formData.id) {
        // Editar
        await axios.put(
          `${API_ENDPOINTS.LIGAS.BASE}/categorias/${formData.id}`,
          formData,
          config
        );
        toast.success('Categoría actualizada correctamente');
      } else {
        // Crear
        await axios.post(API_ENDPOINTS.LIGAS.BASE + '/categorias', formData, config);
        toast.success('Categoría creada correctamente');
      }
      cargarCategorias();
      setShowModal(false);
      setFormData({});
    } catch (err) {
      toast.error('Error al guardar categoría');
    }
  };

  const handleSaveLiga = async () => {
    if (!formData.nombre || !formData.categoria_id) {
      toast.error('Nombre y categoría son requeridos');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (formData.id) {
        // Editar
        await axios.put(`${API_ENDPOINTS.LIGAS.UPDATE(formData.id)}`, formData, config);
        toast.success('Liga actualizada correctamente');
      } else {
        // Crear
        await axios.post(API_ENDPOINTS.LIGAS.CREATE, formData, config);
        toast.success('Liga creada correctamente');
      }
      cargarLigas();
      setShowModal(false);
      setFormData({});
    } catch (err) {
      toast.error('Error al guardar liga');
    }
  };

  const handleSavePlantelesAsignados = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Obtener planteles asignados actuales
      const currentResponse = await axios.get(
        `${API_ENDPOINTS.LIGAS.BASE}/plantel/categoria/${selectedCategoria.id}/asignados`,
        config
      );
      const currentIds = new Set(currentResponse.data.map(p => p.plantel_id));
      const newIds = new Set(formData.plantelesAsignados || []);

      // Desasignar planteles que se deseleccionaron
      for (const id of currentIds) {
        if (!newIds.has(id)) {
          await axios.delete(
            `${API_ENDPOINTS.LIGAS.BASE}/plantel/${id}/categoria/${selectedCategoria.id}`,
            config
          );
        }
      }

      // Asignar nuevos planteles
      for (const id of newIds) {
        if (!currentIds.has(id)) {
          await axios.post(
            `${API_ENDPOINTS.LIGAS.BASE}/plantel/categoria/asignar`,
            { plantel_id: id, categoria_id: selectedCategoria.id },
            config
          );
        }
      }

      toast.success('Asignaciones actualizadas correctamente');
      setShowModal(false);
      setFormData({});
      cargarPlanteles();
      cargarConteoPlantelPorCategoria(); // Recargar el conteo
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al guardar asignaciones');
    }
  };

  // ========== RENDER ==========

  const filteredCategorias = categorias.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLigas = ligas.filter(l =>
    l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedCategoria || l.categoria_id === selectedCategoria.id)
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestor de Categorías y Ligas
          </h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Administra las categorías, ligas y sus asignaciones a planteles
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 p-2 rounded-lg border ${
        isDarkMode
          ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20'
          : 'bg-white/50 border-purple-200'
      }`}>
        <button
          onClick={() => {
            setActiveTab('categorias');
            setSearchTerm('');
            setSelectedCategoria(null);
          }}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'categorias'
              ? isDarkMode
                ? 'bg-[#8c5cff] text-white'
                : 'bg-purple-500 text-white'
              : isDarkMode
              ? 'text-gray-400 hover:text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Categorías
        </button>
        <button
          onClick={() => {
            setActiveTab('ligas');
            setSearchTerm('');
          }}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'ligas'
              ? isDarkMode
                ? 'bg-[#8c5cff] text-white'
                : 'bg-purple-500 text-white'
              : isDarkMode
              ? 'text-gray-400 hover:text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Ligas
        </button>
      </div>

      {/* Pestaña Categorías */}
      {activeTab === 'categorias' && (
        <motion.div
          key="categorias"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20'
                : 'bg-white/50 border-purple-200'
            }`}>
              <Search size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
              <input
                type="text"
                placeholder="Buscar categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${
                  isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setModalType('edit-categoria');
                setFormData({});
                setShowModal(true);
              }}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                isDarkMode
                  ? 'bg-[#8c5cff] text-white hover:bg-[#6a3dcf]'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              <Plus size={20} /> Nueva Categoría
            </motion.button>
          </div>

          {/* Tabla de Categorías */}
          <div className={`rounded-lg border overflow-hidden ${
            isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
          }`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={isDarkMode
                  ? 'bg-[#1a1c22]/50 border-b border-[#8c5cff]/20'
                  : 'bg-purple-50 border-b border-purple-200'
                }>
                  <th className={`px-4 py-3 text-left font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Nombre</th>
                  <th className={`px-4 py-3 text-left font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Descripción</th>
                  <th className={`px-4 py-3 text-center font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Orden</th>
                  <th className={`px-4 py-3 text-center font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Planteles</th>
                  <th className={`px-4 py-3 text-right font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategorias.map((cat) => (
                  <motion.tr
                    key={cat.id}
                    className={`border-b transition-colors ${
                      isDarkMode
                        ? 'border-[#8c5cff]/10 hover:bg-[#1a1c22]/30'
                        : 'border-purple-100 hover:bg-purple-50/50'
                    }`}
                  >
                    <td className={`px-4 py-3 font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{cat.nombre}</td>
                    <td className={`px-4 py-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{cat.descripcion || '-'}</td>
                    <td className={`px-4 py-3 text-center ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{cat.orden || '-'}</td>
                    <td className={`px-4 py-3 text-center font-semibold ${
                      isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'
                    }`}>
                      {/* Contar planteles asignados */}
                      {categoriasConConteo.find(cc => cc.id === cat.id)?.planteles_count || 0}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAssignPlanteles(cat)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                          isDarkMode
                            ? 'text-green-400 hover:bg-green-500/20'
                            : 'text-green-600 hover:bg-green-100'
                        }`}
                        title="Asignar planteles"
                      >
                        <Link2 size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditCategoria(cat)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                          isDarkMode
                            ? 'text-blue-400 hover:bg-blue-500/20'
                            : 'text-blue-600 hover:bg-blue-100'
                        }`}
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteCategoria(cat)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                          isDarkMode
                            ? 'text-red-400 hover:bg-red-500/20'
                            : 'text-red-600 hover:bg-red-100'
                        }`}
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Pestaña Ligas */}
      {activeTab === 'ligas' && (
        <motion.div
          key="ligas"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          <div className="space-y-3">
            {/* Filtro por categoría */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode
                ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20'
                : 'bg-white/50 border-purple-200'
            }`}>
              <label className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Filtrar por categoría:</label>
              <select
                value={selectedCategoria?.id || ''}
                onChange={(e) => {
                  const cat = categorias.find(c => c.id === parseInt(e.target.value));
                  setSelectedCategoria(cat || null);
                }}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-[#1a1c22] border-[#8c5cff]/30 text-white'
                    : 'bg-white border-purple-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
              >
                <option value="">Mostrar todas las ligas</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            {/* Search y Nueva Liga */}
            <div className="flex items-center gap-3">
              <div className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20'
                  : 'bg-white/50 border-purple-200'
              }`}>
                <Search size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                <input
                  type="text"
                  placeholder="Buscar liga..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 bg-transparent outline-none ${
                    isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setModalType('edit-liga');
                  setFormData({});
                  setShowModal(true);
                }}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                  isDarkMode
                    ? 'bg-[#8c5cff] text-white hover:bg-[#6a3dcf]'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                <Plus size={20} /> Nueva Liga
              </motion.button>
            </div>
          </div>

          {/* Tabla de Ligas */}
          <div className={`rounded-lg border overflow-hidden ${
            isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
          }`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={isDarkMode
                  ? 'bg-[#1a1c22]/50 border-b border-[#8c5cff]/20'
                  : 'bg-purple-50 border-b border-purple-200'
                }>
                  <th className={`px-4 py-3 text-left font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Nombre</th>
                  <th className={`px-4 py-3 text-left font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Categoría</th>
                  <th className={`px-4 py-3 text-center font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Orden</th>
                  <th className={`px-4 py-3 text-center font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Sesiones</th>
                  <th className={`px-4 py-3 text-right font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredLigas.map((liga) => (
                  <motion.tr
                    key={liga.id}
                    className={`border-b transition-colors ${
                      isDarkMode
                        ? 'border-[#8c5cff]/10 hover:bg-[#1a1c22]/30'
                        : 'border-purple-100 hover:bg-purple-50/50'
                    }`}
                  >
                    <td className={`px-4 py-3 font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{liga.nombre}</td>
                    <td className={`px-4 py-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{categorias.find(c => c.id === liga.categoria_id)?.nombre || '-'}</td>
                    <td className={`px-4 py-3 text-center ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{liga.orden || '-'}</td>
                    <td className={`px-4 py-3 text-center font-semibold ${
                      isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'
                    }`}>
                      0
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditLiga(liga)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                          isDarkMode
                            ? 'text-blue-400 hover:bg-blue-500/20'
                            : 'text-blue-600 hover:bg-blue-100'
                        }`}
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteLiga(liga)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                          isDarkMode
                            ? 'text-red-400 hover:bg-red-500/20'
                            : 'text-red-600 hover:bg-red-100'
                        }`}
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`w-full max-w-md rounded-2xl border p-6 ${
                isDarkMode
                  ? 'bg-[#0f0f12] border-[#8c5cff]/30'
                  : 'bg-white border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {modalType === 'edit-categoria'
                    ? formData.id ? 'Editar Categoría' : 'Nueva Categoría'
                    : modalType === 'edit-liga'
                    ? formData.id ? 'Editar Liga' : 'Nueva Liga'
                    : 'Asignar Planteles'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className={`p-1 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenido del Modal */}
              {modalType === 'edit-categoria' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre de categoría"
                    value={formData.nombre || ''}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#1a1c22] border-[#8c5cff]/30 text-white'
                        : 'bg-white border-purple-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
                  />
                  <textarea
                    placeholder="Descripción (opcional)"
                    value={formData.descripcion || ''}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows="3"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#1a1c22] border-[#8c5cff]/30 text-white'
                        : 'bg-white border-purple-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
                  />
                  <input
                    type="number"
                    placeholder="Orden"
                    value={formData.orden || ''}
                    onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#1a1c22] border-[#8c5cff]/30 text-white'
                        : 'bg-white border-purple-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
                  />
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveCategoria}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white ${
                        isDarkMode
                          ? 'bg-[#8c5cff] hover:bg-[#6a3dcf]'
                          : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'edit-liga' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre de liga"
                    value={formData.nombre || ''}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#1a1c22] border-[#8c5cff]/30 text-white'
                        : 'bg-white border-purple-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
                  />
                  <select
                    value={formData.categoria_id || ''}
                    onChange={(e) => setFormData({ ...formData, categoria_id: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#1a1c22] border-[#8c5cff]/30 text-white'
                        : 'bg-white border-purple-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Descripción (opcional)"
                    value={formData.descripcion || ''}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows="2"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#1a1c22] border-[#8c5cff]/30 text-white'
                        : 'bg-white border-purple-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
                  />
                  <input
                    type="number"
                    placeholder="Orden"
                    value={formData.orden || ''}
                    onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#1a1c22] border-[#8c5cff]/30 text-white'
                        : 'bg-white border-purple-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
                  />
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveLiga}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white ${
                        isDarkMode
                          ? 'bg-[#8c5cff] hover:bg-[#6a3dcf]'
                          : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'assign-planteles' && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {planteles.map(plantel => (
                    <label key={plantel.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.plantelesAsignados || []).includes(plantel.id)}
                        onChange={(e) => {
                          const newIds = e.target.checked
                            ? [...(formData.plantelesAsignados || []), plantel.id]
                            : (formData.plantelesAsignados || []).filter(id => id !== plantel.id);
                          setFormData({ ...formData, plantelesAsignados: newIds });
                        }}
                        className="w-4 h-4"
                      />
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                        {plantel.nombre}
                      </span>
                    </label>
                  ))}
                  <div className="flex gap-3 pt-4 border-t border-[#8c5cff]/20">
                    <button
                      onClick={() => setShowModal(false)}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSavePlantelesAsignados}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white ${
                        isDarkMode
                          ? 'bg-[#8c5cff] hover:bg-[#6a3dcf]'
                          : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      {confirmDialog.visible && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ visible: false, data: null })}
          isDarkMode={isDarkMode}
        />
      )}
    </motion.div>
  );
};

export default CategoriasLigasManager;
