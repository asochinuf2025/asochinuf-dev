import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, CheckCircle, AlertCircle, X, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';

const CargarExcelSection = ({ containerVariants, onUploadSuccess }) => {
  const { isDarkMode, token, usuario } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
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

  const cargarPlanteles = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingPlanteles(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.PLANTELES.GET_ACTIVOS, config);
      setPlanteles(response.data);
    } catch (err) {
      console.error('Error al cargar planteles:', err);
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

  useEffect(() => {
    if (token) {
      cargarPlanteles();
    }
  }, [token, cargarPlanteles]);

  useEffect(() => {
    if (selectedPlantelId) {
      cargarCategoriasDelPlantel(selectedPlantelId);
    }
  }, [selectedPlantelId, cargarCategoriasDelPlantel]);

  useEffect(() => {
    if (selectedPlantelId && selectedCategoriaId) {
      cargarLigasDelPlantelCategoria(selectedPlantelId, selectedCategoriaId);
    }
  }, [selectedPlantelId, selectedCategoriaId, cargarLigasDelPlantelCategoria]);

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

    setIsUploading(true);
    setError('');
    setUploadResult(null);
    setUploadProgress(1);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('plantel_id', selectedPlantelId);
    formData.append('categoria_id', selectedCategoriaId);
    formData.append('liga_id', selectedLigaId);

    const xhr = new XMLHttpRequest();

    let simulatedProgress = 1;
    const simulationInterval = setInterval(() => {
      if (simulatedProgress < 95) {
        const increment = Math.random() * (95 - simulatedProgress) * 0.1;
        simulatedProgress = Math.min(simulatedProgress + increment, 95);
        setUploadProgress(Math.round(simulatedProgress));
      }
    }, 300);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const uploadPercent = (e.loaded / e.total) * 0.3;
        const totalPercent = 1 + uploadPercent;
        setUploadProgress(Math.round(totalPercent));
        simulatedProgress = totalPercent;
      }
    });

    xhr.addEventListener('load', async () => {
      clearInterval(simulationInterval);

      if (xhr.status === 201 || xhr.status === 200) {
        try {
          setUploadProgress(95);
          const response = JSON.parse(xhr.responseText);
          setUploadResult(response);
          setSelectedFile(null);
          setUploadProgress(100);

          // Notificar al componente padre que hubo una carga exitosa
          if (onUploadSuccess) {
            onUploadSuccess();
          }

          setTimeout(() => {
            setUploadResult(null);
            setUploadProgress(0);
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

          // Verificar si es un error de archivo duplicado
          if (xhr.status === 409 && errorData.duplicado) {
            const detalles = errorData.detalles || {};
            setError(
              `Este archivo ya fue cargado anteriormente.\n` +
              `Archivo: ${detalles.archivo || 'N/A'}\n` +
              `Fecha: ${detalles.fecha_sesion ? new Date(detalles.fecha_sesion).toLocaleDateString('es-CL') : 'N/A'}\n` +
              `Plantel: ${detalles.plantel || 'N/A'}\n` +
              `Categoría: ${detalles.categoria || 'N/A'}`
            );
          } else {
            setError(errorData.error || 'Error al cargar el archivo');
          }
        } catch {
          setError('Error al cargar el archivo');
        }
        setUploadProgress(0);
      }

      setIsUploading(false);
    });

    xhr.addEventListener('error', () => {
      clearInterval(simulationInterval);
      setError('Error de red al cargar el archivo');
      setUploadProgress(0);
      setIsUploading(false);
    });

    xhr.open('POST', API_ENDPOINTS.EXCEL.UPLOAD);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  };

  return (
    <motion.div
      key="cargar-excel"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Selector de Plantel, Categoría y Liga */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Plantel Selector */}
        <div>
          <label
            htmlFor="plantel-select"
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Plantel <span className="text-red-500">*</span>
          </label>
          <select
            id="plantel-select"
            value={selectedPlantelId}
            onChange={(e) => setSelectedPlantelId(e.target.value)}
            disabled={loadingPlanteles || isUploading}
            className={`w-full px-4 py-3 rounded-lg border transition-all ${
              isDarkMode
                ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white focus:border-[#8c5cff] hover:border-[#8c5cff]/40'
                : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 hover:border-purple-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">
              {loadingPlanteles ? 'Cargando planteles...' : 'Selecciona un plantel'}
            </option>
            {planteles.map((plantel) => (
              <option key={plantel.id} value={plantel.id}>
                {plantel.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría Selector */}
        <div>
          <label
            htmlFor="categoria-select"
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            id="categoria-select"
            value={selectedCategoriaId}
            onChange={(e) => setSelectedCategoriaId(e.target.value)}
            disabled={loadingCategorias || isUploading}
            className={`w-full px-4 py-3 rounded-lg border transition-all ${
              isDarkMode
                ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white focus:border-[#8c5cff] hover:border-[#8c5cff]/40'
                : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 hover:border-purple-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">
              {loadingCategorias ? 'Cargando categorías...' : 'Selecciona una categoría'}
            </option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Liga Selector */}
        <div>
          <label
            htmlFor="liga-select"
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Liga <span className="text-red-500">*</span>
          </label>
          <select
            id="liga-select"
            value={selectedLigaId}
            onChange={(e) => setSelectedLigaId(e.target.value)}
            disabled={loadingLigas || isUploading || !selectedCategoriaId}
            className={`w-full px-4 py-3 rounded-lg border transition-all ${
              isDarkMode
                ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white focus:border-[#8c5cff] hover:border-[#8c5cff]/40'
                : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 hover:border-purple-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">
              {loadingLigas ? 'Cargando ligas...' : 'Selecciona una liga'}
            </option>
            {ligas.map((liga) => (
              <option key={liga.id} value={liga.id}>
                {liga.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zona de carga */}
      <div
        onDragEnter={!selectedFile ? handleDragEnter : undefined}
        onDragOver={!selectedFile ? handleDragOver : undefined}
        onDragLeave={!selectedFile ? handleDragLeave : undefined}
        onDrop={!selectedFile ? handleDrop : undefined}
        className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 transition-all ${
          selectedFile
            ? isDarkMode
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-green-500/50 bg-green-50'
            : isDragging
            ? 'border-[#8c5cff] bg-[#8c5cff]/10'
            : isDarkMode
            ? 'border-[#8c5cff]/20 bg-[#1a1c22]/50 hover:border-[#8c5cff]/40'
            : 'border-purple-200 bg-white hover:border-purple-300'
        }`}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <File
              size={64}
              className={isDarkMode ? 'text-green-400' : 'text-green-600'}
            />
            <div className="text-center">
              <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedFile.name}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
              <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-sm font-medium ${
                isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
              }`}>
                <CheckCircle size={16} />
                Listo para cargar
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedFile(null);
                setError('');
              }}
              disabled={isUploading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <X size={16} />
              Seleccionar otro archivo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Upload
              size={64}
              className={`${
                isDragging ? 'text-[#8c5cff]' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } transition-colors`}
            />

            <div className="text-center">
              <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Arrastra tu archivo Excel aquí
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                o haz clic para seleccionar un archivo
              </p>
              <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Formatos aceptados: .xlsx, .xls (Máx. 10MB)
              </p>
            </div>

            <label
              htmlFor="file-upload"
              className={`px-6 py-3 rounded-lg font-medium cursor-pointer transition-all ${
                isDarkMode
                  ? 'bg-[#8c5cff] text-white hover:bg-[#7a4de6]'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Seleccionar archivo
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-[#1a1c22]/50 border border-[#8c5cff]/20' : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Subiendo archivo...
            </span>
            <span className={`text-sm font-bold ${isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'}`}>
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] rounded-full"
            />
          </div>
        </motion.div>
      )}

      {/* Resultado de carga */}
      {uploadResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg border ${
            isDarkMode
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <CheckCircle
              size={24}
              className={isDarkMode ? 'text-green-400 flex-shrink-0' : 'text-green-600 flex-shrink-0'}
            />
            <div className="flex-1">
              <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                Archivo cargado exitosamente
              </h4>
              {uploadResult.pacientesNuevos > 0 && (
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                  • {uploadResult.pacientesNuevos} paciente(s) nuevo(s) agregado(s)
                </p>
              )}
              {uploadResult.pacientesActualizados > 0 && (
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                  • {uploadResult.pacientesActualizados} paciente(s) actualizado(s)
                </p>
              )}
              <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                • {uploadResult.informesCreados} informe(s) antropométrico(s) creado(s)
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mensaje de error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            isDarkMode
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} flex-shrink-0 mt-0.5`}
            />
            <div className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
              {error.split('\n').map((line, index) => (
                <p key={index} className={index > 0 ? 'mt-1' : ''}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Botón de carga */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleUpload}
        disabled={!selectedFile || !selectedPlantelId || !selectedCategoriaId || !selectedLigaId || isUploading}
        className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
          isDarkMode
            ? 'bg-[#8c5cff] text-white hover:bg-[#7a4de6]'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isUploading ? (
          <>
            <Loader size={20} className="animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <Upload size={20} />
            Cargar archivo
          </>
        )}
      </motion.button>

      {/* Instrucciones */}
      <div className={`p-6 rounded-lg ${
        isDarkMode ? 'bg-[#1a1c22]/50 border border-[#8c5cff]/20' : 'bg-blue-50 border border-blue-200'
      }`}>
        <h4 className={`font-bold mb-3 flex items-center gap-2 ${
          isDarkMode ? 'text-blue-400' : 'text-blue-800'
        }`}>
          <File size={20} />
          Instrucciones para el archivo Excel
        </h4>
        <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
          <li>• El archivo debe contener la fecha de sesión en la celda D3</li>
          <li>• Los encabezados deben estar en la fila 5</li>
          <li>• Los datos de los pacientes comienzan en la fila 6</li>
          <li>• Debe seleccionar el plantel, categoría y liga antes de cargar</li>
          <li>• El sistema detecta y previene archivos duplicados</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default CargarExcelSection;
