import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useAnthropometricData } from '../../hooks/useAnthropometricData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Database, Calendar } from 'lucide-react';

const AnthropometricDashboardTab = () => {
  const { isDarkMode } = useAuth();
  const { stats, categorias, planteles, loading, error, loadStats } = useAnthropometricData();

  const [filters, setFilters] = useState({
    measurement_type: 'imc',
    categoria_id: null,
    zona: 'Centro'
  });

  const [ultimaActualizacion, setUltimaActualizacion] = useState('No disponible');
  const [plantelesActuales, setPlantelesActuales] = useState([]);

  // Establecer primera categoría por defecto cuando se carguen las categorías
  useEffect(() => {
    if (categorias.length > 0 && !filters.categoria_id) {
      const firstCategoryId = categorias[0].id;
      setFilters(prev => ({
        ...prev,
        categoria_id: firstCategoryId
      }));
      // Cargar stats una vez que se establece la primera categoría
      loadStats({
        measurement_type: 'imc',
        categoria_id: firstCategoryId,
        zona: 'Centro'
      });
    }
  }, [categorias, loadStats]);

  // Actualizar última actualización y planteles cuando cambian las stats
  useEffect(() => {
    console.log('Stats actualizado:', stats);
    console.log('DistribucionPosicion:', stats?.distribucionPosicion);
    console.log('DistribucionPorZona:', stats?.distribucionPorZona);

    if (stats?.ultimaActualizacion) {
      const fecha = new Date(stats.ultimaActualizacion);
      setUltimaActualizacion(fecha.toLocaleDateString('es-CL'));
    }
    if (stats?.plantelesActuales) {
      setPlantelesActuales(stats.plantelesActuales);
    }
  }, [stats]);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    loadStats(newFilters);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const measurementLabels = {
    imc: 'IMC',
    peso: 'Peso (kg)',
    masa_adiposa_superior: 'Grasa Corporal (kg)',
    suma_6_pliegues: 'Suma 6 Pliegues (mm)'
  };

  const COLORS = ['#8C5CFF', '#6BCB77', '#4D96FF', '#FFD93D', '#FF6B6B', '#FF8C42', '#6C757D', '#20C997'];

  // Colores para zonas
  const ZONE_COLORS = {
    'Norte': '#FF6B6B',
    'Centro': '#4D96FF',
    'Sur': '#6BCB77'
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      {/* 4 Cards - Métricas Principales */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Jugadores */}
        <motion.div
          whileHover={{ y: -5 }}
          className={`${
            isDarkMode
              ? 'bg-gradient-to-br from-[#8c5cff]/20 border-[#8c5cff]/20'
              : 'bg-gradient-to-br from-purple-50 border-purple-200'
          } border rounded-2xl p-6`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#8c5cff]' : 'text-purple-600'}`}>
              Total Jugadores
            </p>
            <Users size={20} className="text-[#8C5CFF]" />
          </div>
          <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats?.stats?.total_jugadores || 0}
          </p>
        </motion.div>

        {/* Cantidad Mediciones */}
        <motion.div
          whileHover={{ y: -5 }}
          className={`${
            isDarkMode
              ? 'bg-gradient-to-br from-[#6BCB77]/20 border-[#6BCB77]/20'
              : 'bg-gradient-to-br from-green-50 border-green-200'
          } border rounded-2xl p-6`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#6BCB77]' : 'text-green-600'}`}>
              Total Mediciones
            </p>
            <Database size={20} className="text-[#6BCB77]" />
          </div>
          <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats?.stats?.total_mediciones || 0}
          </p>
        </motion.div>

        {/* Última Actualización */}
        <motion.div
          whileHover={{ y: -5 }}
          className={`${
            isDarkMode
              ? 'bg-gradient-to-br from-[#4D96FF]/20 border-[#4D96FF]/20'
              : 'bg-gradient-to-br from-blue-50 border-blue-200'
          } border rounded-2xl p-6`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#4D96FF]' : 'text-blue-600'}`}>
              Última Actualización
            </p>
            <Calendar size={20} className="text-[#4D96FF]" />
          </div>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {ultimaActualizacion}
          </p>
        </motion.div>

        {/* Cantidad Planteles */}
        <motion.div
          whileHover={{ y: -5 }}
          className={`${
            isDarkMode
              ? 'bg-gradient-to-br from-[#FFD93D]/20 border-[#FFD93D]/20'
              : 'bg-gradient-to-br from-yellow-50 border-yellow-200'
          } border rounded-2xl p-6`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#FFD93D]' : 'text-yellow-600'}`}>
              Planteles
            </p>
            <TrendingUp size={20} className="text-[#FFD93D]" />
          </div>
          <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {plantelesActuales.length}
          </p>
        </motion.div>
      </motion.div>

      {/* Filtros - 3 Selects */}
      <motion.div
        variants={itemVariants}
        className={`${
          isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
        } border rounded-2xl p-6`}
      >
        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Filtros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tipo de Análisis */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Tipo de Análisis
            </label>
            <select
              value={filters.measurement_type}
              onChange={(e) => handleFilterChange('measurement_type', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                  : 'bg-white border-purple-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#8C5CFF]`}
            >
              <option value="imc">IMC</option>
              <option value="peso">Peso (kg)</option>
              <option value="masa_adiposa_superior">Grasa Corporal (kg)</option>
              <option value="suma_6_pliegues">Suma 6 Pliegues (mm)</option>
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Categoría
            </label>
            <select
              value={filters.categoria_id || ''}
              onChange={(e) => handleFilterChange('categoria_id', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                  : 'bg-white border-purple-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#8C5CFF]`}
            >
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Zona */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Zona
            </label>
            <select
              value={filters.zona}
              onChange={(e) => handleFilterChange('zona', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-[#0f1117] border-[#8c5cff]/20 text-white'
                  : 'bg-white border-purple-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#8C5CFF]`}
            >
              <option value="Norte">Norte</option>
              <option value="Centro">Centro</option>
              <option value="Sur">Sur</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* 3 Cards - Resumen de Estadísticas por Tipo de Análisis */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card Máximo */}
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-[#FF6B6B]/20 border-[#FF6B6B]/20' : 'bg-gradient-to-br from-red-50 border-red-200'} border rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#FF6B6B]' : 'text-red-600'}`}>Máximo</p>
              <span className="text-2xl">📈</span>
            </div>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.stats?.maximo ? parseFloat(stats.stats.maximo).toFixed(1) : '0.0'}</p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{measurementLabels[filters.measurement_type]}</p>
          </div>

          {/* Card Promedio */}
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-[#4D96FF]/20 border-[#4D96FF]/20' : 'bg-gradient-to-br from-blue-50 border-blue-200'} border rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#4D96FF]' : 'text-blue-600'}`}>Promedio</p>
              <span className="text-2xl">📊</span>
            </div>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.stats?.promedio ? parseFloat(stats.stats.promedio).toFixed(1) : '0.0'}</p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{measurementLabels[filters.measurement_type]}</p>
          </div>

          {/* Card Mínimo */}
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-[#6BCB77]/20 border-[#6BCB77]/20' : 'bg-gradient-to-br from-green-50 border-green-200'} border rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#6BCB77]' : 'text-green-600'}`}>Mínimo</p>
              <span className="text-2xl">📉</span>
            </div>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.stats?.minimo ? parseFloat(stats.stats.minimo).toFixed(1) : '0.0'}</p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{measurementLabels[filters.measurement_type]}</p>
          </div>
        </div>
      )}

      {/* Gráfico Comparativo Planteles */}
      {stats?.distribucionPlantel && stats.distribucionPlantel.length > 0 ? (
        <motion.div
          variants={itemVariants}
          className={`${
            isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
          } border rounded-2xl p-6`}
        >
          <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Comparativa por Plantel - {measurementLabels[filters.measurement_type]}
          </h3>
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.distribucionPlantel} margin={{ top: 20, right: 30, left: 0, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#8c5cff/20' : '#e0e0e0'} />
                <XAxis
                  dataKey="plantel"
                  tick={{ fontSize: 12, fill: isDarkMode ? '#9ca3af' : '#666' }}
                  angle={-45}
                  textAnchor="end"
                  height={120}
                />
                <YAxis tick={{ fontSize: 12, fill: isDarkMode ? '#9ca3af' : '#666' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f1117' : '#fff',
                    border: `2px solid ${isDarkMode ? '#8c5cff' : '#8C5CFF'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#fff' : '#000',
                  }}
                />
                <Legend />
                <Bar dataKey="cantidad" fill="#8C5CFF" radius={[8, 8, 0, 0]} name="Cantidad de Jugadores" />
                <Bar dataKey="promedio" fill="#6BCB77" radius={[8, 8, 0, 0]} name="Promedio" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className={`${
            isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
          } border rounded-2xl p-6 text-center`}
        >
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            No hay datos disponibles para mostrar el gráfico comparativo
          </p>
        </motion.div>
      )}

      {/* Gráficos de Torta - Posiciones y Zonas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie Chart - Distribución por Posición */}
        {stats?.distribucionPosicion && stats.distribucionPosicion.filter(item => item.posicion !== 'Sin especificar').length > 0 ? (
          <motion.div
            variants={itemVariants}
            className={`${
              isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
            } border rounded-2xl p-6`}
          >
            <h3 className={`text-lg font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Distribución por Posición
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={stats.distribucionPosicion.filter(item => item.posicion !== 'Sin especificar')}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="cantidad"
                  nameKey="posicion"
                >
                  {stats.distribucionPosicion.filter(item => item.posicion !== 'Sin especificar').map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f1117' : '#fff',
                    border: `2px solid ${isDarkMode ? '#8c5cff' : '#8C5CFF'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#fff' : '#000',
                  }}
                  formatter={(value) => `${value} jugadores`}
                  labelFormatter={(label) => `${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className={`${
              isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
            } border rounded-2xl p-6 text-center`}
          >
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              No hay datos disponibles para posiciones
            </p>
          </motion.div>
        )}

        {/* Pie Chart - Distribución por Zona */}
        {stats?.distribucionPorZona && stats.distribucionPorZona.length > 0 ? (
          <motion.div
            variants={itemVariants}
            className={`${
              isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
            } border rounded-2xl p-6`}
          >
            <h3 className={`text-lg font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Distribución por Zona
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={stats.distribucionPorZona}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="cantidad"
                  nameKey="zona"
                >
                  {stats.distribucionPorZona.map((entry) => (
                    <Cell key={`cell-${entry.zona}`} fill={ZONE_COLORS[entry.zona]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f1117' : '#fff',
                    border: `2px solid ${isDarkMode ? '#8c5cff' : '#8C5CFF'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#fff' : '#000',
                  }}
                  formatter={(value) => `${value} jugadores`}
                  labelFormatter={(label) => `${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className={`${
              isDarkMode ? 'bg-[#1a1c22] border-[#8c5cff]/20' : 'bg-white border-purple-200'
            } border rounded-2xl p-6 text-center`}
          >
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              No hay datos disponibles para zonas
            </p>
          </motion.div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8C5CFF] mx-auto mb-4"></div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Cargando datos...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}
    </motion.div>
  );
};

export default AnthropometricDashboardTab;
