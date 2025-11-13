import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, token } = useAuth();
  const [localTokenExists, setLocalTokenExists] = useState(false);

  useEffect(() => {
    // Verificar si hay token en localStorage INMEDIATAMENTE (sin esperar al contexto)
    const storedToken = localStorage.getItem('asochinuf_token');
    setLocalTokenExists(!!storedToken);
  }, []);

  // Prioridad:
  // 1. Si isLoading es true, mostrar spinner (el contexto aún está inicializando)
  // 2. Si hay token en contexto O en localStorage, dejar pasar
  // 3. Si no hay token en ningún lado, redirigir a home

  if (isLoading) {
    // Pero si hay token en localStorage, no esperar al contexto
    if (localTokenExists) {
      return children;
    }

    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-[#8c5cff]/30 border-t-[#8c5cff] rounded-full"
        />
      </div>
    );
  }

  // Una vez que termina de cargar, verificar autenticación
  const isUserAuthenticated = isAuthenticated || localTokenExists;

  if (!isUserAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
