import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ConfirmDialog';

const DocumentCard = ({ documento, onOpen, isDarkMode, esAdmin, onDeleted }) => {
  const { token } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDescargar = (e) => {
    e.stopPropagation();
    window.location.href = `${API_ENDPOINTS.DOCUMENTOS.GET_ONE(documento.id)}?download=true`;
    toast.success('Descarga iniciada');
  };

  const handleEliminarConfirmado = async () => {
    try {
      setDeleting(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(API_ENDPOINTS.DOCUMENTOS.DELETE(documento.id), config);
      onDeleted(documento.id);
      toast.success('Documento eliminado');
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar documento');
    } finally {
      setDeleting(false);
    }
  };

  const handleEliminar = (e) => {
    e.stopPropagation();
    setShowConfirmDialog(true);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onOpen(documento)}
        className={`cursor-pointer rounded-xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl ${
          isDarkMode
            ? 'bg-[#0f1117] border border-[#8c5cff]/20 hover:border-[#8c5cff]/50'
            : 'bg-white border border-purple-200 hover:border-purple-400'
        }`}
      >
      {/* Miniatura */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-br">
        {documento.miniatura ? (
          <img
            src={`data:image/png;base64,${documento.miniatura}`}
            alt={documento.titulo}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
            isDarkMode
              ? 'from-[#8c5cff]/30 to-[#6a3adb]/30'
              : 'from-purple-100 to-purple-200'
          }`}>
            <div className="text-center">
              <div className="text-5xl mb-2">📄</div>
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                {documento.archivo_nombre?.split('.').pop()?.toUpperCase() || 'DOC'}
              </p>
            </div>
          </div>
        )}

        {/* Overlay con categoría */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          {documento.categoria && (
            <span className={`text-xs font-semibold px-2 py-1 rounded inline-block ${
              documento.categoria === 'Actualización'
                ? 'bg-blue-500'
                : documento.categoria === 'Reglamento'
                  ? 'bg-red-500'
                  : documento.categoria === 'Guía'
                    ? 'bg-green-500'
                    : 'bg-[#8c5cff]'
            } text-white`}>
              {documento.categoria}
            </span>
          )}
        </div>
      </div>

      {/* Título y Botones */}
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-bold text-sm leading-tight line-clamp-2 flex-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {documento.titulo}
          </h3>
          {/* Action Buttons - Icon Only */}
          <div className="flex gap-1 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDescargar}
              title="Descargar documento"
              className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                isDarkMode
                  ? 'hover:bg-[#8c5cff]/20 text-[#8c5cff]'
                  : 'hover:bg-purple-100 text-purple-700'
              }`}
            >
              <Download size={16} />
            </motion.button>

            {esAdmin && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEliminar}
                disabled={deleting}
                title="Eliminar documento"
                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                  deleting
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode
                      ? 'hover:bg-red-500/20 text-red-400'
                      : 'hover:bg-red-100 text-red-600'
                }`}
              >
                <Trash2 size={16} />
              </motion.button>
            )}
          </div>
        </div>
      </div>
      </motion.div>

      {/* Confirm Dialog - Fuera del card para que sea modal global */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Eliminar documento"
        message={`¿Estás seguro de que deseas eliminar "${documento.titulo}"?`}
        onConfirm={handleEliminarConfirmado}
        onCancel={() => setShowConfirmDialog(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDanger={true}
      />
    </>
  );
};

export default DocumentCard;
