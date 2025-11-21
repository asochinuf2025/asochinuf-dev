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
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onOpen(documento)}
        className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg ${
          isDarkMode
            ? 'bg-[#0f1117] border border-[#8c5cff]/20 hover:border-[#8c5cff]/50'
            : 'bg-white border border-purple-200 hover:border-purple-400'
        }`}
      >
        {/* Miniatura más pequeña */}
        <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br">
          {documento.miniatura ? (
            <img
              src={`data:${documento.archivo_tipo || 'image/png'};base64,${documento.miniatura}`}
              alt={documento.titulo}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
              documento.categoria === 'Congreso'
                ? isDarkMode ? 'from-blue-900 to-blue-800' : 'from-blue-100 to-blue-200'
                : documento.categoria === 'Jornada'
                  ? isDarkMode ? 'from-red-900 to-red-800' : 'from-red-100 to-red-200'
                  : documento.categoria === 'Articulo'
                    ? isDarkMode ? 'from-green-900 to-green-800' : 'from-green-100 to-green-200'
                    : documento.categoria === 'Circular'
                      ? isDarkMode ? 'from-yellow-900 to-yellow-800' : 'from-yellow-100 to-yellow-200'
                      : documento.categoria === 'Workshop'
                        ? isDarkMode ? 'from-indigo-900 to-indigo-800' : 'from-indigo-100 to-indigo-200'
                        : documento.categoria === 'Seminario'
                          ? isDarkMode ? 'from-purple-900 to-purple-800' : 'from-purple-100 to-purple-200'
                          : isDarkMode ? 'from-[#8c5cff]/30 to-[#6a3adb]/30' : 'from-purple-100 to-purple-200'
            }`}>
              <div className="text-center">
                <div className="text-3xl mb-1">📄</div>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
                  {documento.archivo_nombre?.split('.').pop()?.toUpperCase() || 'DOC'}
                </p>
              </div>
            </div>
          )}

          {/* Badge de categoría superpuesto */}
          {documento.categoria && (
            <div className="absolute top-2 left-2">
              <span className={`text-xs font-bold px-2 py-1 rounded inline-block ${
                documento.categoria === 'Congreso'
                  ? 'bg-blue-500'
                  : documento.categoria === 'Jornada'
                    ? 'bg-red-500'
                    : documento.categoria === 'Articulo'
                      ? 'bg-green-500'
                      : documento.categoria === 'Circular'
                        ? 'bg-yellow-600'
                        : documento.categoria === 'Workshop'
                          ? 'bg-indigo-500'
                          : 'bg-purple-600'
              } text-white`}>
                {documento.categoria}
              </span>
            </div>
          )}
        </div>

        {/* Info compacta */}
        <div className="p-2 flex flex-col gap-1.5">
          <h3 className={`font-bold text-xs leading-tight line-clamp-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {documento.titulo}
          </h3>

          {/* Meta información */}
          <div className="flex flex-col gap-1.5 text-xs">
            {(documento.fecha_evento || documento.hora_evento) && (
              <div className="flex items-start gap-2">
                <div className="text-[#8c5cff] flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fecha</p>
                  <p className={`text-xs truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {documento.fecha_evento && new Date(documento.fecha_evento).toLocaleDateString('es-CL')}
                    {documento.fecha_evento && documento.hora_evento && ' • '}
                    {documento.hora_evento && `${documento.hora_evento.substring(0, 5)} hrs`}
                  </p>
                </div>
              </div>
            )}
            {documento.ubicacion && (
              <div className="flex items-start gap-2">
                <div className="text-[#8c5cff] flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ubicación</p>
                  <p className={`text-xs truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {documento.ubicacion}
                  </p>
                </div>
              </div>
            )}
            {documento.expositores && (
              <div className="flex items-start gap-2">
                <div className="text-[#8c5cff] flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM16 15v2h4v-2zM2 8a2 2 0 11-4 0 2 2 0 014 0zM6 15v2H2v-2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Expositores</p>
                  <p className={`text-xs truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {documento.expositores}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acciones */}
          <div className="flex gap-1 pt-1 border-t" style={{
            borderColor: isDarkMode ? 'rgba(140, 92, 255, 0.1)' : 'rgba(168, 85, 247, 0.2)'
          }}>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDescargar}
              title="Descargar"
              className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                isDarkMode
                  ? 'hover:bg-[#8c5cff]/20 text-[#8c5cff]'
                  : 'hover:bg-purple-100 text-purple-700'
              }`}
            >
              ⬇ Descargar
            </motion.button>

            {esAdmin && (
              <motion.button
                whileHover={!deleting ? { scale: 1.08 } : {}}
                whileTap={!deleting ? { scale: 0.95 } : {}}
                onClick={handleEliminar}
                disabled={deleting}
                title="Eliminar"
                className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                  deleting
                    ? 'opacity-75 cursor-not-allowed'
                    : isDarkMode
                      ? 'hover:bg-red-500/20 text-red-400'
                      : 'hover:bg-red-100 text-red-600'
                }`}
              >
                {deleting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando</span>
                  </>
                ) : (
                  <>
                    <span>🗑</span>
                    <span>Eliminar</span>
                  </>
                )}
              </motion.button>
            )}
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
