import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Hook para obtener datos antropométricos con filtros
 */
export const useAnthropometricData = () => {
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [planteles, setPlanteles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos al montar
  useEffect(() => {
    if (usuario) {
      loadInitialData();
    }
  }, [usuario]);

  /**
   * Cargar datos iniciales
   */
  const loadInitialData = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem('asochinuf_token');

      // Cargar opciones de filtros (categorías y planteles)
      const filterResponse = await axios.get(`${API_URL}/api/anthropometric/filter-options`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (filterResponse.data.success) {
        setCategorias(filterResponse.data.categorias || []);
        setPlanteles(filterResponse.data.planteles || []);
      }

      // Cargar stats inicial
      loadStats({});
    } catch (err) {
      console.error('Error cargando datos iniciales:', err);
      setError('Error al cargar datos');
    }
  }, []);

  /**
   * Cargar estadísticas con filtros
   */
  const loadStats = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('asochinuf_token');

      const params = new URLSearchParams();
      if (filters.categoria_id) params.append('categoria_id', filters.categoria_id);
      if (filters.zona) params.append('zona', filters.zona);
      if (filters.measurement_type) params.append('measurement_type', filters.measurement_type);

      const response = await axios.get(
        `${API_URL}/api/anthropometric/stats?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    categorias,
    planteles,
    loading,
    error,
    loadStats
  };
};
