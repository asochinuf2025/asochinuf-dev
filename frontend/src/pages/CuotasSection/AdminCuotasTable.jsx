import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'sonner';
import CreateCuotaModal from './CreateCuotaModal';
import EditCuotaModal from './EditCuotaModal';

const AdminCuotasTable = ({ cuotas, onRefresh, containerVariants }) => {
  const { isDarkMode, token } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cuotaEditando, setCuotaEditando] = useState(null);
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroPago, setFiltroPago] = useState('');

  // Filtrar cuotas
  const cuotasFiltradas = cuotas.filter(cuota => {
    return (
      (!filtroMes || cuota.mes === parseInt(filtroMes)) &&
      (!filtroAno || cuota.ano === parseInt(filtroAno)) &&
      (!filtroPago || cuota.estado === filtroPago)
    );
  });

  const handleEditClick = (cuota) => {
    setCuotaEditando(cuota);
    setShowEditModal(true);
  };

  const handleEliminar = async (cuotaId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cuota?')) {
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_ENDPOINTS.CUOTAS.GET_ALL}/${cuotaId}`, config);
      toast.success('Cuota eliminada exitosamente');
      onRefresh();
    } catch (err) {
      console.error('Error al eliminar cuota:', err);
      toast.error(err.response?.data?.error || 'Error al eliminar cuota');
    }
  };

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const getEstadoBadge = (estado) => {
    const badges = {
      activo: { bg: 'bg-green-500/20', text: 'text-green-600', label: 'Activo' },
      vencido: { bg: 'bg-red-500/20', text: 'text-red-600', label: 'Vencido' }
    };
    return badges[estado] || { bg: 'bg-gray-500/20', text: 'text-gray-600', label: 'Desconocido' };
  };

  const getStatusIcon = (estado) => {
    if (estado === 'pagado') return <Check size={16} className="text-green-500" />;
    if (estado === 'vencido') return <X size={16} className="text-red-500" />;
    return null;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Botón Crear */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
            isDarkMode
              ? 'bg-[#8c5cff] text-white hover:bg-[#7a4cde]'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <Plus size={18} />
          Nueva Cuota
        </motion.button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={filtroMes}
          onChange={(e) => setFiltroMes(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white'
              : 'bg-white border-purple-200 text-gray-900'
          }`}
        >
          <option value="">Todos los meses</option>
          {meses.map((mes, idx) => (
            <option key={idx} value={idx + 1}>{mes}</option>
          ))}
        </select>

        <select
          value={filtroAno}
          onChange={(e) => setFiltroAno(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white'
              : 'bg-white border-purple-200 text-gray-900'
          }`}
        >
          {[2024, 2025, 2026].map(ano => (
            <option key={ano} value={ano}>{ano}</option>
          ))}
        </select>

        <select
          value={filtroPago}
          onChange={(e) => setFiltroPago(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-[#1a1c22] border-[#8c5cff]/20 text-white'
              : 'bg-white border-purple-200 text-gray-900'
          }`}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border overflow-hidden ${
          isDarkMode
            ? 'bg-[#1a1c22] border-[#8c5cff]/20'
            : 'bg-white border-purple-200'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-[#8c5cff]/20 bg-[#0f1117]' : 'border-purple-200 bg-purple-50'}`}>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mes/Año</th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Monto</th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vencimiento</th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Estado</th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuotasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="5" className={`px-6 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No hay cuotas que mostrar
                  </td>
                </tr>
              ) : (
                cuotasFiltradas.map((cuota, idx) => {
                  const badge = getEstadoBadge(cuota.estado);
                  return (
                    <motion.tr
                      key={cuota.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`border-b ${isDarkMode ? 'border-[#8c5cff]/10 hover:bg-[#8c5cff]/5' : 'border-purple-100 hover:bg-purple-50'} transition-colors`}
                    >
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {meses[cuota.mes - 1]}/{cuota.ano}
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        CLP ${Number(cuota.monto).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatFecha(cuota.fecha_vencimiento)}
                      </td>
                      <td className={`px-6 py-4 text-sm`}>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm`}>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditClick(cuota)}
                            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-[#8c5cff]/20' : 'hover:bg-purple-100'}`}
                            title="Editar"
                          >
                            <Edit2 size={16} className="text-[#8c5cff]" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEliminar(cuota.id)}
                            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-red-500/20' : 'hover:bg-red-100'}`}
                            title="Eliminar"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal Crear Cuota */}
      <CreateCuotaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          onRefresh();
        }}
      />

      {/* Modal Editar Cuota */}
      <EditCuotaModal
        isOpen={showEditModal}
        cuota={cuotaEditando}
        onClose={() => {
          setShowEditModal(false);
          setCuotaEditando(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setCuotaEditando(null);
          onRefresh();
        }}
      />
    </motion.div>
  );
};

export default AdminCuotasTable;
