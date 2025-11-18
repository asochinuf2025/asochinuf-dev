import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader, File, Calendar, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';

const HistorialExcelSection = ({ containerVariants, refreshTrigger }) => {
  const { isDarkMode, token, usuario } = useAuth();
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedPlantel, setSelectedPlantel] = useState('todos');

  const isAdmin = usuario?.tipo_perfil === 'admin';

  const cargarHistorial = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingHistory(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_ENDPOINTS.EXCEL.HISTORY, config);

      // Si es admin, mostrar todos los registros
      // Si es nutricionista, solo mostrar sus propios registros
      const historial = response.data;

      if (isAdmin) {
        setUploadHistory(historial);
      } else {
        // Filtrar solo los registros del nutricionista actual
        const historialFiltrado = historial.filter(
          item => item.nutricionista_email === usuario.email
        );
        setUploadHistory(historialFiltrado);
      }
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setUploadHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [token, isAdmin, usuario]);

  useEffect(() => {
    if (token) {
      cargarHistorial();
    }
  }, [token, cargarHistorial, refreshTrigger]);

  // Obtener lista única de planteles
  const planteles = Array.from(new Set(uploadHistory.map((item) => item.plantel))).sort();

  // Filtrar historial por plantel seleccionado
  const historialFiltrado = uploadHistory.filter(
    (item) => selectedPlantel === 'todos' || item.plantel === selectedPlantel
  );

  // Estadísticas
  const totalRegistros = historialFiltrado.reduce((sum, item) => sum + (item.cantidad_registros || 0), 0);
  const totalCargas = historialFiltrado.length;

  return (
    <motion.div
      key="historial-excel"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Estadísticas */}
      {uploadHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20'
                : 'bg-white border-purple-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <File size={24} className="text-[#8c5cff]" />
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total de Cargas
              </span>
            </div>
            <p className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {totalCargas}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20'
                : 'bg-white border-purple-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={24} className="text-[#8c5cff]" />
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total de Registros
              </span>
            </div>
            <p className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {totalRegistros}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20'
                : 'bg-white border-purple-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Users size={24} className="text-[#8c5cff]" />
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Planteles Activos
              </span>
            </div>
            <p className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {planteles.length}
            </p>
          </motion.div>
        </div>
      )}

      {/* Filtro por Plantel */}
      {uploadHistory.length > 0 && (
        <div className="flex items-center gap-3">
          <label className={`text-sm font-semibold ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Filtrar por plantel:
          </label>
          <select
            value={selectedPlantel}
            onChange={(e) => setSelectedPlantel(e.target.value)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              isDarkMode
                ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white hover:border-[#8c5cff]/50 focus:border-[#8c5cff]'
                : 'bg-white border-purple-200 text-gray-900 hover:border-purple-400 focus:border-purple-500'
            }`}
          >
            <option value="todos">Todos los planteles ({uploadHistory.length})</option>
            {planteles.map((plantel) => {
              const count = uploadHistory.filter(item => item.plantel === plantel).length;
              return (
                <option key={plantel} value={plantel}>
                  {plantel} ({count})
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Tabla de Historial */}
      {loadingHistory ? (
        <div className={`p-12 text-center rounded-2xl border ${
          isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white border-purple-200'
        }`}>
          <Loader size={48} className="mx-auto animate-spin text-[#8c5cff] mb-4" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Cargando historial...
          </p>
        </div>
      ) : uploadHistory.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white border-purple-200'
        }`}>
          <File size={48} className={`mx-auto mb-4 ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No hay cargas registradas
          </p>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {isAdmin
              ? 'No hay archivos Excel cargados en el sistema'
              : 'Aún no has cargado ningún archivo Excel'}
          </p>
        </div>
      ) : historialFiltrado.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          isDarkMode ? 'bg-[#1a1c22]/50 border-[#8c5cff]/20' : 'bg-white border-purple-200'
        }`}>
          <File size={48} className={`mx-auto mb-4 ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            No hay cargas para el plantel seleccionado
          </p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-xl border ${
          isDarkMode ? 'border-[#8c5cff]/20' : 'border-purple-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${
                  isDarkMode
                    ? 'bg-[#1a1c22]/50 border-b border-[#8c5cff]/20'
                    : 'bg-purple-50 border-b border-purple-200'
                }`}>
                  <th className={`px-6 py-4 text-left font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Plantel
                  </th>
                  <th className={`px-6 py-4 text-left font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Liga
                  </th>
                  <th className={`px-6 py-4 text-left font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Categoría
                  </th>
                  <th className={`px-6 py-4 text-left font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Archivo
                  </th>
                  <th className={`px-6 py-4 text-left font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Fecha de Carga
                  </th>
                  <th className={`px-6 py-4 text-center font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Registros
                  </th>
                  {isAdmin && (
                    <th className={`px-6 py-4 text-left font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Nutricionista
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {historialFiltrado.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b transition-colors ${
                      isDarkMode
                        ? 'border-[#8c5cff]/10 hover:bg-[#1a1c22]/30'
                        : 'border-purple-100 hover:bg-purple-50/50'
                    }`}
                  >
                    <td className={`px-6 py-4 font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.plantel}
                    </td>
                    <td className={`px-6 py-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.liga || 'N/A'}
                    </td>
                    <td className={`px-6 py-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.categoria || 'N/A'}
                    </td>
                    <td className={`px-6 py-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="flex items-center gap-2">
                        <File size={16} className="text-[#8c5cff]" />
                        <span className="truncate max-w-xs" title={item.nombre_archivo}>
                          {item.nombre_archivo}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#8c5cff]" />
                        {new Date(item.fecha_carga_excel).toLocaleDateString('es-CL', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-center`}>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        isDarkMode
                          ? 'bg-[#8c5cff]/20 text-[#8c5cff]'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        <BarChart3 size={14} />
                        {item.cantidad_registros}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className={`px-6 py-4 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-[#8c5cff]" />
                          {item.nutricionista_nombre}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default HistorialExcelSection;
