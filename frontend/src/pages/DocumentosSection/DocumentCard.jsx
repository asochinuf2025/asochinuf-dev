import React from 'react';
import { motion } from 'framer-motion';

const DocumentCard = ({ documento, onOpen, isDarkMode }) => {
  return (
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

      {/* Título */}
      <div className="p-4">
        <h3 className={`font-bold text-sm leading-tight line-clamp-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {documento.titulo}
        </h3>
        <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Click para ver detalles
        </p>
      </div>
    </motion.div>
  );
};

export default DocumentCard;
