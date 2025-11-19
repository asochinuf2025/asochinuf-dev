import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Clock, Users, Star, Lock, Play, FileText, CheckCircle,
  ChevronDown, ShoppingCart, AlertCircle, Loader
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS, BASE as API_URL } from '../../config/apiConfig';
import { toast } from 'sonner';

const CursoDetalleModal = ({ curso, isOpen, onClose, isDarkMode }) => {
  const { token, usuario } = useAuth();
  const [detalles, setDetalles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tieneAcceso, setTieneAcceso] = useState(false);
  const [expandedSecciones, setExpandedSecciones] = useState({});
  const [activeTab, setActiveTab] = useState('contenido');
  const [buyingState, setBuyingState] = useState(false);

  useEffect(() => {
    if (isOpen && curso) {
      cargarDetallesCurso();
    }
  }, [isOpen, curso?.id_curso]);

  const cargarDetallesCurso = async () => {
    try {
      setLoading(true);

      // Obtener detalles del curso
      const response = await axios.get(
        `${API_URL}/api/detalles-cursos/${curso.id_curso}`
      );

      setDetalles(response.data);
      setTieneAcceso(response.data.accesoInfo.tieneAcceso);

      // Expandir primera sección por defecto
      if (response.data.secciones.length > 0) {
        setExpandedSecciones({
          [response.data.secciones[0].numero]: true
        });
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      toast.error('Error al cargar los detalles del curso');
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

  const handleComprar = async () => {
    if (!token) {
      toast.error('Debes iniciar sesión para comprar');
      return;
    }

    setBuyingState(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.post(
        `${API_URL}/api/detalles-cursos/${curso.id_curso}/pago`,
        {},
        config
      );

      if (response.data?.data) {
        const checkoutUrl = response.data.data.sandbox_init_point || response.data.data.init_point;

        if (!checkoutUrl) {
          toast.error('No se pudo obtener la URL de pago');
          setBuyingState(false);
          return;
        }

        // Redirigir a Mercado Pago
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Error al iniciar pago:', error);
      const errorMsg = error.response?.data?.error || 'Error al iniciar el pago. Por favor intenta de nuevo.';
      toast.error(errorMsg);
      setBuyingState(false);
    }
  };

  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case 'video':
        return <Play size={16} />;
      case 'articulo':
        return <FileText size={16} />;
      case 'pdf':
        return <FileText size={16} />;
      case 'quiz':
        return <CheckCircle size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getTotalDuracion = () => {
    if (!detalles) return 0;
    let total = 0;
    detalles.secciones.forEach(seccion => {
      seccion.lecciones.forEach(leccion => {
        if (leccion.duracion) total += leccion.duracion;
      });
    });
    return total;
  };

  const getTotalLecciones = () => {
    if (!detalles) return 0;
    let total = 0;
    detalles.secciones.forEach(seccion => {
      total += seccion.lecciones.length;
    });
    return total;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen py-8 px-4"
          >
            {/* Contenido Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`mx-auto max-w-6xl rounded-3xl overflow-hidden ${
                isDarkMode ? 'bg-[#1a1c22]' : 'bg-white'
              }`}
            >
              {/* Header con imagen */}
              <div className="relative h-64 md:h-96 bg-gradient-to-br from-[#8c5cff] to-[#4e2d9a] overflow-hidden">
                {curso?.imagen_portada && (
                  <img
                    src={curso.imagen_portada}
                    alt={curso.nombre}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Botón cerrar */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition"
                >
                  <X size={24} />
                </button>

                {/* Overlay con info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {curso?.nombre}
                  </h1>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 text-white">
                    <div className="flex items-center gap-2">
                      <Clock size={20} />
                      <span>{getTotalDuracion()} mins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={20} />
                      <span>{getTotalLecciones()} lecciones</span>
                    </div>
                    {curso?.precio && (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">
                          ${curso.precio.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 md:p-8">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="animate-spin mr-3" />
                    <span>Cargando contenido del curso...</span>
                  </div>
                ) : (
                  <>
                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 border-b border-[#8c5cff]/20">
                      {['contenido', 'aprenderás', 'requisitos', 'descripcion'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-3 px-4 font-semibold transition capitalize ${
                            activeTab === tab
                              ? 'text-[#8c5cff] border-b-2 border-[#8c5cff]'
                              : isDarkMode
                              ? 'text-gray-400 hover:text-gray-300'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          {tab === 'aprenderás' ? 'Lo que aprenderás' : tab}
                        </button>
                      ))}
                    </div>

                    {/* Contenido por Tab */}
                    <AnimatePresence mode="wait">
                      {/* TAB: Contenido */}
                      {activeTab === 'contenido' && (
                        <motion.div
                          key="contenido"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          {!tieneAcceso && (
                            <div className={`p-4 rounded-lg border ${
                              isDarkMode
                                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                            } flex items-start gap-3`}>
                              <Lock size={20} className="mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold mb-1">Contenido bloqueado</p>
                                <p className="text-sm">Compra el curso para acceder a todo el contenido</p>
                              </div>
                            </div>
                          )}

                          {detalles?.secciones.map(seccion => (
                            <div
                              key={seccion.numero}
                              className={`border rounded-lg overflow-hidden ${
                                isDarkMode
                                  ? 'border-[#8c5cff]/20 bg-[#2a2c33]'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              {/* Header Sección */}
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
                                    <h3 className={`font-bold ${
                                      isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {seccion.titulo}
                                    </h3>
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
                                      isDarkMode
                                        ? 'border-[#8c5cff]/20'
                                        : 'border-gray-200'
                                    }`}
                                  >
                                    {seccion.lecciones.map(leccion => (
                                      <div
                                        key={leccion.numero}
                                        className={`px-6 py-4 flex items-start gap-4 ${
                                          isDarkMode
                                            ? 'border-t border-[#8c5cff]/10 hover:bg-[#1a1c22]'
                                            : 'border-t border-gray-100 hover:bg-white'
                                        } transition`}
                                      >
                                        {/* Icono Tipo */}
                                        <div className={`mt-1 ${
                                          leccion.bloqueado
                                            ? 'text-gray-400'
                                            : 'text-[#8c5cff]'
                                        }`}>
                                          {leccion.bloqueado ? (
                                            <Lock size={20} />
                                          ) : (
                                            getIconoTipo(leccion.tipo)
                                          )}
                                        </div>

                                        {/* Info Lección */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-2">
                                            <h4 className={`font-semibold ${
                                              isDarkMode
                                                ? 'text-gray-200'
                                                : 'text-gray-900'
                                            }`}>
                                              {leccion.titulo}
                                            </h4>
                                            {leccion.bloqueado && (
                                              <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                                                isDarkMode
                                                  ? 'bg-gray-700 text-gray-300'
                                                  : 'bg-gray-200 text-gray-700'
                                              }`}>
                                                Bloqueado
                                              </span>
                                            )}
                                          </div>

                                          {leccion.descripcion && (
                                            <p className={`text-sm mt-1 ${
                                              isDarkMode
                                                ? 'text-gray-400'
                                                : 'text-gray-600'
                                            }`}>
                                              {leccion.descripcion}
                                            </p>
                                          )}

                                          {leccion.duracion && (
                                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                              <Clock size={14} />
                                              <span>{leccion.duracion} min</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </motion.div>
                      )}

                      {/* TAB: Lo que aprenderás */}
                      {activeTab === 'aprenderás' && (
                        <motion.div
                          key="aprenderás"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="prose prose-sm max-w-none"
                        >
                          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            Este curso te enseñará conceptos fundamentales y avanzados de nutrición deportiva aplicada al fútbol profesional.
                          </p>
                          <ul className={`list-disc pl-5 space-y-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <li>Evaluación antropométrica avanzada</li>
                            <li>Protocolos de nutrición pre y post partido</li>
                            <li>Estrategias de suplementación basadas en evidencia</li>
                            <li>Manejo de hidratación en deportes de alta exigencia</li>
                            <li>Recuperación y prevención de lesiones</li>
                          </ul>
                        </motion.div>
                      )}

                      {/* TAB: Requisitos */}
                      {activeTab === 'requisitos' && (
                        <motion.div
                          key="requisitos"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <ul className={`list-disc pl-5 space-y-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <li>Conocimientos básicos de nutrición</li>
                            <li>Experiencia en el ámbito deportivo</li>
                            <li>Acceso a internet para las clases en línea</li>
                          </ul>
                        </motion.div>
                      )}

                      {/* TAB: Descripción */}
                      {activeTab === 'descripcion' && (
                        <motion.div
                          key="descripcion"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                        >
                          <p>{curso?.descripcion}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* Footer con botón comprar */}
              {!tieneAcceso && (
                <div className={`border-t ${
                  isDarkMode
                    ? 'border-[#8c5cff]/20 bg-[#2a2c33]'
                    : 'border-gray-200 bg-gray-50'
                } p-6 md:p-8 flex items-center justify-between`}>
                  <div>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Precio del curso
                    </p>
                    <p className="text-3xl font-bold text-[#8c5cff]">
                      ${curso?.precio?.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={handleComprar}
                    disabled={buyingState}
                    className="px-8 py-3 bg-[#8c5cff] hover:bg-[#7a4de6] text-white rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {buyingState ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Comprar ahora
                      </>
                    )}
                  </button>
                </div>
              )}

              {tieneAcceso && (
                <div className={`border-t ${
                  isDarkMode
                    ? 'border-green-500/20 bg-green-500/10'
                    : 'border-green-200 bg-green-50'
                } p-6 md:p-8 flex items-center gap-3`}>
                  <CheckCircle size={24} className="text-green-500" />
                  <div>
                    <p className={`font-bold ${
                      isDarkMode ? 'text-green-400' : 'text-green-700'
                    }`}>
                      ✓ Ya tienes acceso a este curso
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-green-300' : 'text-green-600'
                    }`}>
                      Acceso ilimitado a todo el contenido
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CursoDetalleModal;
