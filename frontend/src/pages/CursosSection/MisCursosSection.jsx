import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Calendar,
  Users,
  DollarSign,
  Monitor,
  MapPin,
  Globe,
  CheckCircle,
  Loader,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS, BASE as API_URL } from '../../config/apiConfig';
import { toast } from 'sonner';

const MisCursosSection = ({ containerVariants, onVerDetalleCurso }) => {
  const { isDarkMode, token } = useAuth();
  const [misCursos, setMisCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarMisCursos();
  }, []);

  const cargarMisCursos = async () => {
    try {
      setLoading(true);
      setError('');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.INSCRIPCIONES.MIS_CURSOS, config);
      setMisCursos(response.data);
    } catch (err) {
      console.error('Error al cargar mis cursos:', err);
      setError('Error al cargar tus cursos inscritos');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarInscripcion = async (cursoId, nombreCurso) => {
    if (!window.confirm(`¿Estás seguro de que deseas cancelar tu inscripción en "${nombreCurso}"?`)) {
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(API_ENDPOINTS.INSCRIPCIONES.CANCELAR(cursoId), config);
      toast.success('Inscripción cancelada exitosamente');
      cargarMisCursos();
    } catch (err) {
      console.error('Error al cancelar inscripción:', err);
      toast.error(err.response?.data?.error || 'Error al cancelar la inscripción');
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

  // Loading State
  if (loading) {
    return (
      <motion.div
        key="mis-cursos-loading"
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
            Cargando tus cursos...
          </p>
        </div>
      </motion.div>
    );
  }

  // Error State
  if (error) {
    return (
      <motion.div
        key="mis-cursos-error"
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
            onClick={cargarMisCursos}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Reintentar
          </button>
        </div>
      </motion.div>
    );
  }

  // Empty State
  if (misCursos.length === 0 && !loading) {
    return (
      <motion.div
        key="mis-cursos-empty"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div
          className={`${
            isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
          } border rounded-2xl p-8 text-center backdrop-blur-xl`}
        >
          <BookOpen size={48} className="mx-auto text-[#8c5cff] mb-4" />
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Aún no te has inscrito en ningún curso
          </p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Explora el catálogo de cursos disponibles y comienza tu aprendizaje
          </p>
        </div>
      </motion.div>
    );
  }

  // Main Content
  return (
    <motion.div
      key="mis-cursos"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Counter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle size={20} className="text-green-500" />
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {misCursos.length} {misCursos.length === 1 ? 'curso inscrito' : 'cursos inscritos'}
          </span>
        </div>
      </div>

      {/* Grid de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {misCursos.map((curso, index) => {
            const badgeNivel = obtenerBadgeNivel(curso.nivel);
            const precioFinal = curso.precio_final || curso.precio;
            const tieneDescuento = curso.descuento > 0;

            return (
              <motion.div
                key={curso.id_curso}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`group ${
                  isDarkMode
                    ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20 hover:border-[#8c5cff]/50'
                    : 'bg-white border-purple-200 hover:border-purple-400'
                } border rounded-2xl overflow-hidden backdrop-blur-xl hover:shadow-xl hover:shadow-[#8c5cff]/10 transition-all duration-300`}
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

                  {/* Badge Inscrito */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle size={12} />
                      Inscrito
                    </span>
                  </div>
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

                    {/* Fecha de inscripción */}
                    <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Calendar size={14} />
                      <span>Inscrito: {formatearFecha(curso.fecha_inscripcion)}</span>
                    </div>
                  </div>

                  {/* Footer: Botones */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {onVerDetalleCurso && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onVerDetalleCurso(curso)}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                          isDarkMode
                            ? 'bg-[#8c5cff] text-white hover:bg-[#7a4de6]'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        <BookOpen size={16} className="inline mr-1" />
                        Ver Detalles
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCancelarInscripcion(curso.id_curso, curso.nombre)}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                        isDarkMode
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <Trash2 size={16} className="inline mr-1" />
                      Cancelar
                    </motion.button>
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

export default MisCursosSection;
