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
  GripVertical
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API_ENDPOINTS, BASE as API_URL } from '../../config/apiConfig';
import { useAuth } from '../../context/AuthContext';

const GestionDetallesCursosSection = ({ containerVariants }) => {
  const { isDarkMode, token } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSecciones, setExpandedSecciones] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingDetalle, setEditingDetalle] = useState(null);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    seccionNumero: 1,
    seccionTitulo: '',
    seccionDescripcion: '',
    ordenSeccion: 1,
    leccionNumero: 1,
    leccionTitulo: '',
    leccionDescripcion: '',
    tipoContenido: 'video',
    urlContenido: '',
    duracionMinutos: 0,
    ordenLeccion: 1,
    archivoNombre: '',
    archivoTipo: ''
  });

  // Cargar cursos
  useEffect(() => {
    obtenerCursos();
  }, []);

  // Cargar detalles cuando se selecciona un curso
  useEffect(() => {
    if (selectedCurso) {
      cargarDetalles(selectedCurso.id_curso);
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

  const cargarDetalles = async (cursoId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/detalles-cursos/${cursoId}`);
      const detallesData = [];
      response.data.secciones.forEach(seccion => {
        seccion.lecciones.forEach(leccion => {
          detallesData.push({
            seccion_numero: seccion.numero,
            seccion_titulo: seccion.titulo,
            seccion_descripcion: seccion.descripcion,
            orden_seccion: seccion.orden,
            leccion_numero: leccion.numero,
            leccion_titulo: leccion.titulo,
            leccion_descripcion: leccion.descripcion,
            tipo_contenido: leccion.tipo,
            url_contenido: leccion.url || '',
            duracion_minutos: leccion.duracion || 0,
            orden_leccion: leccion.orden,
            archivo_nombre: leccion.archivo?.nombre || '',
            archivo_tipo: leccion.archivo?.tipo || ''
          });
        });
      });
      setDetalles(detallesData);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      toast.error('Error al cargar detalles del curso');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Numero') || name.includes('Orden') || name === 'duracionMinutos'
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleAddDetalle = () => {
    setEditingDetalle(null);
    setFormData({
      seccionNumero: 1,
      seccionTitulo: '',
      seccionDescripcion: '',
      ordenSeccion: 1,
      leccionNumero: 1,
      leccionTitulo: '',
      leccionDescripcion: '',
      tipoContenido: 'video',
      urlContenido: '',
      duracionMinutos: 0,
      ordenLeccion: 1,
      archivoNombre: '',
      archivoTipo: ''
    });
    setShowForm(true);
  };

  const handleEditDetalle = (detalle) => {
    setEditingDetalle(detalle);
    setFormData({
      seccionNumero: detalle.seccion_numero,
      seccionTitulo: detalle.seccion_titulo,
      seccionDescripcion: detalle.seccion_descripcion,
      ordenSeccion: detalle.orden_seccion,
      leccionNumero: detalle.leccion_numero,
      leccionTitulo: detalle.leccion_titulo,
      leccionDescripcion: detalle.leccion_descripcion,
      tipoContenido: detalle.tipo_contenido,
      urlContenido: detalle.url_contenido,
      duracionMinutos: detalle.duracion_minutos,
      ordenLeccion: detalle.orden_leccion,
      archivoNombre: detalle.archivo_nombre,
      archivoTipo: detalle.archivo_tipo
    });
    setShowForm(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!selectedCurso) {
      toast.error('Selecciona un curso primero');
      return;
    }

    if (!formData.seccionTitulo || !formData.leccionTitulo) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingDetalle) {
        // Actualizar
        await axios.put(
          `${API_URL}/api/detalles-cursos/${selectedCurso.id_curso}/${editingDetalle.id}`,
          {
            seccion_numero: formData.seccionNumero,
            seccion_titulo: formData.seccionTitulo,
            seccion_descripcion: formData.seccionDescripcion,
            orden_seccion: formData.ordenSeccion,
            leccion_numero: formData.leccionNumero,
            leccion_titulo: formData.leccionTitulo,
            leccion_descripcion: formData.leccionDescripcion,
            tipo_contenido: formData.tipoContenido,
            url_contenido: formData.urlContenido,
            duracion_minutos: formData.duracionMinutos,
            orden_leccion: formData.ordenLeccion,
            archivo_nombre: formData.archivoNombre,
            archivo_tipo: formData.archivoTipo
          },
          config
        );
        toast.success('Detalle actualizado correctamente');
      } else {
        // Crear
        await axios.post(
          `${API_URL}/api/detalles-cursos/${selectedCurso.id_curso}`,
          {
            seccionNumero: formData.seccionNumero,
            seccionTitulo: formData.seccionTitulo,
            seccionDescripcion: formData.seccionDescripcion,
            ordenSeccion: formData.ordenSeccion,
            leccionNumero: formData.leccionNumero,
            leccionTitulo: formData.leccionTitulo,
            leccionDescripcion: formData.leccionDescripcion,
            tipoContenido: formData.tipoContenido,
            urlContenido: formData.urlContenido,
            duracionMinutos: formData.duracionMinutos,
            ordenLeccion: formData.ordenLeccion,
            archivoNombre: formData.archivoNombre,
            archivoTipo: formData.archivoTipo
          },
          config
        );
        toast.success('Detalle creado correctamente');
      }

      setShowForm(false);
      cargarDetalles(selectedCurso.id_curso);
    } catch (error) {
      console.error('Error al guardar detalle:', error);
      toast.error(error.response?.data?.error || 'Error al guardar el detalle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDetalle = async (detalle) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este detalle?')) {
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(
        `${API_URL}/api/detalles-cursos/${selectedCurso.id_curso}/${detalle.id}`,
        config
      );
      toast.success('Detalle eliminado correctamente');
      cargarDetalles(selectedCurso.id_curso);
    } catch (error) {
      console.error('Error al eliminar detalle:', error);
      toast.error('Error al eliminar el detalle');
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

  const seccionesAgrupadas = {};
  detalles.forEach(detalle => {
    if (!seccionesAgrupadas[detalle.seccion_numero]) {
      seccionesAgrupadas[detalle.seccion_numero] = {
        numero: detalle.seccion_numero,
        titulo: detalle.seccion_titulo,
        descripcion: detalle.seccion_descripcion,
        orden: detalle.orden_seccion,
        lecciones: []
      };
    }
    seccionesAgrupadas[detalle.seccion_numero].lecciones.push(detalle);
  });

  const seccionesArray = Object.values(seccionesAgrupadas)
    .sort((a, b) => a.orden - b.orden)
    .map(s => ({
      ...s,
      lecciones: s.lecciones.sort((a, b) => a.orden_leccion - b.orden_leccion)
    }));

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
              Cursos
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
                    {detalles.filter(d => d.seccion_numero).length || 0} detalles
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
                    {seccionesArray.length} secciones • {detalles.length} lecciones
                  </p>
                </div>
                <button
                  onClick={handleAddDetalle}
                  className="px-4 py-2 bg-[#8c5cff] text-white rounded-lg hover:bg-[#7a4de6] transition font-medium flex items-center gap-2"
                >
                  <Plus size={18} />
                  Agregar
                </button>
              </div>

              {/* Secciones */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin mr-3" />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Cargando detalles...
                  </span>
                </div>
              ) : seccionesArray.length === 0 ? (
                <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
                  isDarkMode
                    ? 'border-[#8c5cff]/20 bg-[#1a1c22]/50'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <AlertCircle size={48} className={`mx-auto mb-4 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    No hay detalles en este curso. Comienza agregando una sección y lección.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {seccionesArray.map(seccion => (
                    <div
                      key={seccion.numero}
                      className={`rounded-lg border overflow-hidden ${
                        isDarkMode
                          ? 'border-[#8c5cff]/20 bg-[#2a2c33]'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {/* Sección Header */}
                      <button
                        onClick={() => toggleSeccion(seccion.numero)}
                        className={`w-full px-6 py-4 flex items-center justify-between hover:opacity-80 transition ${
                          isDarkMode ? 'hover:bg-[#1a1c22]' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 text-left">
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
                              Sección {seccion.numero}: {seccion.titulo}
                            </h4>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {seccion.lecciones.length} lecciones
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Lecciones */}
                      <AnimatePresence>
                        {expandedSecciones[seccion.numero] && (
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
                                key={`${leccion.seccion_numero}-${leccion.leccion_numero}`}
                                className={`px-6 py-4 flex items-start justify-between gap-4 ${
                                  isDarkMode
                                    ? 'border-t border-[#8c5cff]/10 hover:bg-[#1a1c22]'
                                    : 'border-t border-gray-100 hover:bg-white'
                                } transition`}
                              >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <div className="mt-1">
                                    {getIconoTipo(leccion.tipo_contenido)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-semibold ${
                                      isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      Lección {leccion.leccion_numero}: {leccion.leccion_titulo}
                                    </p>
                                    {leccion.leccion_descripcion && (
                                      <p className={`text-sm mt-1 line-clamp-2 ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                      }`}>
                                        {leccion.leccion_descripcion}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2 text-xs">
                                      <span className={`px-2 py-1 rounded ${
                                        isDarkMode
                                          ? 'bg-[#8c5cff]/20 text-[#8c5cff]'
                                          : 'bg-purple-100 text-purple-700'
                                      }`}>
                                        {leccion.tipo_contenido}
                                      </span>
                                      {leccion.duracion_minutos > 0 && (
                                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>
                                          ⏱ {leccion.duracion_minutos} min
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditDetalle(leccion)}
                                    className={`p-2 rounded-lg transition ${
                                      isDarkMode
                                        ? 'hover:bg-[#8c5cff]/20 text-[#8c5cff]'
                                        : 'hover:bg-purple-100 text-purple-600'
                                    }`}
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDetalle(leccion)}
                                    className={`p-2 rounded-lg transition ${
                                      isDarkMode
                                        ? 'hover:bg-red-500/20 text-red-500'
                                        : 'hover:bg-red-100 text-red-600'
                                    }`}
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
              <AlertCircle size={48} className={`mx-auto mb-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Selecciona un curso para ver sus detalles
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulario */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-2xl overflow-hidden max-w-2xl w-full mx-4 ${
                isDarkMode ? 'bg-[#1a1c22]' : 'bg-white'
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b ${
                isDarkMode ? 'border-[#8c5cff]/20' : 'border-gray-200'
              } flex items-center justify-between`}>
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingDetalle ? 'Editar Detalle' : 'Nuevo Detalle'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className={`p-1 rounded-lg transition ${
                    isDarkMode ? 'hover:bg-[#8c5cff]/20' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Contenido */}
              <form onSubmit={handleSubmitForm} className="p-6 space-y-6">
                {/* Sección */}
                <div className="space-y-4">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Información de Sección
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Número de Sección
                      </label>
                      <input
                        type="number"
                        name="seccionNumero"
                        value={formData.seccionNumero}
                        onChange={handleInputChange}
                        min="1"
                        className={`w-full px-3 py-2 rounded-lg border transition ${
                          isDarkMode
                            ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        } focus:outline-none focus:border-[#8c5cff]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Orden de Sección
                      </label>
                      <input
                        type="number"
                        name="ordenSeccion"
                        value={formData.ordenSeccion}
                        onChange={handleInputChange}
                        min="1"
                        className={`w-full px-3 py-2 rounded-lg border transition ${
                          isDarkMode
                            ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        } focus:outline-none focus:border-[#8c5cff]`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Título de Sección *
                    </label>
                    <input
                      type="text"
                      name="seccionTitulo"
                      value={formData.seccionTitulo}
                      onChange={handleInputChange}
                      placeholder="Ej: Fundamentos de Nutrición"
                      className={`w-full px-3 py-2 rounded-lg border transition ${
                        isDarkMode
                          ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Descripción de Sección
                    </label>
                    <textarea
                      name="seccionDescripcion"
                      value={formData.seccionDescripcion}
                      onChange={handleInputChange}
                      placeholder="Descripción optional de la sección"
                      rows="3"
                      className={`w-full px-3 py-2 rounded-lg border transition resize-none ${
                        isDarkMode
                          ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    />
                  </div>
                </div>

                {/* Lección */}
                <div className="space-y-4 pt-4 border-t border-[#8c5cff]/20">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Información de Lección
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Número de Lección
                      </label>
                      <input
                        type="number"
                        name="leccionNumero"
                        value={formData.leccionNumero}
                        onChange={handleInputChange}
                        min="1"
                        className={`w-full px-3 py-2 rounded-lg border transition ${
                          isDarkMode
                            ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        } focus:outline-none focus:border-[#8c5cff]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Orden de Lección
                      </label>
                      <input
                        type="number"
                        name="ordenLeccion"
                        value={formData.ordenLeccion}
                        onChange={handleInputChange}
                        min="1"
                        className={`w-full px-3 py-2 rounded-lg border transition ${
                          isDarkMode
                            ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        } focus:outline-none focus:border-[#8c5cff]`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Título de Lección *
                    </label>
                    <input
                      type="text"
                      name="leccionTitulo"
                      value={formData.leccionTitulo}
                      onChange={handleInputChange}
                      placeholder="Ej: Macronutrientes Básicos"
                      className={`w-full px-3 py-2 rounded-lg border transition ${
                        isDarkMode
                          ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Descripción de Lección
                    </label>
                    <textarea
                      name="leccionDescripcion"
                      value={formData.leccionDescripcion}
                      onChange={handleInputChange}
                      placeholder="Descripción de la lección"
                      rows="3"
                      className={`w-full px-3 py-2 rounded-lg border transition resize-none ${
                        isDarkMode
                          ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Tipo de Contenido *
                      </label>
                      <select
                        name="tipoContenido"
                        value={formData.tipoContenido}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg border transition ${
                          isDarkMode
                            ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        } focus:outline-none focus:border-[#8c5cff]`}
                      >
                        <option value="video">Video</option>
                        <option value="articulo">Artículo</option>
                        <option value="pdf">PDF</option>
                        <option value="quiz">Quiz</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Duración (minutos)
                      </label>
                      <input
                        type="number"
                        name="duracionMinutos"
                        value={formData.duracionMinutos}
                        onChange={handleInputChange}
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
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      URL del Contenido
                    </label>
                    <input
                      type="url"
                      name="urlContenido"
                      value={formData.urlContenido}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className={`w-full px-3 py-2 rounded-lg border transition ${
                        isDarkMode
                          ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:outline-none focus:border-[#8c5cff]`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Nombre del Archivo
                      </label>
                      <input
                        type="text"
                        name="archivoNombre"
                        value={formData.archivoNombre}
                        onChange={handleInputChange}
                        placeholder="documento.pdf"
                        className={`w-full px-3 py-2 rounded-lg border transition ${
                          isDarkMode
                            ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        } focus:outline-none focus:border-[#8c5cff]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Tipo de Archivo
                      </label>
                      <input
                        type="text"
                        name="archivoTipo"
                        value={formData.archivoTipo}
                        onChange={handleInputChange}
                        placeholder="application/pdf"
                        className={`w-full px-3 py-2 rounded-lg border transition ${
                          isDarkMode
                            ? 'bg-[#2a2c33] border-[#8c5cff]/20 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        } focus:outline-none focus:border-[#8c5cff]`}
                      />
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t border-[#8c5cff]/20">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
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
                        <Save size={18} />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GestionDetallesCursosSection;
