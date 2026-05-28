import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Clock, Users, Lock, Play, FileText, CheckCircle,
  ChevronDown, UserPlus, GraduationCap, BookOpen, Loader
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const formatearPrecio = (precio, moneda = 'CLP') => {
  if (!precio || precio === 0) return 'Gratis';
  const prefijos = { CLP: '$ ', USD: 'USD$ ', EUR: '€ ' };
  return `${prefijos[moneda] || prefijos.CLP}${Number(precio).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const CursoPreviewModal = ({ curso, isOpen, onClose, onRegistrarse }) => {
  const [detalles, setDetalles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSecciones, setExpandedSecciones] = useState({});

  useEffect(() => {
    if (isOpen && curso) {
      setLoading(true);
      setDetalles(null);
      fetch(`${API_URL}/api/detalles-cursos/${curso.id}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          setDetalles(data);
          if (data.secciones?.length > 0) {
            setExpandedSecciones({ [data.secciones[0].numero]: true });
          }
        })
        .catch(() => setDetalles(null))
        .finally(() => setLoading(false));
    }
  }, [isOpen, curso?.id]);

  const toggleSeccion = (num) =>
    setExpandedSecciones(prev => ({ ...prev, [num]: !prev[num] }));

  const totalLecciones = detalles?.secciones?.reduce(
    (acc, s) => acc + (s.lecciones?.length || 0), 0
  ) || 0;

  const totalMinutos = detalles?.secciones?.reduce(
    (acc, s) => acc + s.lecciones?.reduce((a, l) => a + (l.duracion || 0), 0), 0
  ) || 0;

  return (
    <AnimatePresence>
      {isOpen && curso && <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center py-8 px-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-3xl bg-[#1a1c22] rounded-3xl overflow-hidden border border-[#8c5cff]/30 shadow-2xl shadow-[#8c5cff]/20"
        >
          {/* Header */}
          <div className="relative h-52 md:h-64 bg-gradient-to-br from-[#8c5cff] to-[#4e2d9a] overflow-hidden">
            {curso.imagen_portada && (
              <img
                src={curso.imagen_portada}
                alt={curso.title}
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition z-10"
            >
              <X size={20} />
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                {curso.level && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#8c5cff]/80 text-white">
                    {curso.level}
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {curso.title}
              </h2>
              {(totalLecciones > 0 || totalMinutos > 0 || curso.duration) && (
                <div className="flex flex-wrap gap-4 mt-3 text-white/80 text-sm">
                  {totalLecciones > 0 && (
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={15} /> {totalLecciones} lecciones
                    </span>
                  )}
                  {totalMinutos > 0 ? (
                    <span className="flex items-center gap-1.5">
                      <Clock size={15} /> {totalMinutos} min
                    </span>
                  ) : curso.duration ? (
                    <span className="flex items-center gap-1.5">
                      <Clock size={15} /> {curso.duration}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Descripción */}
            {curso.description && (
              <p className="text-gray-300 leading-relaxed">{curso.description}</p>
            )}

            {/* Secciones del curso */}
            <div>
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <GraduationCap size={20} className="text-[#8c5cff]" />
                Contenido del curso
              </h3>

              {loading ? (
                <div className="flex items-center gap-3 text-gray-400 py-4">
                  <Loader size={18} className="animate-spin" />
                  <span>Cargando contenido...</span>
                </div>
              ) : detalles?.secciones?.length > 0 ? (
                <div className="space-y-2">
                  {detalles.secciones.map(seccion => (
                    <div
                      key={seccion.numero}
                      className="border border-[#8c5cff]/20 rounded-xl overflow-hidden bg-[#2a2c33]"
                    >
                      <button
                        onClick={() => toggleSeccion(seccion.numero)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#1a1c22] transition text-left"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown
                            size={18}
                            className={`text-[#8c5cff] transition-transform ${expandedSecciones[seccion.numero] ? 'rotate-180' : ''}`}
                          />
                          <div>
                            <p className="text-white font-semibold">{seccion.titulo}</p>
                            <p className="text-gray-500 text-xs">{seccion.lecciones?.length || 0} lecciones</p>
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedSecciones[seccion.numero] && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-[#8c5cff]/10"
                          >
                            {seccion.lecciones?.map(leccion => (
                              <div
                                key={leccion.numero}
                                className="px-5 py-3 flex items-center gap-3 border-t border-[#8c5cff]/10 first:border-t-0"
                              >
                                <Lock size={15} className="text-gray-500 flex-shrink-0" />
                                <span className="text-gray-400 text-sm">{leccion.titulo}</span>
                                {leccion.duracion && (
                                  <span className="ml-auto text-xs text-gray-600 flex-shrink-0">
                                    {leccion.duracion} min
                                  </span>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Contenido del curso próximamente disponible.</p>
              )}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="border-t border-[#8c5cff]/20 bg-[#2a2c33] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-gray-400 text-sm">Precio del curso</p>
              <p className="text-2xl font-bold text-[#8c5cff]">
                {formatearPrecio(detalles?.curso?.precio || detalles?.curso?.precio_final, detalles?.curso?.moneda)}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onRegistrarse}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] hover:from-[#7a4de6] hover:to-[#5a2dbf] text-white font-bold rounded-full shadow-lg shadow-[#8c5cff]/30 transition-all"
            >
              <UserPlus size={20} />
              Regístrate para inscribirte
            </motion.button>
          </div>
        </motion.div>}
    </AnimatePresence>
  );
};

export default CursoPreviewModal;
