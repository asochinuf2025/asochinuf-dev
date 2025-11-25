import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCursosData } from '../../hooks/useCursosData';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookOpen, Users, DollarSign, TrendingUp, AlertCircle, Award } from 'lucide-react';

const CursosDashboardTab = () => {
  const { isDarkMode } = useAuth();
  const { stats, loading, error } = useCursosData();

  // Colores para los gráficos
  const COLORS_NIVEL = {
    basico: '#3b82f6',
    intermedio: '#f59e0b',
    avanzado: '#ef4444'
  };

  const COLORS_COMPARATIVA = ['#10b981', '#ef4444'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-6 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-500' : 'bg-red-50 border border-red-200'}`}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-500" size={24} />
          <div>
            <p className={`font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Error</p>
            <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >

      {/* 6 Cards de Métricas */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Card 1: Total de Cursos */}
        <MetricCard
          title="Total de Cursos"
          value={stats?.totalCursos || 0}
          icon={<BookOpen size={24} className="text-blue-500" />}
          isDarkMode={isDarkMode}
          bgColor="blue"
        />

        {/* Card 2: Total de Estudiantes */}
        <MetricCard
          title="Estudiantes Inscritos"
          value={stats?.totalEstudiantes || 0}
          icon={<Users size={24} className="text-purple-500" />}
          isDarkMode={isDarkMode}
          bgColor="purple"
        />

        {/* Card 3: Ingresos Totales */}
        <MetricCard
          title="Ingresos Potenciales"
          value={`CLP ${(stats?.totalIngresos || 0).toLocaleString('es-CL')}`}
          icon={<DollarSign size={24} className="text-green-500" />}
          isDarkMode={isDarkMode}
          bgColor="green"
        />

        {/* Card 4: Tasa de Conversión */}
        <MetricCard
          title="Tasa de Conversión"
          value={`${stats?.tasaConversion || 0}%`}
          icon={<TrendingUp size={24} className="text-emerald-500" />}
          isDarkMode={isDarkMode}
          bgColor="emerald"
        />

        {/* Card 5: Cursos Populares */}
        <MetricCard
          title="Cursos Populares"
          value={stats?.cursosMasPopulares?.length || 0}
          icon={<Award size={24} className="text-orange-500" />}
          isDarkMode={isDarkMode}
          bgColor="orange"
        />

        {/* Card 6: Cursos sin Inscritos */}
        <MetricCard
          title="Cursos sin Inscritos"
          value={stats?.cursosNuncaComprados?.length || 0}
          icon={<AlertCircle size={24} className="text-red-500" />}
          isDarkMode={isDarkMode}
          bgColor="red"
        />
      </motion.div>

      {/* Gráficos */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Distribución por Nivel */}
        <div
          className={`p-6 rounded-lg ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Estudiantes por Nivel
          </h3>
          {stats?.distribucionNivel && stats.distribucionNivel.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.distribucionNivel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nivel, cantidad_estudiantes }) => `${nivel}: ${cantidad_estudiantes}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cantidad_estudiantes"
                >
                  {stats.distribucionNivel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_NIVEL[entry.nivel] || '#999'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} estudiantes`}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: isDarkMode ? '#fff' : '#000'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Sin datos
            </div>
          )}
        </div>

        {/* Gráfico 2: Ingresos por Nivel */}
        <div
          className={`p-6 rounded-lg ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Ingresos por Nivel
          </h3>
          {stats?.ingresosPorNivel && stats.ingresosPorNivel.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.ingresosPorNivel}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4b5563' : '#e5e7eb'} />
                <XAxis
                  dataKey="nivel"
                  tick={{ fontSize: 12, fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                />
                <YAxis tick={{ fontSize: 12, fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                <Tooltip
                  formatter={(value) => `CLP ${value.toLocaleString('es-CL')}`}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: isDarkMode ? '#fff' : '#000'
                  }}
                />
                <Bar dataKey="ingresos_potenciales" fill="#8c5cff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Sin datos
            </div>
          )}
        </div>

        {/* Gráfico 3: Comparativa Cursos */}
        <div
          className={`p-6 rounded-lg ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Cursos: Con vs Sin Inscritos
          </h3>
          {stats?.comparativa && (stats.comparativa.cursos_con_inscritos > 0 || stats.comparativa.cursos_sin_inscritos > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: 'Con Inscritos',
                      value: parseInt(stats.comparativa.cursos_con_inscritos)
                    },
                    {
                      name: 'Sin Inscritos',
                      value: parseInt(stats.comparativa.cursos_sin_inscritos)
                    }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {COLORS_COMPARATIVA.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} cursos`}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: isDarkMode ? '#fff' : '#000'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Sin datos
            </div>
          )}
        </div>

        {/* Gráfico 4: Cursos Más Populares */}
        <div
          className={`p-6 rounded-lg ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Top 5 Cursos Populares
          </h3>
          {stats?.cursosMasPopulares && stats.cursosMasPopulares.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {stats.cursosMasPopulares.map((curso, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-3 rounded ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex-1">
                    <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {index + 1}. {curso.nombre}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {curso.codigo_curso}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-500">
                      {curso.cantidad_inscritos} estudiantes
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {curso.porcentaje_estudiantes}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Sin cursos populares
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Componente reutilizable para tarjetas de métricas
 */
function MetricCard({ title, value, icon, isDarkMode, bgColor }) {
  const bgColorClasses = {
    blue: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
    purple: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
    green: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
    emerald: isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50',
    orange: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50',
    red: isDarkMode ? 'bg-red-900/20' : 'bg-red-50',
  };

  const borderColorClasses = {
    blue: isDarkMode ? 'border-blue-700' : 'border-blue-200',
    purple: isDarkMode ? 'border-purple-700' : 'border-purple-200',
    green: isDarkMode ? 'border-green-700' : 'border-green-200',
    emerald: isDarkMode ? 'border-emerald-700' : 'border-emerald-200',
    orange: isDarkMode ? 'border-orange-700' : 'border-orange-200',
    red: isDarkMode ? 'border-red-700' : 'border-red-200',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 rounded-lg border ${bgColorClasses[bgColor]} ${borderColorClasses[bgColor]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </motion.div>
  );
}

export default CursosDashboardTab;
