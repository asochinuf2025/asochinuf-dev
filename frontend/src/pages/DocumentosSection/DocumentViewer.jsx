import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';

const DocumentViewer = ({ documento, isOpen, onClose, onDeleted, esAdmin }) => {
  const { isDarkMode, token } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDescargar = () => {
    window.location.href = `${API_ENDPOINTS.DOCUMENTOS.GET_ONE(documento.id)}?download=true`;
    toast.success('Descarga iniciada');
  };

  const handleEliminar = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      return;
    }

    try {
      setDeleting(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(API_ENDPOINTS.DOCUMENTOS.DELETE(documento.id), config);
      onDeleted(documento.id);
      onClose();
      toast.success('Documento eliminado');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar documento');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    if (bytes > 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl ${
              isDarkMode ? 'bg-[#0f1117]' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
            }`}>
              <div className="flex-1">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {documento.titulo}
                </h2>
                {documento.categoria && (
                  <span className={`inline-block mt-2 px-3 py-1 rounded text-sm font-semibold ${
                    isDarkMode
                      ? 'bg-[#8c5cff]/20 text-[#8c5cff]'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {documento.categoria}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-[#8c5cff]/20 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Miniatura grande */}
            <div className={`w-full h-80 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
              {documento.miniatura ? (
                <img
                  src={`data:image/png;base64,${documento.miniatura}`}
                  alt={documento.titulo}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Vista previa no disponible
                  </p>
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className={`p-6 space-y-4 border-t ${isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'}`}>
              {/* Descripción */}
              {documento.descripcion && (
                <div>
                  <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Descripción
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {documento.descripcion}
                  </p>
                </div>
              )}

              {/* Info del archivo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Nombre del archivo
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {documento.archivo_nombre}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Tamaño
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatSize(documento.archivo_tamaño)}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Subido por
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {documento.nombre} {documento.apellido}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Fecha
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatDate(documento.fecha_creacion)}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className={`flex gap-3 p-6 border-t ${isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDescargar}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#8c5cff] text-white font-semibold hover:bg-[#7a4cde] transition-colors"
              >
                <Download size={18} />
                Descargar
              </motion.button>

              {esAdmin && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEliminar}
                  disabled={deleting}
                  className={`px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    deleting
                      ? 'opacity-50 cursor-not-allowed'
                      : isDarkMode
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  <Trash2 size={18} />
                  Eliminar
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isDarkMode
                    ? 'bg-[#8c5cff]/20 text-[#8c5cff] hover:bg-[#8c5cff]/30'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                Cerrar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DocumentViewer;
