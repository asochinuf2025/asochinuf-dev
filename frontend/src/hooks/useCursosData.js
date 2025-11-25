import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/apiConfig';
import axios from 'axios';

export const useCursosData = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get(
          API_ENDPOINTS.CURSOS_DASHBOARD.ESTADISTICAS,
          config
        );

        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError('Error al cargar estadísticas');
        }
      } catch (err) {
        console.error('Error fetching cursos data:', err);
        setError(err.response?.data?.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return { stats, loading, error };
};
