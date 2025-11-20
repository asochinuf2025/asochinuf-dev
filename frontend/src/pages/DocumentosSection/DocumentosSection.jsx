import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';
import DocumentCard from './DocumentCard';
import DocumentUpload from './DocumentUpload';
import DocumentViewer from './DocumentViewer';

const DocumentosSection = ({ containerVariants, itemVariants }) => {
  const { isDarkMode, token, usuario } = useAuth();
  const [documentos, setDocumentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Cargar documentos y categorías
  useEffect(() => {
    cargarDatos();
  }, [selectedCategoria]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar documentos
      const params = selectedCategoria !== 'todas' ? { categoria: selectedCategoria } : {};
      const docsResponse = await axios.get(API_ENDPOINTS.DOCUMENTOS.GET_ALL, { params });
      setDocumentos(docsResponse.data.documentos || []);

      // Cargar categorías solo una vez
      if (categorias.length === 0) {
        const categResponse = await axios.get(API_ENDPOINTS.DOCUMENTOS.GET_CATEGORIAS);
        setCategorias(categResponse.data.categorias || []);
      }
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentoCreado = () => {
    setShowUpload(false);
    cargarDatos();
    toast.success('Evento creado exitosamente');
  };

  const handleDocumentoEliminado = (id) => {
    setDocumentos(documentos.filter(d => d.id !== id));
    setIsViewerOpen(false);
    toast.success('Evento eliminado');
  };

  const handleOpenDocument = (doc) => {
    setSelectedDocument(doc);
    setIsViewerOpen(true);
  };

  // Filtrar documentos por búsqueda
  const documentosFiltrados = documentos.filter(doc =>
    doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.descripcion && doc.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const esAdminONutricionista = usuario?.tipo_perfil === 'admin' || usuario?.tipo_perfil === 'nutricionista';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText size={32} className="text-[#8c5cff]" />
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Eventos
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Accede a los últimos eventos y seminarios
            </p>
          </div>
        </div>

        {esAdminONutricionista && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8c5cff] text-white font-semibold hover:bg-[#7a4cde] transition-colors"
          >
            <Plus size={20} />
            Subir Evento
          </motion.button>
        )}
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-xl shadow-2xl p-6 ${
                isDarkMode
                  ? 'bg-[#0f1117] border border-[#8c5cff]/20'
                  : 'bg-white border border-purple-200'
              }`}
            >
              {/* Header del Modal */}
              <div className="mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Subir Evento
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Carga un nuevo evento con sus detalles
                </p>
              </div>

              {/* Form */}
              <DocumentUpload
                onSuccess={handleDocumentoCreado}
                onCancel={() => setShowUpload(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buscador y Filtros */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div className={`relative col-span-1 sm:col-span-2 rounded-lg border ${
          isDarkMode
            ? 'bg-[#0f1117] border-[#8c5cff]/20'
            : 'bg-white border-purple-200'
        }`}>
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border-0 outline-none ${
              isDarkMode
                ? 'bg-[#0f1117] text-white placeholder-gray-500'
                : 'bg-white text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        {/* Filtro de Categorías */}
        <div className={`rounded-lg border ${
          isDarkMode
            ? 'bg-[#0f1117] border-[#8c5cff]/20'
            : 'bg-white border-purple-200'
        }`}>
          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border-0 outline-none font-medium flex items-center gap-2 ${
              isDarkMode
                ? 'bg-[#0f1117] text-white'
                : 'bg-white text-gray-900'
            } ${
              selectedCategoria === 'Congreso' ? (isDarkMode ? '[&_*]:text-blue-400' : '[&_*]:text-blue-600')
              : selectedCategoria === 'Jornada' ? (isDarkMode ? '[&_*]:text-red-400' : '[&_*]:text-red-600')
              : selectedCategoria === 'Articulo' ? (isDarkMode ? '[&_*]:text-green-400' : '[&_*]:text-green-600')
              : selectedCategoria === 'Circular' ? (isDarkMode ? '[&_*]:text-yellow-400' : '[&_*]:text-yellow-600')
              : selectedCategoria === 'Workshop' ? (isDarkMode ? '[&_*]:text-indigo-400' : '[&_*]:text-indigo-600')
              : selectedCategoria === 'Seminario' ? (isDarkMode ? '[&_*]:text-purple-400' : '[&_*]:text-purple-600')
              : ''
            }`}
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Documentos Grid */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="animate-spin">
            <FileText size={32} className="text-[#8c5cff]" />
          </div>
        </motion.div>
      ) : documentosFiltrados.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className={`text-center py-12 rounded-xl border-2 border-dashed ${
            isDarkMode
              ? 'border-[#8c5cff]/20 bg-[#0f1117]'
              : 'border-purple-200 bg-purple-50'
          }`}
        >
          <FileText size={48} className="mx-auto text-gray-400 mb-3" />
          <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No hay eventos
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Los eventos aparecerán aquí'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {documentosFiltrados.map((doc) => (
              <motion.div
                key={doc.id}
                variants={itemVariants}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <DocumentCard
                  documento={doc}
                  onOpen={handleOpenDocument}
                  isDarkMode={isDarkMode}
                  esAdmin={usuario?.tipo_perfil === 'admin'}
                  onDeleted={handleDocumentoEliminado}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal Viewer */}
      {selectedDocument && (
        <DocumentViewer
          documento={selectedDocument}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          onDeleted={handleDocumentoEliminado}
          esAdmin={usuario?.tipo_perfil === 'admin'}
        />
      )}
    </motion.div>
  );
};

export default DocumentosSection;
