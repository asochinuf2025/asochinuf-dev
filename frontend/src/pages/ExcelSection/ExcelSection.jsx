import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, CheckCircle, AlertCircle, X, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';

// v2 - Actualización de tabla de historial
const ExcelSection = ({ containerVariants }) => {
  const { isDarkMode, token, usuario } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPlantelId, setSelectedPlantelId] = useState('');
  const [selectedCategoriaId, setSelectedCategoriaId] = useState('');
  const [selectedLigaId, setSelectedLigaId] = useState('');
  const [planteles, setPlanteles] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ligas, setLigas] = useState([]);
  const [loadingPlanteles, setLoadingPlanteles] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingLigas, setLoadingLigas] = useState(false);
  const [selectedPlantel, setSelectedPlantel] = useState('todos');

  // Funciones memoizadas para cargar datos - v3
  const cargarHistorial = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingHistory(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.EXCEL.HISTORY, config);
      setUploadHistory(response.data);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      // No mostrar error para el historial, es secundario
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  const cargarPlanteles = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingPlanteles(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.PLANTELES.GET_ACTIVOS, config);
      setPlanteles(response.data);
    } catch (err) {
      console.error('Error al cargar planteles:', err);
      // No mostrar error si simplemente no hay planteles
      setPlanteles([]);
    } finally {
      setLoadingPlanteles(false);
    }
  }, [token]);

  const cargarCategoriasDelPlantel = useCallback(async (plantelId) => {
    if (!token || !plantelId) {
      setCategorias([]);
      setLigas([]);
      return;
    }
    try {
      setLoadingCategorias(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Cargar categorías específicas del plantel
      const response = await axios.get(
        `${API_ENDPOINTS.LIGAS.BASE}/plantel/${plantelId}/categorias`,
        config
      );
      setCategorias(response.data);
      setSelectedCategoriaId('');
      setLigas([]);
      setSelectedLigaId('');
    } catch (err) {
      console.error('Error al cargar categorías del plantel:', err);
      setCategorias([]);
      setLigas([]);
    } finally {
      setLoadingCategorias(false);
    }
  }, [token]);

  const cargarLigasDelPlantelCategoria = useCallback(async (plantelId, categoriaId) => {
    if (!token || !plantelId || !categoriaId) {
      setLigas([]);
      return;
    }
    try {
      setLoadingLigas(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Cargar ligas específicas de la combinación plantel-categoría
      const response = await axios.get(
        `${API_ENDPOINTS.LIGAS.BASE}/plantel/${plantelId}/categoria/${categoriaId}/ligas`,
        config
      );
      setLigas(response.data);
      setSelectedLigaId('');
    } catch (err) {
      console.error('Error al cargar ligas:', err);
      setLigas([]);
    } finally {
      setLoadingLigas(false);
    }
  }, [token]);

  // Cargar historial de cargas y planteles al montar
  useEffect(() => {
    if (token) {
      cargarHistorial();
      cargarPlanteles();
    }
  }, [token, cargarHistorial, cargarPlanteles]);

  // Cargar categorías cuando se selecciona un plantel
  useEffect(() => {
    if (selectedPlantelId) {
      cargarCategoriasDelPlantel(selectedPlantelId);
    }
  }, [selectedPlantelId, cargarCategoriasDelPlantel]);

  // Cargar ligas cuando se selecciona una categoría
  useEffect(() => {
    if (selectedPlantelId && selectedCategoriaId) {
      cargarLigasDelPlantelCategoria(selectedPlantelId, selectedCategoriaId);
    }
  }, [selectedPlantelId, selectedCategoriaId, cargarLigasDelPlantelCategoria]);

  // Validar que sea nutricionista o admin
  if (usuario?.tipo_perfil !== 'nutricionista' && usuario?.tipo_perfil !== 'admin') {
    return (
      <motion.div
        key="excel"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-6"
      >
        <div
          className={`p-8 rounded-2xl border text-center ${
            isDarkMode ? 'bg-[#1a1c22]/50 border-red-500/20' : 'bg-red-50 border-red-200'
          }`}
        >
          <AlertCircle
            size={48}
            className={`mx-auto mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}
          />
          <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Acceso Restringido
          </h3>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Solo los nutricionistas y administradores pueden cargar archivos Excel.
          </p>
        </div>
      </motion.div>
    );
  }

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Solo se permiten archivos Excel (.xlsx, .xls)');
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Solo se permiten archivos Excel (.xlsx, .xls)');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Selecciona un archivo primero');
      return;
    }

    if (!selectedPlantelId) {
      setError('Selecciona un plantel antes de cargar el archivo');
      return;
    }

    if (!selectedCategoriaId) {
      setError('Selecciona una categoría antes de cargar el archivo');
      return;
    }

    if (!selectedLigaId) {
      setError('Selecciona una liga antes de cargar el archivo');
      return;
    }

    return new Promise((resolve) => {
      setIsUploading(true);
      setError('');
      setUploadResult(null);
      setUploadProgress(1); // Iniciar en 1% inmediatamente

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('plantel_id', selectedPlantelId);
      formData.append('categoria_id', selectedCategoriaId);
      formData.append('liga_id', selectedLigaId);

      const xhr = new XMLHttpRequest();

      // Simular progreso mientras se procesa en el servidor
      // Incrementa de forma gradual pero realista
      let simulatedProgress = 1;
      const simulationInterval = setInterval(() => {
        if (simulatedProgress < 95) {
          // Incremento decreciente: más rápido al inicio, más lento después
          const increment = Math.random() * (95 - simulatedProgress) * 0.1;
          simulatedProgress = Math.min(simulatedProgress + increment, 95);
          setUploadProgress(Math.round(simulatedProgress));
        }
      }, 300);

      // Evento de progreso de carga del archivo
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const uploadPercent = (e.loaded / e.total) * 0.3; // 0-30% para upload
          const totalPercent = 1 + uploadPercent; // Comienza desde 1%
          setUploadProgress(Math.round(totalPercent));
          simulatedProgress = totalPercent;
        }
      });

      // Evento de carga completada
      xhr.addEventListener('load', async () => {
        clearInterval(simulationInterval);

        if (xhr.status === 201 || xhr.status === 200) {
          try {
            // Llegar a 95% antes de procesar respuesta
            setUploadProgress(95);

            const response = JSON.parse(xhr.responseText);
            setUploadResult(response);
            setSelectedFile(null);

            // Llegar a 100% al terminar
            setUploadProgress(100);

            // Recargar historial
            await cargarHistorial();

            // Limpiar resultado después de 5 segundos
            setTimeout(() => {
              setUploadResult(null);
              setUploadProgress(0);
              // Limpiar los selects después de una carga exitosa
              setSelectedPlantelId('');
              setSelectedCategoriaId('');
              setSelectedLigaId('');
            }, 5000);
          } catch (err) {
            setError('Error al procesar la respuesta del servidor');
            console.error('Error parsing response:', err);
            setUploadProgress(0);
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            setError(errorData.error || 'Error al cargar el archivo');
          } catch {
            setError('Error al cargar el archivo');
          }
          setUploadProgress(0);
        }

        setIsUploading(false);
        resolve();
      });

      // Evento de error
      xhr.addEventListener('error', () => {
        clearInterval(simulationInterval);
        setError('Error de conexión al cargar el archivo');
        setUploadProgress(0);
        setIsUploading(false);
        resolve();
      });

      // Evento de cancelación
      xhr.addEventListener('abort', () => {
        clearInterval(simulationInterval);
        setError('Carga cancelada');
        setUploadProgress(0);
        setIsUploading(false);
        resolve();
      });

      xhr.open('POST', API_ENDPOINTS.EXCEL.UPLOAD);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  };

  return (
    <motion.div
      key="excel"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Cargar Excel Antropométrico
        </h2>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Carga datos de mediciones antropométricas desde archivos Excel. Solo se aceptan archivos
          con la estructura estándar (.xlsx).
        </p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/20 border border-red-500 text-red-600 p-4 rounded-lg flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError('')}>
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg border flex items-start gap-3 ${
              isDarkMode
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : 'bg-green-100 border-green-300 text-green-700'
            }`}
          >
            <CheckCircle size={24} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold">Carga exitosa</h4>
              <p className="text-sm mt-1">
                Plantel: <strong>{uploadResult.plantel}</strong> • Liga: <strong>{uploadResult.liga}</strong> • Registros insertados:{' '}
                <strong>{uploadResult.registrosInsertados}</strong>
                {uploadResult.registrosDuplicados > 0 && (
                  <>
                    {' '}
                    • Duplicados: <strong>{uploadResult.registrosDuplicados}</strong>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selector de Plantel, Categoría y Liga */}
      <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-[#1a1c22]/50 border border-[#8c5cff]/20' : 'bg-white/50 border border-purple-200'} mb-6`}>
        <label className={`block text-sm font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          1. Selecciona Plantel, Categoría y Liga *
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Selector de Plantel */}
          <div className="min-w-0">
            <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Plantel
            </label>
            {loadingPlanteles ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader className="animate-spin" size={20} />
                <span className="text-sm">Cargando planteles...</span>
              </div>
            ) : planteles.length === 0 ? (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  No hay planteles disponibles. Un administrador debe crear planteles primero.
                </p>
              </div>
            ) : (
              <select
                value={selectedPlantelId}
                onChange={(e) => setSelectedPlantelId(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-[#1a1c22] border-[#8c5cff]/30 text-white'
                    : 'bg-white border-purple-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
              >
                <option value="">Seleccionar plantel...</option>
                {planteles.map((plantel) => (
                  <option key={plantel.id} value={plantel.id}>
                    {plantel.nombre} ({plantel.division})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selector de Categoría */}
          <div>
            <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Categoría
            </label>
            <div className="relative">
              <select
                disabled={!selectedPlantelId || loadingCategorias}
                value={selectedCategoriaId}
                onChange={(e) => setSelectedCategoriaId(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                  !selectedPlantelId || loadingCategorias
                    ? isDarkMode
                      ? 'bg-[#1a1c22]/50 border-[#8c5cff]/10 text-gray-600 cursor-not-allowed opacity-60'
                      : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    : isDarkMode
                    ? 'bg-[#1a1c22] border-[#8c5cff]/30 text-white hover:border-[#8c5cff]/50 cursor-pointer'
                    : 'bg-white border-purple-300 text-gray-900 hover:border-purple-500 cursor-pointer'
                } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
              >
                <option value="">Seleccionar categoría...</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              {loadingCategorias && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader className="animate-spin text-[#8c5cff]" size={16} />
                </div>
              )}
            </div>
          </div>

          {/* Selector de Liga */}
          <div>
            <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Liga
            </label>
            <div className="relative">
              <select
                disabled={!selectedCategoriaId || loadingLigas}
                value={selectedLigaId}
                onChange={(e) => setSelectedLigaId(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                  !selectedCategoriaId || loadingLigas
                    ? isDarkMode
                      ? 'bg-[#1a1c22]/50 border-[#8c5cff]/10 text-gray-600 cursor-not-allowed opacity-60'
                      : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    : isDarkMode
                    ? 'bg-[#1a1c22] border-[#8c5cff]/30 text-white hover:border-[#8c5cff]/50 cursor-pointer'
                    : 'bg-white border-purple-300 text-gray-900 hover:border-purple-500 cursor-pointer'
                } focus:outline-none focus:ring-2 focus:ring-[#8c5cff]`}
              >
                <option value="">Seleccionar liga...</option>
                {ligas.map((liga) => (
                  <option key={liga.id} value={liga.id}>
                    {liga.nombre}
                  </option>
                ))}
              </select>
              {loadingLigas && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader className="animate-spin text-[#8c5cff]" size={16} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Zone - Solo mostrar si no hay archivo seleccionado */}
      {!selectedFile && (
        <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-[#1a1c22]/50 border border-[#8c5cff]/20' : 'bg-white/50 border border-purple-200'} mb-6`}>
          <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            2. Carga el Archivo Excel
          </label>
          <motion.div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            whileHover={{ scale: 1.01 }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragging
                ? isDarkMode
                  ? 'border-[#8c5cff]/60 bg-[#8c5cff]/10'
                  : 'border-purple-500 bg-purple-50'
                : isDarkMode
                ? 'border-[#8c5cff]/20 bg-[#1a1c22]/50'
                : 'border-purple-200 bg-white/50'
            }`}
          >
            <Upload
              size={48}
              className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}
            />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Arrastra tu archivo aquí
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              o haz clic para seleccionar un archivo
            </p>

            <label
              className={`inline-block px-6 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white hover:shadow-lg hover:shadow-[#8c5cff]/50'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg'
              }`}
            >
              Seleccionar Archivo
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </motion.div>
        </div>
      )}

      {/* Archivo Seleccionado - Mostrar si hay archivo */}
      {selectedFile && (
        <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-[#1a1c22]/50 border border-[#8c5cff]/20' : 'bg-white/50 border border-purple-200'} mb-6`}>
          <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            2. Archivo Seleccionado
          </label>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-center gap-3 ${
              isDarkMode ? 'bg-[#8c5cff]/20 border border-[#8c5cff]/30' : 'bg-purple-100 border border-purple-300'
            }`}
          >
            <File size={24} className="text-[#8c5cff] flex-shrink-0" />
            <div className="flex-1">
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedFile.name}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              disabled={isUploading}
              className={`p-1 rounded transition-colors ${
                isUploading
                  ? 'cursor-not-allowed opacity-50'
                  : isDarkMode
                  ? 'text-red-400 hover:bg-red-500/20'
                  : 'text-red-600 hover:bg-red-100'
              }`}
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && selectedPlantelId && selectedCategoriaId && selectedLigaId && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpload}
          disabled={isUploading}
          className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : isDarkMode
              ? 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] text-white hover:shadow-lg hover:shadow-[#8c5cff]/50'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg'
          }`}
        >
          {isUploading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              <Upload size={20} />
              Cargar Archivo
            </>
          )}
        </motion.button>
      )}

      {/* Upload Progress Bar */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`space-y-2 p-4 rounded-lg ${
              isDarkMode
                ? 'bg-[#1a1c22]/50 border border-[#8c5cff]/20'
                : 'bg-purple-50 border border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Progreso de carga
              </span>
              <span className={`text-sm font-bold ${isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'}`}>
                {uploadProgress}%
              </span>
            </div>
            {/* Barra de progreso personalizada */}
            <div
              className={`h-2 w-full rounded-full overflow-hidden ${
                isDarkMode ? 'bg-[#8c5cff]/20' : 'bg-purple-200'
              }`}
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf]'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600'
                }`}
              />
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {uploadProgress < 100 ? 'Subiendo archivo...' : 'Procesando datos...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload History Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Historial de Cargas - v4
          </h3>
        </div>

        {/* Filter by Plantel */}
        {uploadHistory.length > 0 && (
          <div className="mb-4 flex items-center gap-3">
            <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Filtrar por plantel:
            </label>
            <select
              value={selectedPlantel}
              onChange={(e) => setSelectedPlantel(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                isDarkMode
                  ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white hover:border-[#8c5cff]/50'
                  : 'bg-white border-purple-200 text-gray-900 hover:border-purple-400'
              }`}
            >
              <option value="todos">Todos los planteles</option>
              {Array.from(new Set(uploadHistory.map((item) => item.plantel))).sort().map((plantel) => (
                <option key={plantel} value={plantel}>
                  {plantel}
                </option>
              ))}
            </select>
          </div>
        )}

        {loadingHistory ? (
          <div
            className={`p-8 text-center rounded-2xl border ${
              isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
            }`}
          >
            <Loader size={32} className="mx-auto animate-spin text-[#8c5cff]" />
          </div>
        ) : uploadHistory.length === 0 ? (
          <div
            className={`p-8 text-center rounded-2xl border ${
              isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white/50 border-purple-200'
            }`}
          >
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              No hay cargas registradas aún
            </p>
          </div>
        ) : (
          <div className={`overflow-x-auto rounded-lg border ${isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'}`}>
            <table className="w-full text-sm">
              <thead>
                <tr
                  className={`${
                    isDarkMode
                      ? 'bg-[#1a1c22]/50 border-b border-[#8c5cff]/20'
                      : 'bg-purple-50 border-b border-purple-200'
                  }`}
                >
                  <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Plantel
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Liga
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Categoría
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Archivo
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Fecha de Carga
                  </th>
                  <th className={`px-4 py-3 text-center font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Registros
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Nutricionista
                  </th>
                </tr>
              </thead>
              <tbody>
                {uploadHistory
                  .filter((item) => selectedPlantel === 'todos' || item.plantel === selectedPlantel)
                  .map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b transition-colors ${
                        isDarkMode
                          ? 'border-[#8c5cff]/10 hover:bg-[#1a1c22]/30'
                          : 'border-purple-100 hover:bg-purple-50/50'
                      }`}
                    >
                      <td className={`px-4 py-3 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.plantel}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.liga}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.categoria}
                      </td>
                      <td className={`px-4 py-3 text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.nombre_archivo}
                      </td>
                      <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(item.fecha_carga_excel).toLocaleDateString('es-CL')}
                      </td>
                      <td className={`px-4 py-3 text-center font-semibold ${isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'}`}>
                        {item.cantidad_registros}
                      </td>
                      <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.nutricionista_nombre}
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ExcelSection;
