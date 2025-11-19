import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  AlertCircle,
  Loader,
  Search,
  Save,
  X,
  Check,
  Video,
  FileText,
  CheckCircle,
  BookOpen
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API_ENDPOINTS, BASE as API_URL } from '../../config/apiConfig';
import { useAuth } from '../../context/AuthContext';

const GestionDetallesCursosSection = ({ containerVariants }) => {
  const { isDarkMode, token } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSecciones, setExpandedSecciones] = useState({});
  const [search, setSearch] = useState('');

  // Form states
  const [showSeccionForm, setShowSeccionForm] = useState(false);
  const [showLeccionForm, setShowLeccionForm] = useState(false);
  const [selectedSeccionForLeccion, setSelectedSeccionForLeccion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, seccion: null });
  const [deleteLeccionModal, setDeleteLeccionModal] = useState({ show: false, leccion: null, seccion: null });

  const [seccionForm, setSeccionForm] = useState({
    titulo: '',
    descripcion: ''
  });

  const [leccionForm, setLeccionForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'video',
    duracionMinutos: 0,
    url: ''
  });

  const [editingSeccion, setEditingSeccion] = useState(null);
  const [editingLeccion, setEditingLeccion] = useState(null);

  // Cargar cursos
  useEffect(() => {
    obtenerCursos();
  }, []);

  // Cargar secciones cuando se selecciona un curso
  useEffect(() => {
    if (selectedCurso) {
      cargarSecciones(selectedCurso.id_curso);
    }
  }, [selectedCurso]);

  const obtenerCursos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.CURSOS.GET_ALL);
      setCursos(response.data.filter(c => c.estado === 'activo'));
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const cargarSecciones = async (cursoId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/detalles-cursos/${cursoId}`);
      setSecciones(response.data.secciones || []);
      setExpandedSecciones({});
    } catch (error) {
      console.error('Error al cargar secciones:', error);
      toast.error('Error al cargar secciones del curso');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeccion = (numeroSeccion) => {
    setExpandedSecciones(prev => ({
      ...prev,
      [numeroSeccion]: !prev[numeroSeccion]
    }));
  };

  // Agregar/Editar sección
  const handleAgregarSeccion = () => {
    setEditingSeccion(null);
    setSeccionForm({ titulo: '', descripcion: '' });
    setShowSeccionForm(true);
  };

  const handleEditarSeccion = (seccion) => {
    setEditingSeccion(seccion);
    setSeccionForm({
      titulo: seccion.titulo,
      descripcion: seccion.descripcion || ''
    });
    setShowSeccionForm(true);
  };

  const handleGuardarSeccion = async (e) => {
    e.preventDefault();

    if (!seccionForm.titulo.trim()) {
      toast.error('El título de la sección es obligatorio');
      return;
    }

    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingSeccion) {
        // Editar sección existente - actualizar cada lección de esa sección
        for (const leccion of editingSeccion.lecciones) {
          await axios.put(
            `${API_URL}/api/detalles-cursos/${selectedCurso.id_curso}/${leccion.id}`,
            {
              seccionNumero: editingSeccion.numero,
              seccionTitulo: seccionForm.titulo,
              seccionDescripcion: seccionForm.descripcion || null,
              ordenSeccion: editingSeccion.orden,
              leccionNumero: leccion.numero,
              leccionTitulo: leccion.titulo,
              leccionDescripcion: leccion.descripcion || null,
              tipoContenido: leccion.tipo,
              urlContenido: leccion.url || null,
              duracionMinutos: leccion.duracion
            },
            config
          );
        }
        toast.success('Sección actualizada exitosamente');
      } else {
        // Crear nueva sección
        const maxSeccionNumero = secciones.length > 0
          ? Math.max(...secciones.map(s => s.numero))
          : 0;

        const leccionNumero = 1;
        const leccionTitulo = `${seccionForm.titulo} - Introducción`;

        await axios.post(
          `${API_URL}/api/detalles-cursos/${selectedCurso.id_curso}`,
          {
            seccionNumero: maxSeccionNumero + 1,
            seccionTitulo: seccionForm.titulo,
            seccionDescripcion: seccionForm.descripcion || null,
            ordenSeccion: maxSeccionNumero + 1,
            leccionNumero,
            leccionTitulo,
            leccionDescripcion: null,
            tipoContenido: 'video',
            urlContenido: null,
            duracionMinutos: 0
          },
          config
        );
        toast.success('Sección creada exitosamente');
      }

      setShowSeccionForm(false);
      cargarSecciones(selectedCurso.id_curso);
    } catch (error) {
      console.error('Error al guardar sección:', error);
      toast.error(error.response?.data?.error || 'Error al guardar la sección');
    } finally {
      setSubmitting(false);
    }
  };

  // Agregar/Editar lección
  const handleAgregarLeccion = (seccion) => {
    setSelectedSeccionForLeccion(seccion);
    setEditingLeccion(null);
    setLeccionForm({
      titulo: '',
      descripcion: '',
      tipo: 'video',
      duracionMinutos: 0,
      url: ''
    });
    setShowLeccionForm(true);
  };

  const handleEditarLeccion = (seccion, leccion) => {
    setSelectedSeccionForLeccion(seccion);
    setEditingLeccion(leccion);
    setLeccionForm({
      titulo: leccion.titulo,
      descripcion: leccion.descripcion || '',
      tipo: leccion.tipo,
      duracionMinutos: leccion.duracion || 0,
      url: leccion.url || ''
    });
    setShowLeccionForm(true);
  };

  const handleGuardarLeccion = async (e) => {
    e.preventDefault();

    if (!leccionForm.titulo.trim()) {
      toast.error('El título de la lección es obligatorio');
      return;
    }

    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingLeccion) {
        // Editar lección existente
        await axios.put(
          `${API_URL}/api/detalles-cursos/${selectedCurso.id_curso}/${editingLeccion.id}`,
          {
            seccionNumero: selectedSeccionForLeccion.numero,
            seccionTitulo: selectedSeccionForLeccion.titulo,
            seccionDescripcion: selectedSeccionForLeccion.descripcion || null,
            ordenSeccion: selectedSeccionForLeccion.orden,
            leccionNumero: editingLeccion.numero,
            leccionTitulo: leccionForm.titulo,
            leccionDescripcion: leccionForm.descripcion || null,
            tipoContenido: leccionForm.tipo,
            urlContenido: leccionForm.url || null,
            duracionMinutos: leccionForm.duracionMinutos
          },
          config
        );
        toast.success('Lección actualizada exitosamente');
      } else {
        // Crear nueva lección
        const seccionLecciones = selectedSeccionForLeccion.lecciones || [];
        const maxLeccionNumero = seccionLecciones.length > 0
          ? Math.max(...seccionLecciones.map(l => l.numero))
          : 0;

        await axios.post(
          `${API_URL}/api/detalles-cursos/${selectedCurso.id_curso}`,
          {
            seccionNumero: selectedSeccionForLeccion.numero,
            seccionTitulo: selectedSeccionForLeccion.titulo,
            seccionDescripcion: selectedSeccionForLeccion.descripcion || null,
            ordenSeccion: selectedSeccionForLeccion.orden,
            leccionNumero: maxLeccionNumero + 1,
            leccionTitulo: leccionForm.titulo,
            leccionDescripcion: leccionForm.descripcion || null,
            tipoContenido: leccionForm.tipo,
            urlContenido: leccionForm.url || null,
            duracionMinutos: leccionForm.duracionMinutos
          },
          config
        );
        toast.success('Lección agregada exitosamente');
      }

      setShowLeccionForm(false);
      cargarSecciones(selectedCurso.id_curso);
    } catch (error) {
      console.error('Error al guardar lección:', error);
      toast.error(error.response?.data?.error || 'Error al guardar la lección');
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar lección
  const handleAbrirModalEliminarLeccion = (seccion, leccion) => {
    setDeleteLeccionModal({ show: true, leccion, seccion });
  };

  const handleConfirmarEliminarLeccion = async () => {
    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(
        `${API_URL}/api/detalles-cursos/${selectedCurso.id_curso}/${deleteLeccionModal.leccion.id}`,
        config
      );

      // Actualizar estado local - eliminar la lección de la sección
      setSecciones(prev => prev.map(sec => {
        if (sec.numero === deleteLeccionModal.seccion.numero) {
          return {
            ...sec,
            lecciones: sec.lecciones.filter(l => l.id !== deleteLeccionModal.leccion.id)
          };
        }
        return sec;
      }));

      toast.success('Lección eliminada');
      setDeleteLeccionModal({ show: false, leccion: null, seccion: null });
    } catch (error) {
      console.error('Error al eliminar lección:', error);
      toast.error('Error al eliminar la lección');
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar sección (con cascada)
  const handleEliminarSeccion = async () => {
    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Eliminar todas las lecciones de la sección
      for (const leccion of deleteModal.seccion.lecciones) {
        await axios.delete(
          `${API_URL}/api/detalles-cursos/${selectedCurso.id_curso}/${leccion.id}`,
          config
        );
      }

      // Actualizar estado local - eliminar la sección
      setSecciones(prev => prev.filter(s => s.numero !== deleteModal.seccion.numero));

      toast.success('Sección y sus lecciones eliminadas');
      setDeleteModal({ show: false, seccion: null });
    } catch (error) {
      console.error('Error al eliminar sección:', error);
      toast.error('Error al eliminar la sección');
      setDeleteModal({ show: false, seccion: null });
    } finally {
      setSubmitting(false);
    }
  };

  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case 'video':
        return <Video size={16} className="text-blue-500" />;
      case 'articulo':
        return <FileText size={16} className="text-purple-500" />;
      case 'pdf':
        return <FileText size={16} className="text-red-500" />;
      case 'quiz':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const filteredCursos = cursos.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && !selectedCurso) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex items-center justify-center py-20"
      >
        <Loader className="animate-spin mr-3" size={32} />
        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Cargando cursos...
        </span>
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
      {/* Selector de Curso */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className={`rounded-xl p-4 ${
            isDarkMode ? 'bg-[#1a1c22]/50 border border-[#8c5cff]/20' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Mis Cursos
            </h3>

            {/* Search */}
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm border transition ${
                  isDarkMode
                    ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:border-[#8c5cff]`}
              />
            </div>

            {/* Lista de Cursos */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredCursos.map(curso => (
                <button
                  key={curso.id_curso}
                  onClick={() => setSelectedCurso(curso)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedCurso?.id_curso === curso.id_curso
                      ? isDarkMode
                        ? 'bg-[#8c5cff]/20 border-[#8c5cff] border'
                        : 'bg-purple-100 border border-purple-300'
                      : isDarkMode
                      ? 'hover:bg-[#2a2c33]'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <p className={`font-semibold text-sm line-clamp-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {curso.nombre}
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {secciones.length || 0} secciones
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detalles del Curso */}
        <div className="lg:col-span-3">
          {selectedCurso ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedCurso.nombre}
                  </h2>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {secciones.length} {secciones.length === 1 ? 'sección' : 'secciones'}
                  </p>
                </div>
                <button
                  onClick={handleAgregarSeccion}
                  className="px-4 py-2 bg-[#8c5cff] text-white rounded-lg hover:bg-[#7a4de6] transition font-medium flex items-center gap-2"
                >
                  <Plus size={18} />
                  Agregar Sección
                </button>
              </div>

              {/* Secciones */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin mr-3" />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Cargando contenido...
                  </span>
                </div>
              ) : secciones.length === 0 ? (
                <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
                  isDarkMode
                    ? 'border-[#8c5cff]/20 bg-[#1a1c22]/50'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <BookOpen size={48} className={`mx-auto mb-4 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    No hay secciones todavía. ¡Comienza agregando una!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {secciones.map(seccion => (
                    <div
                      key={seccion.numero}
                      className={`rounded-lg border overflow-hidden ${
                        isDarkMode
                          ? 'border-[#8c5cff]/20 bg-[#2a2c33]'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {/* Sección Header */}
                      <div
                        className={`w-full px-6 py-4 flex items-center justify-between ${
                          isDarkMode ? 'hover:bg-[#1a1c22]' : 'hover:bg-gray-100'
                        } transition`}
                      >
                        <button
                          onClick={() => toggleSeccion(seccion.numero)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <ChevronDown
                            size={20}
                            className={`transition-transform ${
                              expandedSecciones[seccion.numero] ? 'rotate-180' : ''
                            }`}
                          />
                          <div>
                            <h4 className={`font-bold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {seccion.titulo}
                            </h4>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {seccion.lecciones.length} {seccion.lecciones.length === 1 ? 'lección' : 'lecciones'}
                            </p>
                          </div>
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAgregarLeccion(seccion);
                            }}
                            className="px-3 py-1 bg-[#8c5cff] text-white rounded hover:bg-[#7a4de6] transition text-sm font-medium flex items-center gap-1"
                          >
                            <Plus size={16} />
                            Lección
                          </button>
                          <button
                            onClick={() => handleEditarSeccion(seccion)}
                            className={`p-2 rounded-lg transition ${
                              isDarkMode
                                ? 'hover:bg-blue-500/20 text-blue-500'
                                : 'hover:bg-blue-100 text-blue-600'
                            }`}
                            title="Editar sección"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ show: true, seccion })}
                            className={`p-2 rounded-lg transition ${
                              isDarkMode
                                ? 'hover:bg-red-500/20 text-red-500'
                                : 'hover:bg-red-100 text-red-600'
                            }`}
                            title="Eliminar sección"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Lecciones */}
                      <AnimatePresence>
                        {expandedSecciones[seccion.numero] && seccion.lecciones.length > 0 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className={`border-t ${
                              isDarkMode ? 'border-[#8c5cff]/20' : 'border-gray-200'
                            }`}
                          >
                            {seccion.lecciones.map(leccion => (
                              <div
                                key={`${leccion.numero}`}
                                className={`px-6 py-4 flex items-start justify-between gap-4 ${
                                  isDarkMode
                                    ? 'border-t border-[#8c5cff]/10 hover:bg-[#1a1c22]'
                                    : 'border-t border-gray-100 hover:bg-white'
                                } transition`}
                              >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <div className="mt-1">
                                    {getIconoTipo(leccion.tipo)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-semibold ${
                                      isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {leccion.titulo}
                                    </p>
                                    {leccion.descripcion && (
                                      <p className={`text-sm mt-1 line-clamp-2 ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                      }`}>
                                        {leccion.descripcion}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2 text-xs">
                                      <span className={`px-2 py-1 rounded ${
                                        isDarkMode
                                          ? 'bg-[#8c5cff]/20 text-[#8c5cff]'
                                          : 'bg-purple-100 text-purple-700'
                                      }`}>
                                        {leccion.tipo}
                                      </span>
                                      {leccion.duracion > 0 && (
                                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>
                                          ⏱ {leccion.duracion} min
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditarLeccion(seccion, leccion)}
                                    className={`p-2 rounded-lg transition ${
                                      isDarkMode
                                        ? 'hover:bg-blue-500/20 text-blue-500'
                                        : 'hover:bg-blue-100 text-blue-600'
                                    }`}
                                    title="Editar lección"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleAbrirModalEliminarLeccion(seccion, leccion)}
                                    className={`p-2 rounded-lg transition ${
                                      isDarkMode
                                        ? 'hover:bg-red-500/20 text-red-500'
                                        : 'hover:bg-red-100 text-red-600'
                                    }`}
                                    title="Eliminar lección"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={`text-center py-20 rounded-xl border-2 border-dashed ${
              isDarkMode
                ? 'border-[#8c5cff]/20 bg-[#1a1c22]/50'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <BookOpen size={48} className={`mx-auto mb-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Selecciona un curso para comenzar a agregar contenido
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Agregar Sección */}
      <AnimatePresence>
        {showSeccionForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-2xl overflow-hidden max-w-md w-full mx-4 ${
                isDarkMode ? 'bg-[#1a1c22]' : 'bg-white'
              }`}
            >
              <div className={`px-6 py-4 border-b ${
                isDarkMode ? 'border-[#8c5cff]/20' : 'border-gray-200'
              } flex items-center justify-between`}>
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Nueva Sección
                </h3>
                <button
                  onClick={() => setShowSeccionForm(false)}
                  className={`p-1 rounded-lg transition ${
                    isDarkMode ? 'hover:bg-[#8c5cff]/20' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleGuardarSeccion} className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Título de la Sección *
                  </label>
                  <input
                    type="text"
                    value={seccionForm.titulo}
                    onChange={(e) => setSeccionForm({ ...seccionForm, titulo: e.target.value })}
                    placeholder="Ej: Fundamentos Básicos"
                    className={`w-full px-3 py-2 rounded-lg border transition ${
                      isDarkMode
                        ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:border-[#8c5cff]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={seccionForm.descripcion}
                    onChange={(e) => setSeccionForm({ ...seccionForm, descripcion: e.target.value })}
                    placeholder="Breve descripción de qué trata esta sección"
                    rows="3"
                    className={`w-full px-3 py-2 rounded-lg border transition resize-none ${
                      isDarkMode
                        ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:border-[#8c5cff]`}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#8c5cff]/20">
                  <button
                    type="button"
                    onClick={() => setShowSeccionForm(false)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                      isDarkMode
                        ? 'bg-[#2a2c33] text-gray-300 hover:bg-[#1a1c22]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-[#8c5cff] text-white rounded-lg font-medium hover:bg-[#7a4de6] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Crear
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Agregar Lección */}
      <AnimatePresence>
        {showLeccionForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-2xl overflow-hidden max-w-md w-full mx-4 ${
                isDarkMode ? 'bg-[#1a1c22]' : 'bg-white'
              }`}
            >
              <div className={`px-6 py-4 border-b ${
                isDarkMode ? 'border-[#8c5cff]/20' : 'border-gray-200'
              } flex items-center justify-between`}>
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingLeccion ? 'Editar Lección' : 'Nueva Lección'}
                </h3>
                <button
                  onClick={() => setShowLeccionForm(false)}
                  className={`p-1 rounded-lg transition ${
                    isDarkMode ? 'hover:bg-[#8c5cff]/20' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleGuardarLeccion} className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Título de la Lección *
                  </label>
                  <input
                    type="text"
                    value={leccionForm.titulo}
                    onChange={(e) => setLeccionForm({ ...leccionForm, titulo: e.target.value })}
                    placeholder="Ej: Introducción al Tema"
                    className={`w-full px-3 py-2 rounded-lg border transition ${
                      isDarkMode
                        ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:border-[#8c5cff]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Descripción
                  </label>
                  <textarea
                    value={leccionForm.descripcion}
                    onChange={(e) => setLeccionForm({ ...leccionForm, descripcion: e.target.value })}
                    placeholder="Qué aprenderá el estudiante en esta lección"
                    rows="2"
                    className={`w-full px-3 py-2 rounded-lg border transition resize-none ${
                      isDarkMode
                        ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:border-[#8c5cff]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Tipo de Contenido
                  </label>
                  <select
                    value={leccionForm.tipo}
                    onChange={(e) => setLeccionForm({ ...leccionForm, tipo: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border transition ${
                      isDarkMode
                        ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:border-[#8c5cff]`}
                  >
                    <option value="video">Video</option>
                    <option value="articulo">Artículo</option>
                    <option value="pdf">PDF / Documento</option>
                    <option value="quiz">Quiz / Evaluación</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Duración (min)
                    </label>
                    <input
                      type="number"
                      value={leccionForm.duracionMinutos}
                      onChange={(e) => setLeccionForm({ ...leccionForm, duracionMinutos: parseInt(e.target.value) || 0 })}
                      min="0"
                      placeholder="30"
                      className={`w-full px-3 py-2 rounded-lg border transition ${
                        isDarkMode
                          ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Enlace del Contenido
                  </label>
                  <input
                    type="url"
                    value={leccionForm.url}
                    onChange={(e) => setLeccionForm({ ...leccionForm, url: e.target.value })}
                    placeholder="https://enlace-al-contenido.com"
                    className={`w-full px-3 py-2 rounded-lg border transition ${
                      isDarkMode
                        ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:border-[#8c5cff]`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Donde está el video, artículo o documento
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#8c5cff]/20">
                  <button
                    type="button"
                    onClick={() => setShowLeccionForm(false)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                      isDarkMode
                        ? 'bg-[#2a2c33] text-gray-300 hover:bg-[#1a1c22]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-[#8c5cff] text-white rounded-lg font-medium hover:bg-[#7a4de6] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        {editingLeccion ? 'Actualizar' : 'Guardar'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Eliminar Sección */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-2xl overflow-hidden max-w-md w-full mx-4 ${
                isDarkMode ? 'bg-[#1a1c22]' : 'bg-white'
              }`}
            >
              <div className={`px-6 py-4 border-b border-red-500/20 flex items-start gap-3`}>
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Eliminar Sección
                  </h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <div className={`px-6 py-4 ${isDarkMode ? 'bg-red-500/5' : 'bg-red-50'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ¿Estás seguro de que deseas eliminar la sección <strong>"{deleteModal.seccion?.titulo}"</strong>?
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Se eliminarán todas las <strong>{deleteModal.seccion?.lecciones?.length || 0} lecciones</strong> asociadas a esta sección.
                </p>
              </div>

              <div className="px-6 py-4 flex gap-3 border-t border-[#8c5cff]/20">
                <button
                  onClick={() => setDeleteModal({ show: false, seccion: null })}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                    isDarkMode
                      ? 'bg-[#2a2c33] text-gray-300 hover:bg-[#1a1c22]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminarSeccion}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Eliminar Lección */}
      <AnimatePresence>
        {deleteLeccionModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-2xl overflow-hidden max-w-md w-full mx-4 ${
                isDarkMode ? 'bg-[#1a1c22]' : 'bg-white'
              }`}
            >
              <div className={`px-6 py-4 border-b border-red-500/20 flex items-start gap-3`}>
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Eliminar Lección
                  </h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <div className={`px-6 py-4 ${isDarkMode ? 'bg-red-500/5' : 'bg-red-50'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ¿Estás seguro de que deseas eliminar la lección <strong>"{deleteLeccionModal.leccion?.titulo}"</strong>?
                </p>
              </div>

              <div className="px-6 py-4 flex gap-3 border-t border-[#8c5cff]/20">
                <button
                  onClick={() => setDeleteLeccionModal({ show: false, leccion: null, seccion: null })}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                    isDarkMode
                      ? 'bg-[#2a2c33] text-gray-300 hover:bg-[#1a1c22]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarEliminarLeccion}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GestionDetallesCursosSection;
