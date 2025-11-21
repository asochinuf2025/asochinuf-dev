import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';

// pdfjs-dist will be loaded dynamically when needed
let pdfjsLib = null;

const DocumentViewer = ({ documento, isOpen, onClose }) => {
  const { isDarkMode, token } = useAuth();
  const [pdfPages, setPdfPages] = useState([]);
  const [pdfCache, setPdfCache] = useState(null); // Cache del PDF cargado
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);


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

  // Detectar cambios en tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load PDF when viewer opens or documento changes
  useEffect(() => {
    if (isOpen && documento && documento.archivo_tipo?.includes('pdf')) {
      loadPdfDocument();
    } else {
      // Limpiar todo cuando se cierra el modal
      setPdfCache(null);
      setPdfPages([]);
      setPdfError(null);
      setCurrentPage(1);
      setTotalPages(0);
      setZoom(100);
    }
  }, [isOpen, documento]);

  const loadPdfDocument = async () => {
    try {
      setLoadingPdf(true);
      setPdfError(null);
      // Limpiar cache y estados cuando se carga un nuevo PDF
      setPdfCache(null);
      setPdfPages([]);
      setCurrentPage(1);
      setTotalPages(0);
      setZoom(100);

      // Lazy load pdfjs-dist only when PDF viewer is opened
      if (!pdfjsLib) {
        const pdfModule = await import('pdfjs-dist');
        pdfjsLib = pdfModule.default || pdfModule;
        // Configurar worker source
        if (pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        }
      }

      // Descargar el PDF
      const response = await axios.get(`${API_ENDPOINTS.DOCUMENTOS.GET_ONE(documento.id)}?preview=true`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'arraybuffer'
      });

      // Convertir a Uint8Array
      const uint8Array = new Uint8Array(response.data);
      const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
      setPdfCache(pdf);
      setTotalPages(pdf.numPages);

      // Render first page
      const page = await pdf.getPage(1);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: 2 }); // Always render at 2x for quality

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      setPdfPages([canvas.toDataURL()]);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading PDF:', error);
      setPdfError('No se pudo cargar el PDF. Intenta descargando el archivo.');
    } finally {
      setLoadingPdf(false);
    }
  };

  const renderPage = async (pageNum) => {
    try {
      if (!pdfCache) return;

      const page = await pdfCache.getPage(pageNum);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: 2 }); // Always render at 2x for quality

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      setCurrentPage(pageNum);
      setPdfPages(prev => {
        const newPages = [...prev];
        newPages[pageNum - 1] = canvas.toDataURL();
        return newPages;
      });
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      renderPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      renderPage(currentPage - 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 20, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 20, 50));
  };

  const isPdf = documento?.archivo_tipo?.includes('pdf');

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
            className={`w-full max-w-lg h-[90vh] flex flex-col rounded-xl overflow-hidden shadow-2xl ${
              isDarkMode ? 'bg-[#0f1117]' : 'bg-white'
            }`}
          >
            {/* Header - With Controls */}
            <div className={`flex items-center justify-between gap-3 p-3 border-b ${
              isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
            }`}>
              <h2 className={`text-sm font-semibold truncate flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {documento.titulo}
              </h2>

              {/* Page Controls - Only show for PDF */}
              {isPdf && totalPages > 0 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-1 rounded-lg transition-colors ${
                      currentPage === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : isDarkMode
                          ? 'hover:bg-[#8c5cff]/20 text-gray-400'
                          : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </motion.button>

                  <div className={`text-xs font-semibold px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentPage}/{totalPages}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-1 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? 'opacity-50 cursor-not-allowed'
                        : isDarkMode
                          ? 'hover:bg-[#8c5cff]/20 text-gray-400'
                          : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </motion.button>
                </div>
              )}

              {/* Zoom Controls - Only show for PDF */}
              {isPdf && pdfPages.length > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleZoomOut}
                    disabled={zoom === 50}
                    className={`p-1 rounded-lg transition-colors ${
                      zoom === 50
                        ? 'opacity-50 cursor-not-allowed'
                        : isDarkMode
                          ? 'hover:bg-[#8c5cff]/20 text-gray-400'
                          : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <ZoomOut size={16} />
                  </motion.button>

                  <div className={`text-xs font-semibold px-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {zoom}%
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleZoomIn}
                    disabled={zoom === 200}
                    className={`p-1 rounded-lg transition-colors ${
                      zoom === 200
                        ? 'opacity-50 cursor-not-allowed'
                        : isDarkMode
                          ? 'hover:bg-[#8c5cff]/20 text-gray-400'
                          : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <ZoomIn size={16} />
                  </motion.button>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors flex-shrink-0 ${
                  isDarkMode
                    ? 'hover:bg-[#8c5cff]/20 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview Section - Take all available space */}
            <div className={`flex-1 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center relative`}>
              {isPdf ? (
                <div className="w-full h-full flex flex-col">
                  {isMobile ? (
                    // Vista estándar para móviles - Embed nativo de PDF
                    <div className="w-full h-full flex flex-col">
                      <iframe
                        src={`${API_ENDPOINTS.DOCUMENTOS.GET_ONE(documento.id)}?preview=true#toolbar=0&navpanes=0`}
                        className="flex-1 w-full border-0"
                        title={documento.titulo}
                      />
                      <div className={`flex items-center justify-center gap-2 p-3 border-t ${
                        isDarkMode ? 'border-[#8c5cff]/20 bg-[#0f1117]' : 'border-purple-200 bg-white'
                      }`}>
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          💡 Consejo: Descarga el archivo para mejor visualización
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Vista con zoom y navegación para desktop
                    <>
                      {loadingPdf ? (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="animate-spin">
                            <div className="w-8 h-8 border-4 border-[#8c5cff] border-t-transparent rounded-full"></div>
                          </div>
                        </div>
                      ) : pdfError ? (
                        <div className="flex-1 flex items-center justify-center text-center">
                          <div>
                            <div className="text-6xl mb-4">⚠️</div>
                            <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {pdfError}
                            </p>
                          </div>
                        </div>
                      ) : pdfPages.length > 0 && pdfPages[currentPage - 1] ? (
                        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                          <img
                            src={pdfPages[currentPage - 1]}
                            alt={`Page ${currentPage}`}
                            className="max-w-full max-h-full object-contain"
                            style={{ transform: `scale(${zoom / 100})` }}
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="animate-spin">
                            <div className="w-8 h-8 border-4 border-[#8c5cff] border-t-transparent rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : documento.miniatura ? (
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

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DocumentViewer;
