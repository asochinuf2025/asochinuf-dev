import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCuotasData } from '../../hooks/useCuotasData';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, CreditCard, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

const CuotasDashboardTab = () => {
  const { isDarkMode } = useAuth();
  const { stats, loading, error } = useCuotasData();

  // Colores para los gráficos
  const COLORS_ESTADO = {
    pagado: '#10b981',
    pendiente: '#f59e0b',
    vencido: '#ef4444',
    cancelado: '#9ca3af'
  };

  const COLORS_PAGADORES = ['#3b82f6', '#ef4444'];

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
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-6">
          <DollarSign size={32} className="text-[#8c5cff]" />
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Gestión de Cuotas
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Panel de control y análisis de cuotas mensuales
            </p>
          </div>
        </div>
      </motion.div>

      {/* 6 Cards de Métricas */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Card 1: Nutricionistas */}
        <MetricCard
          title="Nutricionistas"
          value={stats?.totalNutricionistas || 0}
          icon={<Users size={24} className="text-blue-500" />}
          isDarkMode={isDarkMode}
          bgColor="blue"
        />

        {/* Card 2: Administradores */}
        <MetricCard
          title="Administradores"
          value={stats?.totalAdmins || 0}
          icon={<UserCheck size={24} className="text-purple-500" />}
          isDarkMode={isDarkMode}
          bgColor="purple"
        />

        {/* Card 3: Cuotas Pagadas */}
        <MetricCard
          title="Cuotas Pagadas"
          value={stats?.cuotasPagadas || 0}
          icon={<CreditCard size={24} className="text-green-500" />}
          isDarkMode={isDarkMode}
          bgColor="green"
        />

        {/* Card 4: Total de Ingresos */}
        <MetricCard
          title="Ingresos Totales"
          value={`CLP ${(stats?.totalIngresos || 0).toLocaleString('es-CL')}`}
          icon={<TrendingUp size={24} className="text-emerald-500" />}
          isDarkMode={isDarkMode}
          bgColor="emerald"
        />

        {/* Card 5: Morosos */}
        <MetricCard
          title="Morosos Pendientes"
          value={stats?.totalMorosos || 0}
          icon={<AlertCircle size={24} className="text-red-500" />}
          isDarkMode={isDarkMode}
          bgColor="red"
        />

        {/* Card 6: Monto por Pagar */}
        <MetricCard
          title="Monto Total por Pagar"
          value={`CLP ${(stats?.montoPorPagar || 0).toLocaleString('es-CL')}`}
          icon={<DollarSign size={24} className="text-orange-500" />}
          isDarkMode={isDarkMode}
          bgColor="orange"
        />
      </motion.div>

      {/* Gráficos */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Distribución por Estado */}
        <div
          className={`p-6 rounded-lg ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Distribución por Estado
          </h3>
          {stats?.estadoCuotas && stats.estadoCuotas.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.estadoCuotas}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ estado, porcentaje }) => `${estado} ${porcentaje}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {stats.estadoCuotas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_ESTADO[entry.estado] || '#999'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} cuotas`}
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

        {/* Gráfico 2: Ingresos por Mes */}
        <div
          className={`p-6 rounded-lg ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Ingresos por Mes
          </h3>
          {stats?.ingresosPorMes && stats.ingresosPorMes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.ingresosPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4b5563' : '#e5e7eb'} />
                <XAxis
                  dataKey="mes_nombre"
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
                <Bar dataKey="ingresos" fill="#8c5cff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Sin datos
            </div>
          )}
        </div>

        {/* Gráfico 3: Pagadores vs Morosos */}
        <div
          className={`p-6 rounded-lg ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Usuarios: Pagadores vs Morosos
          </h3>
          {stats?.pagadoresMorosos && stats.pagadoresMorosos.length > 0 &&
           (stats.pagadoresMorosos[0]?.usuarios_pagadores > 0 || stats.pagadoresMorosos[0]?.usuarios_morosos > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: 'Pagadores',
                      value: parseInt(stats.pagadoresMorosos[0]?.usuarios_pagadores) || 0
                    },
                    {
                      name: 'Morosos',
                      value: parseInt(stats.pagadoresMorosos[0]?.usuarios_morosos) || 0
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
                  {COLORS_PAGADORES.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} usuarios`}
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

        {/* Gráfico 4: Top 10 Morosos */}
        <div
          className={`p-6 rounded-lg ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Top 10 Morosos
          </h3>
          {stats?.top10Morosos && stats.top10Morosos.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {stats.top10Morosos.map((moroso, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-3 rounded ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex-1">
                    <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {index + 1}. {moroso.usuario_nombre}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {moroso.usuario_email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-500">
                      CLP {moroso.monto_pendiente.toLocaleString('es-CL')}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {moroso.cantidad_cuotas_pendientes} cuota(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Sin morosos
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
    red: isDarkMode ? 'bg-red-900/20' : 'bg-red-50',
    orange: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50',
  };

  const borderColorClasses = {
    blue: isDarkMode ? 'border-blue-700' : 'border-blue-200',
    purple: isDarkMode ? 'border-purple-700' : 'border-purple-200',
    green: isDarkMode ? 'border-green-700' : 'border-green-200',
    emerald: isDarkMode ? 'border-emerald-700' : 'border-emerald-200',
    red: isDarkMode ? 'border-red-700' : 'border-red-200',
    orange: isDarkMode ? 'border-orange-700' : 'border-orange-200',
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

export default CuotasDashboardTab;
