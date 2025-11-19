import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Zap,
  AlertCircle,
  BookOpen,
  Video,
  Globe,
  MapPin,
  Monitor,
  RefreshCw,
  Filter,
  X,
  UserPlus,
  CheckCircle,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS, BASE as API_URL } from '../../config/apiConfig';
import axios from 'axios';
import { toast } from 'sonner';

const CursosSection = ({ containerVariants, onVerDetalleCurso }) => {
  const { isDarkMode, token } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [inscripciones, setInscripciones] = useState({});  // { id_curso: true/false }
  const [inscribiendo, setInscribiendo] = useState({});    // { id_curso: true/false }

  // Obtener cursos al cargar
  useEffect(() => {
    obtenerCursos();
  }, []);

  // Filtrar cursos cuando cambia el filtro (solo mostrar cursos activos)
  useEffect(() => {
    const cursosActivos = cursos.filter(curso => curso.estado === 'activo');

    if (filtroNivel === 'todos') {
      setFilteredCursos(cursosActivos);
    } else {
      setFilteredCursos(cursosActivos.filter(curso => curso.nivel === filtroNivel));
    }
  }, [filtroNivel, cursos]);

  const obtenerCursos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_ENDPOINTS.CURSOS.GET_ALL);
      setCursos(response.data);
      setFilteredCursos(response.data);

      // Verificar inscripciones si hay token
      if (token) {
        await verificarInscripciones(response.data);
      }
    } catch (err) {
      console.error('Error al obtener cursos:', err);
      setError('Error al cargar los cursos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const verificarInscripciones = async (cursosList) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const verificaciones = {};

      for (const curso of cursosList) {
        try {
          const response = await axios.get(API_ENDPOINTS.INSCRIPCIONES.VERIFICAR(curso.id_curso), config);
          verificaciones[curso.id_curso] = response.data.inscrito;
        } catch (err) {
          verificaciones[curso.id_curso] = false;
        }
      }

      setInscripciones(verificaciones);
    } catch (err) {
      console.error('Error al verificar inscripciones:', err);
    }
  };

  const handleInscribirse = async (cursoId, nombreCurso) => {
    if (!token) {
      toast.error('Debes iniciar sesión para inscribirte');
      return;
    }

    try {
      setInscribiendo(prev => ({ ...prev, [cursoId]: true }));
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post(API_ENDPOINTS.INSCRIPCIONES.INSCRIBIRSE, {
        id_curso: cursoId
      }, config);

      toast.success(`Te has inscrito en "${nombreCurso}" exitosamente`);
      setInscripciones(prev => ({ ...prev, [cursoId]: true }));
    } catch (err) {
      console.error('Error al inscribirse:', err);
      toast.error(err.response?.data?.error || 'Error al inscribirse en el curso');
    } finally {
      setInscribiendo(prev => ({ ...prev, [cursoId]: false }));
    }
  };

  const formatearPrecio = (precio, moneda = 'CLP') => {
    if (!precio || precio === 0) return 'Gratis';

    const formatoMoneda = {
      CLP: '$ ',
      USD: 'USD$ ',
      EUR: '€ '
    };

    return `${formatoMoneda[moneda] || formatoMoneda.CLP}${precio.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Por definir';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const obtenerBadgeNivel = (nivel) => {
    const estilos = {
      'básico': {
        bg: isDarkMode ? 'bg-green-500/20' : 'bg-green-100',
        text: isDarkMode ? 'text-green-400' : 'text-green-700',
        label: 'Básico'
      },
      'intermedio': {
        bg: isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100',
        text: isDarkMode ? 'text-yellow-400' : 'text-yellow-700',
        label: 'Intermedio'
      },
      'avanzado': {
        bg: isDarkMode ? 'bg-red-500/20' : 'bg-red-100',
        text: isDarkMode ? 'text-red-400' : 'text-red-700',
        label: 'Avanzado'
      }
    };

    return estilos[nivel] || estilos['básico'];
  };

  const obtenerIconoModalidad = (modalidad) => {
    switch (modalidad) {
      case 'online':
        return <Monitor size={16} className="inline" />;
      case 'presencial':
        return <MapPin size={16} className="inline" />;
      case 'mixto':
        return <Globe size={16} className="inline" />;
      default:
        return <BookOpen size={16} className="inline" />;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Loading State
  if (loading) {
    return (
      <motion.div
        key="cursos-loading"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="min-h-screen"
      >
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#8c5cff]/30 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#8c5cff] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Cargando cursos...
          </p>
        </div>
      </motion.div>
    );
  }

  // Error State
  if (error) {
    return (
      <motion.div
        key="cursos-error"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div
          className={`${
            isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
          } border rounded-2xl p-8 text-center backdrop-blur-xl`}
        >
          <AlertCircle size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          <p className={`mb-4 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
          <button
            onClick={obtenerCursos}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            <RefreshCw size={16} className="inline mr-2" />
            Reintentar
          </button>
        </div>
      </motion.div>
    );
  }

  // Empty State
  if (filteredCursos.length === 0 && !loading) {
    return (
      <motion.div
        key="cursos-empty"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          {['todos', 'básico', 'intermedio', 'avanzado'].map((nivel) => (
            <button
              key={nivel}
              onClick={() => setFiltroNivel(nivel)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filtroNivel === nivel
                  ? 'bg-[#8c5cff] text-white shadow-lg shadow-[#8c5cff]/30'
                  : isDarkMode
                  ? 'bg-[#1a1c22]/50 text-gray-400 hover:bg-[#1a1c22] border border-[#8c5cff]/20'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {nivel === 'todos' ? 'Todos' : nivel.charAt(0).toUpperCase() + nivel.slice(1)}
            </button>
          ))}
          {filtroNivel !== 'todos' && (
            <button
              onClick={() => setFiltroNivel('todos')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isDarkMode
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              <X size={16} className="inline mr-1" />
              Limpiar filtro
            </button>
          )}
        </div>

        <div
          className={`${
            isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
          } border rounded-2xl p-8 text-center backdrop-blur-xl`}
        >
          <BookOpen size={48} className="mx-auto text-[#8c5cff] mb-4" />
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {filtroNivel === 'todos'
              ? 'No hay cursos disponibles en este momento.'
              : `No hay cursos de nivel ${filtroNivel}.`}
          </p>
          {filtroNivel !== 'todos' && (
            <button
              onClick={() => setFiltroNivel('todos')}
              className="mt-4 px-6 py-2 bg-[#8c5cff] text-white rounded-lg hover:bg-[#7a4de6] transition-colors"
            >
              Ver todos los cursos
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Main Content
  return (
    <motion.div
      key="cursos"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Counter */}
      <div className="flex items-center justify-end mb-6">
        <div className={`px-4 py-2 rounded-lg ${
          isDarkMode ? 'bg-[#1a1c22]/50 border border-[#8c5cff]/20' : 'bg-white border border-purple-200'
        }`}>
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {filteredCursos.length} {filteredCursos.length === 1 ? 'curso' : 'cursos'}
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Filter size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
        {['todos', 'básico', 'intermedio', 'avanzado'].map((nivel) => (
          <button
            key={nivel}
            onClick={() => setFiltroNivel(nivel)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtroNivel === nivel
                ? 'bg-[#8c5cff] text-white shadow-lg shadow-[#8c5cff]/30'
                : isDarkMode
                ? 'bg-[#1a1c22]/50 text-gray-400 hover:bg-[#1a1c22] border border-[#8c5cff]/20'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {nivel === 'todos' ? 'Todos' : nivel.charAt(0).toUpperCase() + nivel.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCursos.map((curso, index) => {
            const badgeNivel = obtenerBadgeNivel(curso.nivel);
            const precioFinal = curso.precio_final || curso.precio;
            const tieneDescuento = curso.descuento > 0;

            return (
              <motion.div
                key={curso.id_curso}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: index * 0.05 }}
                className={`group cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20 hover:border-[#8c5cff]/50'
                    : 'bg-white border-purple-200 hover:border-purple-400'
                } border rounded-2xl overflow-hidden backdrop-blur-xl hover:shadow-xl hover:shadow-[#8c5cff]/10 transition-all duration-300`}
                onClick={() => {
                  onVerDetalleCurso(curso);
                }}
              >
                {/* Imagen/Gradient Header */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#8c5cff] via-[#6a3dcf] to-[#4e2d9a]">
                  {curso.imagen_portada ? (
                    <img
                      src={
                        curso.imagen_portada.startsWith('http')
                          ? curso.imagen_portada.includes('cloudinary')
                            ? `${curso.imagen_portada.split('upload')[0]}upload/c_auto,f_auto,q_80,w_600/${curso.imagen_portada.split('upload')[1]}`
                            : curso.imagen_portada
                          : `${API_URL}${curso.imagen_portada}`
                      }
                      alt={curso.nombre}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={56} className="text-white/40" />
                    </div>
                  )}

                  {/* Badge de Nivel */}
                  <div className="absolute top-3 right-3">
                    <span className={`${badgeNivel.bg} ${badgeNivel.text} px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm`}>
                      {badgeNivel.label}
                    </span>
                  </div>

                  {/* Badge de Descuento */}
                  {tieneDescuento && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Zap size={12} />
                        -{curso.descuento}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-5">
                  {/* Título y Código */}
                  <div className="mb-3">
                    <span className={`text-xs font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {curso.codigo_curso}
                    </span>
                    <h3 className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
                      {curso.nombre}
                    </h3>
                  </div>

                  {/* Descripción */}
                  <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {curso.descripcion || 'Curso de capacitación profesional para nutricionistas deportivos.'}
                  </p>

                  {/* Instructor */}
                  {curso.nombre_instructor && (
                    <div className={`flex items-center gap-2 mb-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Users size={14} />
                      <span>Instructor: {curso.nombre_instructor}</span>
                    </div>
                  )}

                  {/* Info Grid */}
                  <div className="space-y-2 mb-4">
                    {/* Duración */}
                    {curso.duracion_horas && (
                      <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock size={14} />
                        <span>{curso.duracion_horas} horas</span>
                      </div>
                    )}

                    {/* Modalidad */}
                    {curso.modalidad && (
                      <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {obtenerIconoModalidad(curso.modalidad)}
                        <span className="capitalize">{curso.modalidad}</span>
                      </div>
                    )}

                    {/* Fecha de inicio */}
                    {curso.fecha_inicio && (
                      <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Calendar size={14} />
                        <span>Inicio: {formatearFecha(curso.fecha_inicio)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer: Precio y Botón */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      {tieneDescuento && (
                        <p className={`text-xs line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatearPrecio(curso.precio, curso.moneda)}
                        </p>
                      )}
                      <p className={`text-xl font-bold ${isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'}`}>
                        {formatearPrecio(precioFinal, curso.moneda)}
                      </p>
                    </div>

                    {inscripciones[curso.id_curso] ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 rounded-lg text-sm font-medium"
                      >
                        <CheckCircle size={16} />
                        Inscrito
                      </motion.div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8c5cff] text-white rounded-lg hover:bg-[#7a4de6] transition-colors text-sm font-medium"
                        onClick={() => {
                          onVerDetalleCurso(curso);
                        }}
                      >
                        <BookOpen size={16} />
                        Ver detalles
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </motion.div>
  );
};

export default CursosSection;
