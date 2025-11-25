import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/apiConfig';
import axios from 'axios';

export const useClientDashboardData = () => {
  const { token } = useAuth();
  const [data, setData] = useState({
    cursosDisponibles: 0,
    misCursos: [],
    totalEventos: 0,
    proximoEvento: null
  });
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

        // Obtener todas las estadísticas del cliente en un solo endpoint
        const response = await axios.get(
          `${API_ENDPOINTS.BASE}/api/client-dashboard/estadisticas`,
          config
        );

        if (response.data.success) {
          setData({
            cursosDisponibles: response.data.data.cursosDisponibles,
            misCursos: response.data.data.misCursos,
            totalEventos: response.data.data.totalEventos,
            proximoEvento: response.data.data.proximoEvento
          });
        } else {
          setError('Error al cargar estadísticas');
        }
      } catch (err) {
        console.error('Error fetching client dashboard data:', err);
        setError(err.response?.data?.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return { ...data, loading, error };
};
