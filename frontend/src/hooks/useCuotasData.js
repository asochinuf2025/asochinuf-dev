import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Hook para obtener estadísticas de cuotas para el dashboard
 */
export const useCuotasData = () => {
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos al montar
  useEffect(() => {
    if (usuario) {
      loadStats();
    }
  }, [usuario]);

  /**
   * Cargar estadísticas
   */
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('asochinuf_token');

      const response = await axios.get(
        `${API_URL}/api/cuotas-dashboard/estadisticas`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error cargando estadísticas de cuotas:', err);
      setError('Error al cargar datos de cuotas');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    loadStats
  };
};
