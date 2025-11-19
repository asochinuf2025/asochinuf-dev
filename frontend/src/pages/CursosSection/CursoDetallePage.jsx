import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Users, Star, Lock, Play, FileText, CheckCircle,
  ChevronDown, ShoppingCart, AlertCircle, Loader, BookOpen, DollarSign,
  Calendar, Video, Monitor, MapPin, Globe, Award, X, Download, FileText as FileIcon
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS, BASE as API_URL } from '../../config/apiConfig';
import { toast } from 'sonner';

const CursoDetallePage = ({ curso: cursoProp, onBack, containerVariants }) => {
  const { token, usuario, isDarkMode } = useAuth();
  const [curso, setCurso] = useState(null);
  const [detalles, setDetalles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tieneAcceso, setTieneAcceso] = useState(false);
  const [expandedSecciones, setExpandedSecciones] = useState({});
  const [buyingState, setBuyingState] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [leccionSeleccionada, setLeccionSeleccionada] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState(null);

  // Cargar datos del curso
  useEffect(() => {
    if (cursoProp) {
      setCurso(cursoProp);
      cargarDatosCurso();
      verificarPagoExitoso();
    }
  }, [cursoProp?.id_curso, token]);

  const cargarDatosCurso = async () => {
    try {
      setLoading(true);

      if (!cursoProp) return;

      // Obtener detalles del curso CON TOKEN para verificar acceso
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      console.log(`🔐 Enviando token: ${token ? 'Sí' : 'No'}, Usuario autenticado: ${!!token}`);

      const detallesResponse = await axios.get(`${API_URL}/api/detalles-cursos/${cursoProp.id_curso}`, config);
      setDetalles(detallesResponse.data);
      setTieneAcceso(detallesResponse.data.accesoInfo.tieneAcceso);

      console.log(`✓ Curso cargado - tieneAcceso: ${detallesResponse.data.accesoInfo.tieneAcceso}`, detallesResponse.data.accesoInfo);

      // Expandir primera sección por defecto
      if (detallesResponse.data.secciones.length > 0) {
        setExpandedSecciones({
          [detallesResponse.data.secciones[0].numero]: true
        });
      }
    } catch (error) {
      console.error('Error al cargar datos del curso:', error);
      toast.error('Error al cargar el curso');
    } finally {
      setLoading(false);
    }
  };

  const verificarPagoExitoso = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pagoStatus = params.get('pago');
      const cursoIdParam = params.get('curso');

      if (pagoStatus && cursoIdParam && cursoProp && parseInt(cursoIdParam) === cursoProp.id_curso) {
        setProcessingPayment(true);

        if (pagoStatus === 'success') {
          await otorgarAcceso();
          toast.success('¡Compra completada! El curso ahora aparece en "Mis Cursos"');
        } else if (pagoStatus === 'pending') {
          toast.info('Tu pago está siendo procesado. Por favor, intenta acceder más tarde.');
        } else if (pagoStatus === 'failure') {
          toast.error('El pago no fue completado. Por favor, intenta de nuevo.');
        }

        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (error) {
      console.error('Error verificando pago exitoso:', error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const otorgarAcceso = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Calcular precio final con descuento si aplica
      const precioFinal = curso?.precio_final || curso?.precio;

      await axios.post(
        `${API_URL}/api/detalles-cursos/acceso/otorgar`,
        {
          usuarioId: usuario.id,
          idCurso: cursoProp.id_curso,
          tipoAcceso: 'comprado',
          precioPagado: precioFinal,
          referenciaPago: 'mercado_pago'
        },
        config
      );

      await cargarDatosCurso();
    } catch (error) {
      console.error('Error al otorgar acceso:', error);
      if (error.response?.status === 400) {
        await cargarDatosCurso();
      }
    }
  };

  const toggleSeccion = (numeroSeccion) => {
    setExpandedSecciones(prev => ({
      ...prev,
      [numeroSeccion]: !prev[numeroSeccion]
    }));
  };

  const handleComprar = async () => {
    if (!token) {
      toast.error('Debes iniciar sesión para comprar');
      return;
    }

    setBuyingState(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Calcular precio final con descuento si aplica
      const precioFinal = curso.precio_final || curso.precio;

      const response = await axios.post(
        `${API_URL}/api/detalles-cursos/${cursoProp.id_curso}/pago`,
        {
          monto: precioFinal,
          moneda: curso.moneda || 'CLP',
          tipoAcceso: 'pago',
          precioPagado: precioFinal
        },
        config
      );

      if (response.data?.data) {
        const isProduction = process.env.NODE_ENV === 'production';
        const checkoutUrl = isProduction
          ? response.data.data.init_point
          : (response.data.data.sandbox_init_point || response.data.data.init_point);

        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          toast.error('No se pudo obtener la URL de pago');
        }
      }
    } catch (error) {
      console.error('Error al procesar compra:', error);
      toast.error(error.response?.data?.error || 'Error al procesar la compra');
    } finally {
      setBuyingState(false);
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

  const obtenerIconoModalidad = (modalidad) => {
    switch (modalidad) {
      case 'online':
        return <Monitor size={20} className="text-[#8c5cff]" />;
      case 'presencial':
        return <MapPin size={20} className="text-[#8c5cff]" />;
      case 'mixto':
        return <Globe size={20} className="text-[#8c5cff]" />;
      default:
        return <BookOpen size={20} className="text-[#8c5cff]" />;
    }
  };

  const obtenerIconoContenido = (tipo) => {
    switch (tipo) {
      case 'video':
        return <Video size={20} className="text-blue-500" />;
      case 'pdf':
        return <FileIcon size={20} className="text-red-500" />;
      case 'articulo':
        return <FileText size={20} className="text-green-500" />;
      case 'quiz':
        return <CheckCircle size={20} className="text-purple-500" />;
      default:
        return <Play size={20} className="text-[#8c5cff]" />;
    }
  };

  const obtenerNombreTipoContenido = (tipo) => {
    const nombres = {
      'video': 'Video',
      'pdf': 'Documento PDF',
      'articulo': 'Artículo',
      'quiz': 'Quiz'
    };
    return nombres[tipo] || tipo;
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center">
          <Loader size={40} className={`animate-spin mx-auto mb-4 ${isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'}`} />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (!curso || !detalles) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle size={40} className={`mx-auto mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Curso no encontrado</p>
        </div>
      </div>
    );
  }

  const precioFinal = curso.precio_final || curso.precio;
  const tieneDescuento = curso.descuento > 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Botón de atrás */}
      <button
        onClick={onBack}
        className={`flex items-center gap-2 font-medium transition-colors ${
          isDarkMode
            ? 'text-gray-400 hover:text-white'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <ArrowLeft size={20} />
        Volver a Cursos
      </button>

      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 overflow-hidden bg-gradient-to-br from-[#8c5cff] via-[#6a3dcf] to-[#4e2d9a]">
        {curso.imagen_portada ? (
          <img
            src={
              curso.imagen_portada.startsWith('http')
                ? curso.imagen_portada.includes('cloudinary')
                  ? `${curso.imagen_portada.split('upload')[0]}upload/c_auto,f_auto,q_80,w_1200/${curso.imagen_portada.split('upload')[1]}`
                  : curso.imagen_portada
                : `${API_URL}${curso.imagen_portada}`
            }
            alt={curso.nombre}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={80} className="text-white/20" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 sm:gap-4 mb-4 flex-wrap">
              {tieneDescuento && (
                <span className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <Award size={14} className="sm:w-4 sm:h-4" />
                  -{curso.descuento}%
                </span>
              )}
              <span className="bg-[#8c5cff]/70 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold capitalize text-sm sm:text-base">
                {curso.nivel}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 line-clamp-2">{curso.nombre}</h1>
            <p className="text-gray-200 text-sm sm:text-base line-clamp-2">{curso.descripcion}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {curso.duracion_horas && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#1a1c22] border border-[#8c5cff]/20' : 'bg-gray-50 border border-purple-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-[#8c5cff]" />
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Duración</span>
              </div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{curso.duracion_horas} horas</p>
            </div>
          )}

          {curso.modalidad && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#1a1c22] border border-[#8c5cff]/20' : 'bg-gray-50 border border-purple-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {obtenerIconoModalidad(curso.modalidad)}
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Modalidad</span>
              </div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} style={{ textTransform: 'capitalize' }}>
                {curso.modalidad}
              </p>
            </div>
          )}

          {curso.fecha_inicio && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#1a1c22] border border-[#8c5cff]/20' : 'bg-gray-50 border border-purple-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={20} className="text-[#8c5cff]" />
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Inicio</span>
              </div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{formatearFecha(curso.fecha_inicio)}</p>
            </div>
          )}
        </div>

        {/* Content Grid - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12 order-2 lg:order-1">
            {/* Contenido del Curso */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Contenido del Curso
              </h2>

              <div className="space-y-4">
                {detalles.secciones.map((seccion) => (
                  <motion.div
                    key={seccion.id_seccion}
                    className={`border rounded-lg overflow-hidden ${
                      isDarkMode ? 'border-[#8c5cff]/20 bg-[#1a1c22]/50' : 'border-purple-200 bg-white'
                    }`}
                  >
                    <button
                      onClick={() => toggleSeccion(seccion.numero)}
                      className={`w-full p-4 flex items-center justify-between hover:bg-[#8c5cff]/10 transition-colors ${
                        isDarkMode ? 'hover:bg-[#1a1c22]' : 'hover:bg-purple-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Video size={20} className="text-[#8c5cff] flex-shrink-0" />
                        <div className="text-left min-w-0">
                          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                            {seccion.titulo}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {seccion.lecciones?.length || 0} lecciones
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`transition-transform flex-shrink-0 ${expandedSecciones[seccion.numero] ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedSecciones[seccion.numero] && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className={`border-t ${isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'}`}
                        >
                          <div className="p-4 space-y-2">
                            {seccion.lecciones?.map((leccion, idx) => (
                              <motion.button
                                key={leccion.id_leccion || idx}
                                onClick={() => {
                                  if (tieneAcceso) {
                                    setLeccionSeleccionada(leccion);
                                    setSeccionActiva(seccion.numero);
                                  }
                                }}
                                disabled={!tieneAcceso}
                                className={`w-full p-4 rounded-lg flex items-start gap-3 cursor-pointer text-left transition-all duration-200 ${
                                  tieneAcceso
                                    ? isDarkMode
                                      ? 'bg-[#1a1c22] hover:bg-[#252730] border border-transparent hover:border-[#8c5cff]/30'
                                      : 'bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-purple-300'
                                    : isDarkMode
                                    ? 'bg-[#1a1c22]/50 opacity-50 cursor-not-allowed border border-transparent'
                                    : 'bg-gray-50/50 opacity-50 cursor-not-allowed border border-transparent'
                                } ${leccionSeleccionada?.id_leccion === leccion.id_leccion && tieneAcceso ? isDarkMode ? 'bg-[#8c5cff]/20 border-[#8c5cff]/50' : 'bg-purple-100 border-purple-300' : ''}`}
                              >
                                <div className="flex-shrink-0 mt-1">
                                  {tieneAcceso ? (
                                    <>
                                      {leccion.tipo_contenido === 'video' && <Video size={20} className="text-blue-500" />}
                                      {leccion.tipo_contenido === 'pdf' && <FileIcon size={20} className="text-red-500" />}
                                      {leccion.tipo_contenido === 'articulo' && <FileText size={20} className="text-green-500" />}
                                      {leccion.tipo_contenido === 'quiz' && <CheckCircle size={20} className="text-purple-500" />}
                                      {!['video', 'pdf', 'articulo', 'quiz'].includes(leccion.tipo_contenido) && <Play size={20} className="text-[#8c5cff]" />}
                                    </>
                                  ) : (
                                    <Lock size={20} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} break-words`}>
                                    {leccion.titulo}
                                  </p>
                                  {tieneAcceso && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-xs font-medium px-2 py-1 rounded ${isDarkMode ? 'bg-[#8c5cff]/20 text-[#8c5cff]' : 'bg-purple-100 text-purple-700'}`}>
                                        {obtenerNombreTipoContenido(leccion.tipo_contenido)}
                                      </span>
                                      {leccion.duracionMinutos && (
                                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                          {leccion.duracionMinutos} min
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {!tieneAcceso && leccion.duracionMinutos && (
                                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                      {leccion.duracionMinutos} min
                                    </p>
                                  )}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Requisitos */}
            {curso.requisitos && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Requisitos
                </h2>
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-[#1a1c22] border border-[#8c5cff]/20' : 'bg-gray-50 border border-purple-200'}`}>
                  <ul className="space-y-3">
                    {Array.isArray(curso.requisitos) ? (
                      curso.requisitos.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle size={20} className="text-[#8c5cff] flex-shrink-0 mt-0.5" />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{req}</span>
                        </li>
                      ))
                    ) : typeof curso.requisitos === 'string' && curso.requisitos.includes('\n') ? (
                      curso.requisitos.split('\n').filter(line => line.trim()).map((req, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle size={20} className="text-[#8c5cff] flex-shrink-0 mt-0.5" />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{req.trim()}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-[#8c5cff] flex-shrink-0 mt-0.5" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{curso.requisitos}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Lo que Aprenderás */}
            {curso.lo_que_aprenderas && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Lo que Aprenderás
                </h2>
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-[#1a1c22] border border-[#8c5cff]/20' : 'bg-gray-50 border border-purple-200'}`}>
                  <ul className="space-y-3">
                    {Array.isArray(curso.lo_que_aprenderas) ? (
                      curso.lo_que_aprenderas.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Award size={20} className="text-[#8c5cff] flex-shrink-0 mt-0.5" />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item}</span>
                        </li>
                      ))
                    ) : typeof curso.lo_que_aprenderas === 'string' && curso.lo_que_aprenderas.includes('\n') ? (
                      curso.lo_que_aprenderas.split('\n').filter(line => line.trim()).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Award size={20} className="text-[#8c5cff] flex-shrink-0 mt-0.5" />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item.trim()}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-3">
                        <Award size={20} className="text-[#8c5cff] flex-shrink-0 mt-0.5" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{curso.lo_que_aprenderas}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar - Responsive */}
          {!tieneAcceso && (
            <div className="lg:col-span-1 order-1 lg:order-2">
              <motion.div
                className={`sticky top-32 p-6 rounded-lg ${
                  isDarkMode ? 'bg-[#1a1c22] border border-[#8c5cff]/20' : 'bg-white border border-purple-200 shadow-lg'
                }`}
              >
                {/* Precio */}
                <div className="mb-6">
                  {tieneDescuento && (
                    <p className={`text-sm line-through mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formatearPrecio(curso.precio, curso.moneda)}
                    </p>
                  )}
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'}`}>
                    {formatearPrecio(precioFinal, curso.moneda)}
                  </p>
                </div>

                {/* Instructor */}
                {curso.nombre_instructor && (
                  <div className={`mb-6 pb-6 border-b ${isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'}`}>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Instructor</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {curso.nombre_instructor}
                    </p>
                  </div>
                )}

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleComprar}
                  disabled={buyingState}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    buyingState
                      ? isDarkMode
                        ? 'bg-[#8c5cff]/50 text-white/50'
                        : 'bg-purple-300 text-white/50'
                      : isDarkMode
                      ? 'bg-[#8c5cff] text-white hover:bg-[#7a4de6]'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {buyingState ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Comprar Curso
                    </>
                  )}
                </motion.button>

                {/* Info adicional */}
                <div className={`mt-6 pt-6 space-y-3 border-t ${isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'}`}>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-[#8c5cff]" />
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Acceso de por vida</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-[#8c5cff]" />
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Certificado de finalización</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-[#8c5cff]" />
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Contenido descargable</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Lección */}
      <AnimatePresence>
        {leccionSeleccionada && tieneAcceso && (
          <motion.div
            key="leccion-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setLeccionSeleccionada(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col ${
                isDarkMode ? 'bg-[#0f1419]' : 'bg-white'
              }`}
            >
              {/* Header del Modal */}
              <div className={`flex items-center justify-between p-6 border-b ${
                isDarkMode ? 'border-[#8c5cff]/20 bg-[#1a1c22]' : 'border-purple-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {leccionSeleccionada.tipo_contenido === 'video' && <Video size={24} className="text-blue-500 flex-shrink-0" />}
                  {leccionSeleccionada.tipo_contenido === 'pdf' && <FileIcon size={24} className="text-red-500 flex-shrink-0" />}
                  {leccionSeleccionada.tipo_contenido === 'articulo' && <FileText size={24} className="text-green-500 flex-shrink-0" />}
                  {leccionSeleccionada.tipo_contenido === 'quiz' && <CheckCircle size={24} className="text-purple-500 flex-shrink-0" />}
                  <div className="min-w-0">
                    <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                      {leccionSeleccionada.titulo}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {obtenerNombreTipoContenido(leccionSeleccionada.tipo_contenido)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLeccionSeleccionada(null)}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                    isDarkMode ? 'hover:bg-[#252730]' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={24} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                </button>
              </div>

              {/* Contenido */}
              <div className={`flex-1 overflow-y-auto p-6 ${isDarkMode ? 'bg-[#0f1419]' : 'bg-white'}`}>
                {/* Área de reproducción/contenido */}
                <div className={`mb-6 aspect-video rounded-xl overflow-hidden ${
                  isDarkMode ? 'bg-[#1a1c22]' : 'bg-gray-100'
                } flex items-center justify-center`}>
                  {leccionSeleccionada.tipo_contenido === 'video' ? (
                    leccionSeleccionada.url_contenido ? (
                      <iframe
                        src={leccionSeleccionada.url_contenido}
                        title={leccionSeleccionada.titulo}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <div className="text-center">
                        <Video size={48} className={isDarkMode ? 'text-gray-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Video no disponible</p>
                      </div>
                    )
                  ) : leccionSeleccionada.tipo_contenido === 'pdf' ? (
                    leccionSeleccionada.url_contenido ? (
                      <iframe
                        src={leccionSeleccionada.url_contenido}
                        title={leccionSeleccionada.titulo}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="text-center">
                        <FileIcon size={48} className={isDarkMode ? 'text-gray-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>PDF no disponible</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center">
                      <FileText size={48} className={isDarkMode ? 'text-gray-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Contenido cargándose...</p>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                {leccionSeleccionada.leccion_descripcion && (
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Descripción
                    </h3>
                    <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {leccionSeleccionada.leccion_descripcion}
                    </p>
                  </div>
                )}

                {/* Detalles */}
                <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                  isDarkMode ? 'bg-[#1a1c22]' : 'bg-gray-50'
                }`}>
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tipo de contenido
                    </p>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {obtenerNombreTipoContenido(leccionSeleccionada.tipo_contenido)}
                    </p>
                  </div>
                  {leccionSeleccionada.duracion_minutos && (
                    <div>
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Duración
                      </p>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {leccionSeleccionada.duracion_minutos} minutos
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer del Modal */}
              <div className={`flex items-center justify-between p-6 border-t ${
                isDarkMode ? 'border-[#8c5cff]/20 bg-[#1a1c22]' : 'border-purple-200 bg-gray-50'
              }`}>
                <div className="flex-1" />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLeccionSeleccionada(null)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-[#8c5cff] text-white hover:bg-[#7a4de6]'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CursoDetallePage;
