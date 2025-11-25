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

        // Obtener cursos disponibles
        const cursosResponse = await axios.get(API_ENDPOINTS.CURSOS.GET_ALL, config);
        const cursosDisponibles = cursosResponse.data?.data?.length || 0;

        // Obtener mis cursos (inscripciones del usuario)
        const misInscripcionesResponse = await axios.get(
          API_ENDPOINTS.INSCRIPCIONES.MIS_CURSOS,
          config
        );
        const misCursos = misInscripcionesResponse.data?.data || [];

        // Obtener eventos (usando endpoint de planteles como base para eventos)
        const eventosResponse = await axios.get(API_ENDPOINTS.PLANTELES.GET_ALL, config);
        const eventos = eventosResponse.data?.data || [];
        const totalEventos = eventos.length;

        // Calcular próximo evento (el más cercano en fecha)
        let proximoEvento = null;
        if (eventos.length > 0) {
          // Ordenar por fecha más cercana
          const eventosOrdenados = eventos.sort((a, b) => {
            const fechaA = new Date(a.fecha_evento || a.created_at);
            const fechaB = new Date(b.fecha_evento || b.created_at);
            return fechaA - fechaB;
          });
          proximoEvento = eventosOrdenados[0];
        }

        setData({
          cursosDisponibles,
          misCursos,
          totalEventos,
          proximoEvento
        });
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
