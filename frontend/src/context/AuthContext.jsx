import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // Dark mode por defecto

  // Restaurar sesión y tema al cargar
  useEffect(() => {
    const storedToken = localStorage.getItem('asochinuf_token');
    const storedUsuario = localStorage.getItem('asochinuf_usuario');
    const storedTheme = localStorage.getItem('asochinuf_theme');

    if (storedToken && storedUsuario) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUsuario));

      // Restaurar tema si existe
      if (storedTheme === 'light') {
        setIsDarkMode(false);
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      localStorage.setItem('asochinuf_token', data.token);
      localStorage.setItem('asochinuf_usuario', JSON.stringify(data.usuario));

      setToken(data.token);
      setUsuario(data.usuario);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registro = async (email, password, nombre, apellido) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTRO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password, nombre, apellido }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      localStorage.setItem('asochinuf_token', data.token);
      localStorage.setItem('asochinuf_usuario', JSON.stringify(data.usuario));

      setToken(data.token);
      setUsuario(data.usuario);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('asochinuf_token');
    localStorage.removeItem('asochinuf_usuario');
    setToken(null);
    setUsuario(null);
    setError(null);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('asochinuf_theme', newTheme ? 'dark' : 'light');

    // Actualizar clase en el documento
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const obtenerPerfil = async () => {
    if (!token) {
      throw new Error('No hay token disponible');
    }

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          throw new Error('Sesión expirada');
        }
        throw new Error('Error al obtener perfil');
      }

      const data = await response.json();
      setUsuario(data);
      localStorage.setItem('asochinuf_usuario', JSON.stringify(data));

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const actualizarUsuario = (datosActualizados) => {
    const usuarioActualizado = { ...usuario, ...datosActualizados };
    setUsuario(usuarioActualizado);
    localStorage.setItem('asochinuf_usuario', JSON.stringify(usuarioActualizado));
  };

  const value = {
    usuario,
    token,
    isLoading,
    error,
    isDarkMode,
    toggleTheme,
    login,
    registro,
    logout,
    obtenerPerfil,
    actualizarUsuario,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }

  return context;
};
