import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';

const DocumentUpload = ({ onSuccess, onCancel }) => {
  const { isDarkMode, token } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [archivoNombre, setArchivoNombre] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const categorias = [
    'Congreso',
    'Jornada',
    'Articulo',
    'Circular',
    'Workshop',
    'Seminario'
  ];

  const [fechaEvento, setFechaEvento] = useState('');
  const [horaEvento, setHoraEvento] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [expositores, setExpositores] = useState('');

  const handleArchivoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea un documento (PDF, DOC, etc)
      const tiposPermitidos = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

      if (!tiposPermitidos.includes(file.type)) {
        setError('Solo se permiten archivos PDF, Word o texto');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError('El archivo no debe superar 10MB');
        return;
      }

      setArchivo(file);
      setArchivoNombre(file.name);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!titulo.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!archivo) {
      setError('Debes seleccionar un archivo');
      return;
    }

    if (!categoria) {
      setError('Debes seleccionar una categoría');
      return;
    }

    try {
      setUploading(true);

      // Convertir archivo a base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = e.target.result;

          // Crear evento en la BD (enviar PDF directamente)
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await axios.post(
            API_ENDPOINTS.DOCUMENTOS.CREATE,
            {
              titulo: titulo.trim(),
              descripcion: descripcion.trim() || null,
              archivo_base64: base64Data,
              archivo_nombre: archivo.name,
              archivo_tipo: archivo.type,
              categoria: categoria,
              fecha_evento: fechaEvento || null,
              hora_evento: horaEvento || null,
              ubicacion: ubicacion.trim() || null,
              expositores: expositores.trim() || null
            },
            config
          );

          toast.success('Evento subido correctamente');
          onSuccess();
        } catch (err) {
          console.error('Error:', err);
          setError(err.response?.data?.error || 'Error al crear evento');
          toast.error('Error al subir evento');
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setError('Error al leer el archivo');
        setUploading(false);
      };

      reader.readAsDataURL(archivo);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al procesar archivo');
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Título */}
      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Título del Documento *
        </label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Nuevas normas de nutrición"
          className={`w-full px-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white placeholder-gray-500'
              : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
          } focus:outline-none focus:border-[#8c5cff]`}
          disabled={uploading}
        />
      </div>

      {/* Descripción */}
      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Descripción (opcional)
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe brevemente el contenido del documento"
          rows="3"
          className={`w-full px-4 py-2 rounded-lg border resize-none ${
            isDarkMode
              ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white placeholder-gray-500'
              : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
          } focus:outline-none focus:border-[#8c5cff]`}
          disabled={uploading}
        />
      </div>

      {/* Categoría */}
      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Categoría *
        </label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white'
              : 'bg-white border-purple-200 text-gray-900'
          } focus:outline-none focus:border-[#8c5cff]`}
          disabled={uploading}
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Fecha del Evento */}
      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Fecha del Evento
        </label>
        <input
          type="date"
          value={fechaEvento}
          onChange={(e) => setFechaEvento(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white'
              : 'bg-white border-purple-200 text-gray-900'
          } focus:outline-none focus:border-[#8c5cff]`}
          disabled={uploading}
        />
      </div>

      {/* Hora del Evento */}
      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Hora del Evento
        </label>
        <input
          type="time"
          value={horaEvento}
          onChange={(e) => setHoraEvento(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white'
              : 'bg-white border-purple-200 text-gray-900'
          } focus:outline-none focus:border-[#8c5cff]`}
          disabled={uploading}
        />
      </div>

      {/* Ubicación */}
      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Ubicación
        </label>
        <input
          type="text"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          placeholder="Ej: Auditorio Central, Santiago"
          className={`w-full px-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white placeholder-gray-500'
              : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
          } focus:outline-none focus:border-[#8c5cff]`}
          disabled={uploading}
        />
      </div>

      {/* Expositores */}
      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Expositores
        </label>
        <input
          type="text"
          value={expositores}
          onChange={(e) => setExpositores(e.target.value)}
          placeholder="Ej: Dr. Juan Pérez, Dra. María García"
          className={`w-full px-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white placeholder-gray-500'
              : 'bg-white border-purple-200 text-gray-900 placeholder-gray-400'
          } focus:outline-none focus:border-[#8c5cff]`}
          disabled={uploading}
        />
      </div>

      {/* Selector de Archivo */}
      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Archivo (PDF, Word, Texto) *
        </label>
        <motion.div
          whileHover={{ scale: uploading ? 1 : 1.02 }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`p-6 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
            archivo
              ? isDarkMode
                ? 'border-green-500 bg-green-500/10'
                : 'border-green-500 bg-green-50'
              : isDarkMode
                ? 'border-[#8c5cff]/30 hover:border-[#8c5cff]/50'
                : 'border-purple-300 hover:border-purple-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleArchivoSelect}
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            disabled={uploading}
          />

          <div className="flex flex-col items-center gap-2 text-center">
            <Upload size={24} className={archivo ? 'text-green-500' : 'text-[#8c5cff]'} />
            {archivo ? (
              <>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ✓ {archivoNombre}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Haz clic para cambiar
                </p>
              </>
            ) : (
              <>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Arrastra tu archivo aquí
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  o haz clic para seleccionar
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Máximo 10MB
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg border-l-4 border-red-500 ${
            isDarkMode ? 'bg-red-500/10' : 'bg-red-50'
          }`}
        >
          <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
            {error}
          </p>
        </motion.div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          disabled={uploading}
          className={`flex-1 px-4 py-2 rounded-lg border font-semibold transition-colors ${
            uploading
              ? 'opacity-50 cursor-not-allowed'
              : ''
          } ${
            isDarkMode
              ? 'border-[#8c5cff]/20 text-gray-300 hover:bg-[#8c5cff]/10'
              : 'border-purple-200 text-gray-700 hover:bg-purple-50'
          }`}
        >
          Cancelar
        </motion.button>

        <motion.button
          whileHover={{ scale: uploading ? 1 : 1.02 }}
          whileTap={{ scale: uploading ? 1 : 0.98 }}
          type="submit"
          disabled={uploading || !titulo.trim() || !archivo || !categoria}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
            uploading || !titulo.trim() || !archivo || !categoria
              ? 'bg-[#8c5cff]/50 cursor-not-allowed'
              : 'bg-[#8c5cff] hover:bg-[#7a4cde]'
          }`}
        >
          {uploading ? (
            <>
              <Loader size={18} className="animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload size={18} />
              Subir Evento
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default DocumentUpload;
