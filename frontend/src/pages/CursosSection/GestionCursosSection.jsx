import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker.css';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Check,
  Power,
  Save,
  Calendar,
  Clock,
  DollarSign,
  Monitor,
  MapPin,
  Globe,
  TrendingUp,
  Users,
  Upload,
  Image
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/apiConfig';
import axios from 'axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import CloudinaryImageCrop from '../../components/CloudinaryImageCrop';
import { toast } from 'sonner';

const GestionCursosSection = ({ containerVariants }) => {
  const { isDarkMode, token, usuario } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [cursoAEliminar, setCursoAEliminar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    codigo_curso: '',
    nombre: '',
    descripcion: '',
    categoria_id: '',
    nivel: 'básico',
    duracion_horas: '',
    modalidad: 'online',
    fecha_inicio: '',
    fecha_fin: '',
    precio: '',
    descuento: '',
    moneda: 'CLP',
    nombre_instructor: '',
    imagen_portada: '',
    video_promocional: '',
    materiales: '',
    url_curso: '',
    estado: 'activo'
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState(null);

  // Verificar que el usuario es admin o nutricionista
  const esAdmin = usuario?.tipo_perfil === 'admin' || usuario?.tipo_perfil === 'nutricionista';

  // Obtener cursos al cargar
  useEffect(() => {
    obtenerCursos();
  }, []);

  const obtenerCursos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_ENDPOINTS.CURSOS.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCursos(response.data);
    } catch (err) {
      console.error('Error al obtener cursos:', err);
      setError('Error al cargar los cursos. Por favor, intenta de nuevo.');
      toast.error('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCurso = async (e) => {
    e.preventDefault();
    if (!esAdmin) {
      toast.error('No tienes permisos para crear cursos');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Send form data directly (imagen_portada will contain Cloudinary URL)
      const response = await axios.post(API_ENDPOINTS.CURSOS.CREATE, formData, config);

      setCursos([response.data.curso, ...cursos]);
      resetForm();
      setShowModal(false);
      toast.success('Curso creado exitosamente');
    } catch (err) {
      console.error('Error al crear curso:', err);
      const errorMsg = err.response?.data?.error || 'Error al crear el curso';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleActualizarCurso = async (e) => {
    e.preventDefault();
    if (!esAdmin) {
      toast.error('No tienes permisos para actualizar cursos');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Send form data directly (imagen_portada will contain Cloudinary URL)
      const response = await axios.put(
        API_ENDPOINTS.CURSOS.UPDATE(editingId),
        formData,
        config
      );

      setCursos(cursos.map(c => c.id_curso === editingId ? response.data.curso : c));
      resetForm();
      setShowModal(false);
      setEditingId(null);
      toast.success('Curso actualizado exitosamente');
    } catch (err) {
      console.error('Error al actualizar curso:', err);
      const errorMsg = err.response?.data?.error || 'Error al actualizar el curso';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAbrirConfirmDialog = (curso) => {
    setCursoAEliminar(curso);
    setShowConfirmDialog(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!cursoAEliminar || !esAdmin) {
      toast.error('No tienes permisos para eliminar cursos');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(API_ENDPOINTS.CURSOS.DELETE(cursoAEliminar.id_curso), config);

      setCursos(cursos.filter(c => c.id_curso !== cursoAEliminar.id_curso));
      setShowConfirmDialog(false);
      setCursoAEliminar(null);
      toast.success('Curso eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar curso:', err);
      const errorMsg = err.response?.data?.error || 'Error al eliminar el curso';
      setError(errorMsg);
      toast.error(errorMsg);
      setShowConfirmDialog(false);
      setCursoAEliminar(null);
    }
  };

  const handleToggleEstado = async (curso) => {
    if (!esAdmin) {
      toast.error('No tienes permisos para cambiar el estado');
      return;
    }

    try {
      const nuevoEstado = curso.estado === 'activo' ? 'inactivo' : 'activo';
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(
        API_ENDPOINTS.CURSOS.UPDATE(curso.id_curso),
        { estado: nuevoEstado },
        config
      );

      setCursos(cursos.map(c => c.id_curso === curso.id_curso ? response.data.curso : c));
      toast.success(`Curso ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      toast.error('Error al cambiar el estado del curso');
    }
  };

  const handleEditarCurso = async (curso) => {
    try {
      // Obtener el curso completo de la API con todos los campos
      const response = await axios.get(API_ENDPOINTS.CURSOS.GET_ONE(curso.id_curso), {
        headers: { Authorization: `Bearer ${token}` }
      });

      const cursoCompleto = response.data;

      setFormData({
        codigo_curso: cursoCompleto.codigo_curso || '',
        nombre: cursoCompleto.nombre || '',
        descripcion: cursoCompleto.descripcion || '',
        categoria_id: cursoCompleto.categoria_id || '',
        nivel: cursoCompleto.nivel || 'básico',
        duracion_horas: cursoCompleto.duracion_horas || '',
        modalidad: cursoCompleto.modalidad || 'online',
        fecha_inicio: cursoCompleto.fecha_inicio ? cursoCompleto.fecha_inicio.split('T')[0] : '',
        fecha_fin: cursoCompleto.fecha_fin ? cursoCompleto.fecha_fin.split('T')[0] : '',
        precio: cursoCompleto.precio || '',
        descuento: cursoCompleto.descuento || '',
        moneda: cursoCompleto.moneda || 'CLP',
        nombre_instructor: cursoCompleto.nombre_instructor || '',
        imagen_portada: cursoCompleto.imagen_portada || '',
        video_promocional: cursoCompleto.video_promocional || '',
        materiales: cursoCompleto.materiales || '',
        url_curso: cursoCompleto.url_curso || '',
        estado: cursoCompleto.estado || 'activo'
      });
      setEditingId(curso.id_curso);
      setShowModal(true);
    } catch (err) {
      console.error('Error al obtener el curso para editar:', err);
      toast.error('Error al cargar los datos del curso');
    }
  };

  const handleAbrirModalNuevo = () => {
    resetForm();
    setEditingId(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      codigo_curso: '',
      nombre: '',
      descripcion: '',
      categoria_id: '',
      nivel: 'básico',
      duracion_horas: '',
      modalidad: 'online',
      fecha_inicio: '',
      fecha_fin: '',
      precio: '',
      descuento: '',
      moneda: 'CLP',
      nombre_instructor: '',
      imagen_portada: '',
      video_promocional: '',
      materiales: '',
      url_curso: '',
      estado: 'activo'
    });
    setImagenFile(null);
    setImagenPreview(null);
    setError('');
  };

  const handleCerrarModal = () => {
    resetForm();
    setEditingId(null);
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (fieldName, date) => {
    if (date) {
      // Convertir Date a formato YYYY-MM-DD para el backend
      const dateString = date.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, [fieldName]: dateString }));
    } else {
      setFormData(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      toast.error('Solo se permiten imágenes (jpg, jpeg, png, webp)');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El tamaño máximo de la imagen es 5MB');
      return;
    }

    // Leer imagen y abrir modal de recorte
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImageForCrop(reader.result);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadComplete = ({ url, publicId }) => {
    console.log('✅ Imagen subida a Cloudinary:', url);
    setImagenPreview(url);
    setFormData(prev => ({ ...prev, imagen_portada: url }));
    setIsCropModalOpen(false);
    setSelectedImageForCrop(null);
    toast.success('Imagen de portada actualizada');
  };

  // Filtrar cursos por nombre o código
  const cursosFiltrados = cursos.filter(curso => {
    const searchLower = searchTerm.toLowerCase();
    return (
      curso.nombre?.toLowerCase().includes(searchLower) ||
      curso.codigo_curso?.toLowerCase().includes(searchLower) ||
      curso.nombre_instructor?.toLowerCase().includes(searchLower)
    );
  });

  const obtenerBadgeNivel = (nivel) => {
    const estilos = {
      'básico': { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Básico' },
      'intermedio': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Intermedio' },
      'avanzado': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Avanzado' }
    };
    return estilos[nivel] || estilos['básico'];
  };

  const obtenerIconoModalidad = (modalidad) => {
    switch (modalidad) {
      case 'online': return <Monitor size={16} />;
      case 'presencial': return <MapPin size={16} />;
      case 'mixto': return <Globe size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  if (!esAdmin) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="min-h-screen"
      >
        <div
          className={`${
            isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
          } border rounded-2xl p-8 text-center`}
        >
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Acceso Denegado
          </h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            No tienes permisos para gestionar cursos.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Action Button */}
      <div className="flex items-center justify-end flex-wrap gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAbrirModalNuevo}
          disabled={showModal}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            showModal
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white hover:shadow-lg hover:shadow-[#8c5cff]/50'
          }`}
        >
          <Plus size={20} />
          Nuevo Curso
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={20}
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        />
        <input
          type="text"
          placeholder="Buscar por nombre, código o instructor..."
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
            className={`${
              isDarkMode ? 'bg-red-500/20 border-red-500' : 'bg-red-50 border-red-400'
            } border p-4 rounded-lg flex items-center justify-between`}
          >
            <span className={isDarkMode ? 'text-red-400' : 'text-red-700'}>{error}</span>
            <button onClick={() => setError('')}>
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cursos List/Table */}
      {loading ? (
        <div
          className={`p-8 text-center rounded-2xl border ${
            isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
          }`}
        >
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 border-4 border-[#8c5cff]/30 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#8c5cff] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Cargando cursos...
          </p>
        </div>
      ) : cursos.length === 0 ? (
        <div
          className={`p-8 text-center rounded-2xl border ${
            isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
          }`}
        >
          <BookOpen size={48} className="mx-auto text-[#8c5cff] mb-4" />
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No hay cursos registrados aún. Crea uno para empezar.
          </p>
        </div>
      ) : cursosFiltrados.length === 0 ? (
        <div
          className={`p-8 text-center rounded-2xl border ${
            isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
          }`}
        >
          <Search size={48} className="mx-auto text-gray-400 mb-4" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            No se encontraron cursos que coincidan con tu búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cursosFiltrados.map((curso) => {
            const badgeNivel = obtenerBadgeNivel(curso.nivel);
            const esActivo = curso.estado === 'activo';

            return (
              <motion.div
                key={curso.id_curso}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${
                  isDarkMode
                    ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20'
                    : 'bg-white border-purple-200'
                } border rounded-xl p-5 hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Info Principal */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {curso.codigo_curso}
                          </span>
                          <span className={`${badgeNivel.bg} ${badgeNivel.text} px-2 py-0.5 rounded-full text-xs font-semibold`}>
                            {badgeNivel.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              esActivo
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {esActivo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {curso.nombre}
                        </h3>
                        <p className={`text-sm mt-1 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {curso.descripcion || 'Sin descripción'}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {curso.duracion_horas && (
                        <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Clock size={14} />
                          <span>{curso.duracion_horas}h</span>
                        </div>
                      )}
                      {curso.modalidad && (
                        <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {obtenerIconoModalidad(curso.modalidad)}
                          <span className="capitalize">{curso.modalidad}</span>
                        </div>
                      )}
                      {curso.precio !== null && (
                        <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <DollarSign size={14} />
                          <span>
                            {curso.precio === 0 ? 'Gratis' : `$${curso.precio.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                      {curso.nombre_instructor && (
                        <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Users size={14} />
                          <span className="truncate">{curso.nombre_instructor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleEstado(curso)}
                      className={`p-2 rounded-lg transition-colors ${
                        esActivo
                          ? isDarkMode
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                          : isDarkMode
                          ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={esActivo ? 'Desactivar' : 'Activar'}
                    >
                      <Power size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditarCurso(curso)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-[#8c5cff]/20 text-[#8c5cff] hover:bg-[#8c5cff]/30'
                          : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                      }`}
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAbrirConfirmDialog(curso)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal de Formulario */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCerrarModal}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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
                    {editingId ? 'Editar Curso' : 'Crear Nuevo Curso'}
                  </h2>
                  <button
                    onClick={handleCerrarModal}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-white hover:bg-[#8c5cff]/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-purple-100'
                    }`}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={editingId ? handleActualizarCurso : handleCrearCurso} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto overflow-x-visible">
                  {/* Error en Modal */}
                  {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Código del Curso */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Código del Curso *
                    </label>
                    <input
                      type="text"
                      name="codigo_curso"
                      value={formData.codigo_curso}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                          : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:border-[#8c5cff]`}
                      placeholder="CURSO-001"
                    />
                  </div>

                  {/* Nombre del Curso */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombre del Curso *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                          : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:border-[#8c5cff]`}
                      placeholder="Nutrición Deportiva Básica"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                          : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:border-[#8c5cff]`}
                      placeholder="Descripción detallada del curso..."
                    />
                  </div>

                  {/* Nivel */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nivel
                    </label>
                    <select
                      name="nivel"
                      value={formData.nivel}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-purple-200 text-gray-900'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    >
                      <option value="básico">Básico</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </div>

                  {/* Modalidad */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Modalidad
                    </label>
                    <select
                      name="modalidad"
                      value={formData.modalidad}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-purple-200 text-gray-900'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    >
                      <option value="online">Online</option>
                      <option value="presencial">Presencial</option>
                      <option value="mixto">Mixto</option>
                    </select>
                  </div>

                  {/* Duración */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Duración (horas)
                    </label>
                    <input
                      type="number"
                      name="duracion_horas"
                      value={formData.duracion_horas}
                      onChange={handleInputChange}
                      min="0"
                      step="0.5"
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                          : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:border-[#8c5cff]`}
                      placeholder="40"
                    />
                  </div>

                  {/* Fecha de Inicio */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fecha de Inicio
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={formData.fecha_inicio ? new Date(formData.fecha_inicio) : null}
                        onChange={(date) => handleDateChange('fecha_inicio', date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Seleccionar fecha..."
                        isClearable
                        popperPlacement="top-start"
                        className={`w-full px-4 py-2 rounded-lg border transition-all ${
                          isDarkMode
                            ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                            : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                        } focus:outline-none focus:border-[#8c5cff]`}
                      />
                      <Calendar size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                  </div>

                  {/* Fecha de Fin */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fecha de Fin
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={formData.fecha_fin ? new Date(formData.fecha_fin) : null}
                        onChange={(date) => handleDateChange('fecha_fin', date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Seleccionar fecha..."
                        isClearable
                        minDate={formData.fecha_inicio ? new Date(formData.fecha_inicio) : undefined}
                        popperPlacement="top-start"
                        className={`w-full px-4 py-2 rounded-lg border transition-all ${
                          isDarkMode
                            ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                            : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                        } focus:outline-none focus:border-[#8c5cff]`}
                      />
                      <Calendar size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                  </div>

                  {/* Precio */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Precio
                    </label>
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleInputChange}
                      min="0"
                      step="100"
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                          : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:border-[#8c5cff]`}
                      placeholder="100000"
                    />
                  </div>

                  {/* Descuento */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      name="descuento"
                      value={formData.descuento}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="1"
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                          : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:border-[#8c5cff]`}
                      placeholder="0"
                    />
                  </div>

                  {/* Moneda */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Moneda
                    </label>
                    <select
                      name="moneda"
                      value={formData.moneda}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-purple-200 text-gray-900'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    >
                      <option value="CLP">CLP - Peso Chileno</option>
                      <option value="USD">USD - Dólar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>

                  {/* Estado */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Estado
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-purple-200 text-gray-900'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>

                  {/* Nombre del Instructor */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombre del Instructor
                    </label>
                    <input
                      type="text"
                      name="nombre_instructor"
                      value={formData.nombre_instructor}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                          : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:border-[#8c5cff]`}
                      placeholder="Dr. Juan Pérez"
                    />
                  </div>

                  {/* Imagen de Portada - File Upload */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Imagen de Portada
                    </label>

                    {/* Preview o Upload Area */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* File Input */}
                      <div className="flex-1">
                        <label htmlFor="imagen-input" className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-all ${
                          isDarkMode
                            ? 'border-[#8c5cff]/30 bg-[#0f1117] hover:border-[#8c5cff]/50 hover:bg-[#1a1c22]'
                            : 'border-purple-300 bg-purple-50 hover:border-purple-400 hover:bg-purple-100'
                        }`}>
                          <Upload size={18} className={isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'} />
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {imagenFile ? imagenFile.name : 'Seleccionar imagen'}
                          </span>
                        </label>
                        <input
                          id="imagen-input"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={handleImagenChange}
                          className="hidden"
                        />
                      </div>

                      {/* Image Preview */}
                      {(imagenPreview || formData.imagen_portada) && (
                        <div className="sm:w-32">
                          <img
                            src={imagenPreview || formData.imagen_portada}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg border border-[#8c5cff]/20"
                          />
                        </div>
                      )}
                    </div>

                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      JPG, PNG, WebP • Máximo 5MB • Se abrirá un editor para ajustar la imagen
                    </p>
                  </div>

                  {/* URL del Video Promocional */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      URL del Video Promocional
                    </label>
                    <input
                      type="url"
                      name="video_promocional"
                      value={formData.video_promocional}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                          : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:border-[#8c5cff]`}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  {/* URL del Curso */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      URL del Curso
                    </label>
                    <input
                      type="url"
                      name="url_curso"
                      value={formData.url_curso}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                          : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:border-[#8c5cff]`}
                      placeholder="https://cursos.example.com/curso-1"
                    />
                  </div>

                  {/* Materiales */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Materiales (separados por comas)
                    </label>
                    <textarea
                      name="materiales"
                      value={formData.materiales}
                      onChange={handleInputChange}
                      rows={2}
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white placeholder-gray-500'
                          : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:border-[#8c5cff]`}
                      placeholder="Manual PDF, Videos, Ejercicios prácticos"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 sm:gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={submitting}
                      className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all flex-1 ${
                        isDarkMode
                          ? 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white hover:shadow-lg'
                          : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {submitting ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="hidden sm:inline">Guardando...</span>
                          <span className="sm:hidden">Guardando</span>
                        </>
                      ) : (
                        <>
                          <Check size={18} className="sm:size-5" />
                          <span className="hidden sm:inline">{editingId ? 'Guardar Cambios' : 'Crear Curso'}</span>
                          <span className="sm:hidden">{editingId ? 'Guardar' : 'Crear'}</span>
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleCerrarModal}
                      disabled={submitting}
                      className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all flex-1 ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <X size={18} className="sm:size-5" />
                      <span className="hidden sm:inline">Cancelar</span>
                      <span className="sm:hidden">Cerrar</span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image Crop Modal */}
      <CloudinaryImageCrop
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageSrc={selectedImageForCrop}
        onUploadComplete={handleUploadComplete}
        isDarkMode={isDarkMode}
        tipo="curso"
        cursoId={editingId}
        token={token}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Eliminar Curso"
        message={`¿Estás seguro de que deseas eliminar el curso "${cursoAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmarEliminar}
        onCancel={() => {
          setShowConfirmDialog(false);
          setCursoAEliminar(null);
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDanger={true}
      />
    </motion.div>
  );
};

export default GestionCursosSection;
