import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Users, Star, Lock, Play, FileText, CheckCircle,
  ChevronDown, ShoppingCart, AlertCircle, Loader, BookOpen, DollarSign,
  Calendar, Video, Monitor, MapPin, Globe, Award
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
      const detallesResponse = await axios.get(`${API_URL}/api/detalles-cursos/${cursoProp.id_curso}`, config);
      setDetalles(detallesResponse.data);
      setTieneAcceso(detallesResponse.data.accesoInfo.tieneAcceso);

      console.log(`✓ Curso cargado - tieneAcceso: ${detallesResponse.data.accesoInfo.tieneAcceso}`);

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
                          <div className="p-4 space-y-3">
                            {seccion.lecciones?.map((leccion, idx) => (
                              <motion.div
                                key={leccion.id_leccion || idx}
                                className={`p-3 rounded flex items-start gap-3 ${
                                  tieneAcceso
                                    ? isDarkMode
                                      ? 'bg-[#1a1c22] hover:bg-[#252730]'
                                      : 'bg-gray-50 hover:bg-gray-100'
                                    : isDarkMode
                                    ? 'bg-[#1a1c22]/50 opacity-50'
                                    : 'bg-gray-50/50 opacity-50'
                                } transition-colors`}
                              >
                                {tieneAcceso ? (
                                  <Play size={16} className="text-[#8c5cff] flex-shrink-0 mt-1" />
                                ) : (
                                  <Lock size={16} className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} flex-shrink-0 mt-1`} />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} break-words`}>
                                    {leccion.titulo}
                                  </p>
                                  {leccion.duracionMinutos && (
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                      {leccion.duracionMinutos} min
                                    </p>
                                  )}
                                </div>
                              </motion.div>
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
              {tieneAcceso ? (
                <motion.button
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full bg-green-500/20 text-green-500 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors"
                  disabled
                >
                  <CheckCircle size={20} />
                  Tienes acceso
                </motion.button>
              ) : (
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
              )}

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
        </div>
      </div>
    </motion.div>
  );
};

export default CursoDetallePage;
