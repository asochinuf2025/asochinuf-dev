import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, Calendar, User, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';

const DocumentCard = ({ documento, onDeleted, esAdmin }) => {
  const { isDarkMode, token } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDescargar = () => {
    // Descargar el PDF desde el endpoint con parámetro download=true
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

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`h-full rounded-xl border overflow-hidden transition-all duration-300 flex flex-col ${
        isDarkMode
          ? 'bg-[#0f1117] border-[#8c5cff]/20 hover:border-[#8c5cff]/40'
          : 'bg-white border-purple-200 hover:border-purple-400 hover:shadow-lg'
      }`}
    >
      {/* Miniatura del documento */}
      {documento.miniatura ? (
        <div className={`w-full h-48 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} overflow-hidden`}>
          <img
            src={`data:image/png;base64,${documento.miniatura}`}
            alt={documento.titulo}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`w-full h-48 ${isDarkMode ? 'bg-gradient-to-br from-[#8c5cff]/30 to-[#6a3adb]/30' : 'bg-gradient-to-br from-purple-100 to-purple-200'} flex items-center justify-center`}>
          <div className="text-center">
            <div className="text-4xl mb-2">📄</div>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              {documento.archivo_nombre?.split('.').pop()?.toUpperCase() || 'DOC'}
            </p>
          </div>
        </div>
      )}

      {/* Header con color de categoría */}
      <div
        className={`h-1 ${
          documento.categoria === 'Actualización'
            ? 'bg-blue-500'
            : documento.categoria === 'Reglamento'
              ? 'bg-red-500'
              : documento.categoria === 'Guía'
                ? 'bg-green-500'
                : 'bg-[#8c5cff]'
        }`}
      />

      {/* Contenido */}
      <div className="p-5 space-y-4 flex flex-col flex-1">
        {/* Título y Categoría */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={`font-bold text-lg leading-tight flex-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
              title={documento.titulo}
            >
              {documento.titulo.length > 30
                ? documento.titulo.substring(0, 30) + '...'
                : documento.titulo}
            </h3>
          </div>

          {documento.categoria && (
            <div className="flex items-center gap-2 mb-3">
              <Tag size={14} className="text-[#8c5cff]" />
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                isDarkMode
                  ? 'bg-[#8c5cff]/20 text-[#8c5cff]'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {documento.categoria}
              </span>
            </div>
          )}

          {documento.descripcion && (
            <p className={`text-sm leading-relaxed ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {documento.descripcion.length > 80
                ? documento.descripcion.substring(0, 80) + '...'
                : documento.descripcion}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className={`space-y-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>{formatDate(documento.fecha_creacion)}</span>
          </div>
          {documento.nombre && (
            <div className="flex items-center gap-2">
              <User size={14} />
              <span>{documento.nombre} {documento.apellido || ''}</span>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-2 pt-2 border-t" style={{
          borderColor: isDarkMode ? 'rgba(140, 92, 255, 0.2)' : 'rgba(168, 85, 247, 0.2)'
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDescargar}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#8c5cff] text-white font-semibold text-sm hover:bg-[#7a4cde] transition-colors"
          >
            <Download size={16} />
            Descargar
          </motion.button>

          {esAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEliminar}
              disabled={deleting}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                deleting
                  ? 'opacity-50 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              <Trash2 size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DocumentCard;
