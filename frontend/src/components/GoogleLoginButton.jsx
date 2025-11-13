import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';

/**
 * GoogleLoginButton
 * Componente para iniciar sesión con Google OAuth
 * Usa Google Sign-In Web (sin dependencia externa)
 *
 * Props:
 * - onSuccess: callback opcional cuando el login es exitoso
 * - onClose: callback opcional para cerrar modal
 * - variant: 'default' | 'outline' (estilo del botón)
 * - className: clases adicionales de Tailwind
 */
const GoogleLoginButton = ({ onSuccess, onClose, variant = 'default', className = '' }) => {
  const { actualizarUsuario } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(!!window.google);

  // Cargar script de Google Sign-In
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      initializeGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setScriptLoaded(true);
        setTimeout(() => initializeGoogle(), 100);
      };
      script.onerror = () => {
        console.error('Error al cargar script de Google');
        toast.error('Error al cargar Google Sign-In');
      };
      document.head.appendChild(script);
    }

    return () => {
      // No remover el script para evitar problemas en re-renders
    };
  }, []);

  const initializeGoogle = () => {
    if (!window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
      });
    } catch (error) {
      console.error('Error inicializando Google:', error);
    }
  };

  /**
   * Maneja la respuesta de Google
   */
  const handleGoogleResponse = async (response) => {
    if (!response?.credential) {
      toast.error('Error: No se recibió credencial de Google');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Enviando token de Google al backend...');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      // Enviar token de Google al backend
      const apiResponse = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(data.error || 'Error al procesar login con Google');
      }

      console.log('✅ Login con Google exitoso:', data.usuario.email);

      // Guardar token y usuario en localStorage (ANTES de navegar)
      localStorage.setItem('asochinuf_token', data.token);
      localStorage.setItem('asochinuf_usuario', JSON.stringify(data.usuario));

      // Actualizar contexto de autenticación CON el token
      actualizarUsuario(data.usuario, data.token);

      toast.success(`¡Bienvenido ${data.usuario.nombre}!`);

      // Cerrar modal si callback está disponible
      if (onClose) {
        setTimeout(() => onClose(), 500);
      }

      // Callback opcional
      if (onSuccess) {
        onSuccess(data);
      } else {
        // Navegar al dashboard después de la animación de éxito
        setTimeout(() => {
          navigate('/dashboard');
        }, 1600); // Un poco más que 1500 para asegurar que se cierra el modal primero
      }
    } catch (error) {
      console.error('❌ Error en login con Google:', error.message);
      toast.error(error.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (!scriptLoaded) {
      toast.error('Google Sign-In aún se está cargando. Intenta de nuevo.');
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        // Crear un elemento temporal para renderizar el botón de Google
        const tempContainer = document.createElement('div');
        tempContainer.style.display = 'none';
        document.body.appendChild(tempContainer);

        // Renderizar el botón invisible
        window.google.accounts.id.renderButton(
          tempContainer,
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            locale: 'es',
          }
        );

        // Encontrar el botón y hacer click automáticamente
        const button = tempContainer.querySelector('div[role="button"]');
        if (button) {
          setTimeout(() => {
            button.click();
            tempContainer.remove();
          }, 100);
        }
      } catch (error) {
        console.error('Error al mostrar Google Sign-In:', error);
        toast.error('Error al abrir Google Sign-In');
      }
    }
  };

  /**
   * Renderizar botón personalizado
   */
  const renderCustomButton = () => {
    if (variant === 'outline') {
      return (
        <Button
          type="button"
          disabled={isLoading || !scriptLoaded}
          onClick={handleClick}
          className={`w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 h-11 rounded-lg transition-all duration-200 ${className}`}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </>
          )}
        </Button>
      );
    }

    // variant === 'default'
    return (
      <Button
        type="button"
        disabled={isLoading || !scriptLoaded}
        onClick={handleClick}
        className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-11 rounded-lg transition-all duration-200 font-semibold ${className}`}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </>
        )}
      </Button>
    );
  };

  return (
    <div className="w-full">
      {renderCustomButton()}
    </div>
  );
};

export default GoogleLoginButton;
