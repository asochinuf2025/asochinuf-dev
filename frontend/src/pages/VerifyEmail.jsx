import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/apiConfig';
import { toast } from 'sonner';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDarkMode, actualizarUsuario } = useAuth();

  const [estado, setEstado] = useState('cargando'); // cargando, exitoso, error
  const [mensaje, setMensaje] = useState('');
  const [titulo, setTitulo] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const verificarEmail = async () => {
      if (!token) {
        setEstado('error');
        setTitulo('Token no proporcionado');
        setMensaje('No se encontró un token de verificación válido en la URL.');
        return;
      }

      try {
        setTitulo('Verificando tu email...');
        setMensaje('Por favor espera mientras verificamos tu dirección de correo.');

        // Confirmar el email directamente (sin validar primero)
        // El backend ya valida el token
        const response = await axios.post(
          API_ENDPOINTS.AUTH.CONFIRMAR_EMAIL,
          { token },
          {
            timeout: 10000, // 10 segundos timeout
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // Verificar que la respuesta tenga los datos necesarios
        if (!response.data || !response.data.token) {
          throw new Error('Respuesta inválida del servidor');
        }

        // Si la confirmación fue exitosa
        setEstado('exitoso');
        setTitulo('¡Email verificado!');
        setMensaje('Tu email ha sido verificado exitosamente. Iniciando sesión...');

        // Guardar token y usuario en localStorage
        try {
          localStorage.setItem('asochinuf_token', response.data.token);
          localStorage.setItem(
            'asochinuf_usuario',
            JSON.stringify(response.data.usuario)
          );

          // Actualizar el contexto de autenticación
          if (actualizarUsuario) {
            actualizarUsuario(response.data.usuario, response.data.token);
          }
        } catch (storageError) {
          console.error('Error guardando en localStorage:', storageError);
        }

        // Esperar 2 segundos para que vea el mensaje, luego redirigir
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } catch (error) {
        console.error('Error verificando email:', error);

        setEstado('error');
        setTitulo('Error al verificar email');

        // Manejo detallado de errores
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;

          if (status === 400) {
            setMensaje(
              errorData?.error ||
              'El token de verificación es inválido o ha expirado.'
            );
          } else if (status === 403) {
            setMensaje(
              errorData?.error ||
              'Este token ya ha sido utilizado o ha expirado.'
            );
          } else {
            setMensaje(
              errorData?.error ||
              `Error del servidor (${status}). Por favor intenta de nuevo.`
            );
          }
        } else if (error.request) {
          setMensaje(
            'No hay conexión con el servidor. Verifica tu conexión a internet.'
          );
        } else {
          setMensaje(
            error.message ||
            'Hubo un error verificando tu email. Por favor intenta de nuevo.'
          );
        }

        toast.error('Error al verificar email');
      }
    };

    // Solo ejecutar si hay token
    if (token) {
      verificarEmail();
    }
  }, [token, navigate, actualizarUsuario]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDarkMode ? 'bg-[#0a0e27]' : 'bg-gradient-to-br from-purple-50 to-blue-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md rounded-2xl shadow-2xl p-8 ${
          isDarkMode
            ? 'bg-[#0f1117] border border-[#8c5cff]/20'
            : 'bg-white border border-purple-200'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-6">
          {estado === 'cargando' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Loader size={48} className="text-[#8c5cff]" />
            </motion.div>
          )}

          {estado === 'exitoso' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 size={48} className="text-green-500 mx-auto" />
            </motion.div>
          )}

          {estado === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <AlertCircle size={48} className="text-red-500 mx-auto" />
            </motion.div>
          )}

          <h1 className={`text-2xl font-bold mt-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {titulo}
          </h1>
        </div>

        {/* Mensaje */}
        <p className={`text-center mb-6 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {mensaje}
        </p>

        {/* Estado exitoso - Redireccionar automático */}
        {estado === 'exitoso' && (
          <div className="text-center">
            <p className={`text-sm mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Serás redirigido a tu dashboard en unos segundos...
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-[#8c5cff] to-[#6a3adb] text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
            >
              Ir al Dashboard Ahora
            </button>
          </div>
        )}

        {/* Estado error - Opciones */}
        {estado === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-[#8c5cff] to-[#6a3adb] text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
            >
              Ir a Inicio
            </button>
            <button
              onClick={() => {
                // Aquí podrías agregar funcionalidad para reenviar email
                window.location.href = '/?showAuth=true&mode=registro';
              }}
              className={`w-full border-2 font-semibold py-2 px-4 rounded-lg transition-all ${
                isDarkMode
                  ? 'border-[#8c5cff]/50 text-[#8c5cff] hover:bg-[#8c5cff]/10'
                  : 'border-purple-400 text-purple-600 hover:bg-purple-50'
              }`}
            >
              Registrarse de Nuevo
            </button>
          </div>
        )}

        {/* Estado cargando - Info */}
        {estado === 'cargando' && (
          <p className={`text-center text-sm ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            No cierres esta página, estamos verificando tu email...
          </p>
        )}
      </motion.div>

      {/* Logo de fondo (opcional) */}
      <div className="fixed bottom-4 right-4 opacity-10">
        <div className="text-6xl">🎯</div>
      </div>
    </div>
  );
}
