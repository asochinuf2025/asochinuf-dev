import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import GoogleLoginButton from './GoogleLoginButton';

const LoginModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Mock login - guardar en localStorage
      localStorage.setItem('asochinuf_user', JSON.stringify({
        email: formData.email,
        loginTime: new Date().toISOString()
      }));
      console.log('Login simulado:', formData);

      setShowSuccess(true);

      setTimeout(() => {
        setFormData({ email: '', password: '' });
        setIsSubmitting(false);
        setShowSuccess(false);
        onClose();
      }, 1500);
    }, 800);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 10 },
    },
  };

  // Bloquear scroll del body cuando el modal está abierto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop mejorado con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50"
            onClick={onClose}
          />

          {/* Modal principal con scroll */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fondo glassmorphism con gradiente */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8c5cff]/10 to-[#6a3dcf]/10 rounded-3xl blur-xl" />

              {/* Card principal */}
              <div className="relative bg-gradient-to-br from-[#1a1c22]/95 via-[#0f1117]/95 to-[#1a1c22]/95 rounded-3xl shadow-2xl border border-[#8c5cff]/20 backdrop-blur-xl overflow-hidden">

                {/* Efecto de luz en la esquina */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#8c5cff]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6a3dcf]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50" />

                {/* Contenido */}
                <div className="relative p-8 md:p-10">
                  {/* Botón cerrar mejorado */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors duration-200 z-10 p-2 hover:bg-white/10 rounded-full"
                  >
                    <X size={24} />
                  </motion.button>

                  {/* Header */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center mb-8"
                  >
                    <motion.div
                      variants={itemVariants}
                      className="inline-block mb-4 p-3 bg-gradient-to-br from-[#8c5cff]/20 to-[#6a3dcf]/20 rounded-full border border-[#8c5cff]/30"
                    >
                      <img
                        src="/logos/logo.png"
                        alt="ASOCHINUF"
                        className="h-10 w-auto brightness-125"
                      />
                    </motion.div>

                    <motion.h2
                      variants={itemVariants}
                      className="text-4xl font-bold bg-gradient-to-r from-white via-[#8c5cff] to-white bg-clip-text text-transparent mb-3"
                    >
                      ¡Bienvenido!
                    </motion.h2>

                    <motion.p
                      variants={itemVariants}
                      className="text-gray-400 text-base"
                    >
                      Accede a tu cuenta ASOCHINUF
                    </motion.p>
                  </motion.div>

                  {/* Formulario */}
                  {!showSuccess ? (
                    <motion.form
                      onSubmit={handleSubmit}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-5"
                    >
                      {/* Campo Email */}
                      <motion.div variants={itemVariants}>
                        <Label
                          htmlFor="email"
                          className="text-sm font-semibold text-gray-300 mb-3 block uppercase tracking-wide"
                        >
                          Correo Electrónico
                        </Label>
                        <motion.div
                          className="relative"
                          animate={focusedField === 'email' ? { scale: 1.02 } : { scale: 1 }}
                        >
                          <div className="absolute left-3 sm:left-4 top-0 h-12 flex items-center pointer-events-none">
                            <Mail
                              className={`transition-all duration-300 flex-shrink-0 ${
                                focusedField === 'email'
                                  ? 'text-[#8c5cff] scale-110'
                                  : 'text-gray-500'
                              }`}
                              size={18}
                            />
                          </div>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            required
                            disabled={isSubmitting}
                            className="h-12 pl-10 sm:pl-12 pr-4 bg-[#0f1117]/80 border border-[#8c5cff]/20 text-white placeholder:text-gray-600 focus:border-[#8c5cff] focus:ring-2 focus:ring-[#8c5cff]/30 transition-all duration-300 rounded-xl font-medium text-sm sm:text-base"
                          />
                        </motion.div>
                      </motion.div>

                      {/* Campo Contraseña */}
                      <motion.div variants={itemVariants}>
                        <Label
                          htmlFor="password"
                          className="text-sm font-semibold text-gray-300 mb-3 block uppercase tracking-wide"
                        >
                          Contraseña
                        </Label>
                        <motion.div
                          className="relative"
                          animate={focusedField === 'password' ? { scale: 1.02 } : { scale: 1 }}
                        >
                          <div className="absolute left-3 sm:left-4 top-0 h-12 flex items-center pointer-events-none">
                            <Lock
                              className={`transition-all duration-300 flex-shrink-0 ${
                                focusedField === 'password'
                                  ? 'text-[#8c5cff] scale-110'
                                  : 'text-gray-500'
                              }`}
                              size={18}
                            />
                          </div>
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            required
                            disabled={isSubmitting}
                            className="h-12 pl-10 sm:pl-12 pr-10 sm:pr-12 bg-[#0f1117]/80 border border-[#8c5cff]/20 text-white placeholder:text-gray-600 focus:border-[#8c5cff] focus:ring-2 focus:ring-[#8c5cff]/30 transition-all duration-300 rounded-xl font-medium text-sm sm:text-base"
                          />
                          <div className="absolute right-3 sm:right-4 top-0 h-12 flex items-center z-10">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-500 hover:text-[#8c5cff] transition-colors duration-200 p-1 flex-shrink-0"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </motion.button>
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* Botón Submit mejorado */}
                      <motion.div variants={itemVariants} className="pt-4">
                        <motion.button
                          type="submit"
                          disabled={isSubmitting || !formData.email || !formData.password}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full relative overflow-hidden group py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {/* Fondo gradiente */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[#8c5cff] via-[#a371ff] to-[#8c5cff] opacity-100 group-hover:opacity-110 transition-opacity duration-300" />

                          {/* Brillo */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white to-transparent translate-x-full group-hover:translate-x-0 transition-all duration-700" style={{ filter: 'blur(20px)' }} />

                          {/* Contenido */}
                          <div className="relative flex items-center justify-center gap-2">
                            {isSubmitting ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                />
                                Iniciando sesión...
                              </>
                            ) : (
                              <>
                                Iniciar Sesión
                                <motion.div
                                  className="flex-shrink-0"
                                  animate={{ x: [0, 4, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  <ArrowRight size={18} />
                                </motion.div>
                              </>
                            )}
                          </div>

                          {/* Shadow */}
                          <div className="absolute inset-0 rounded-xl shadow-lg shadow-[#8c5cff]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.button>
                      </motion.div>

                      {/* Separador con Google OAuth */}
                      <motion.div variants={itemVariants} className="pt-2">
                        <div className="relative flex items-center gap-3">
                          <div className="flex-1 h-px bg-gray-600/50" />
                          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">O continúa con</span>
                          <div className="flex-1 h-px bg-gray-600/50" />
                        </div>
                      </motion.div>

                      {/* Google Login Button */}
                      <motion.div variants={itemVariants}>
                        <GoogleLoginButton onClose={onClose} variant="outline" />
                      </motion.div>
                    </motion.form>
                  ) : (
                    /* Pantalla de éxito */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="flex flex-col items-center justify-center py-8"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6 }}
                      >
                        <CheckCircle2 size={64} className="text-[#8c5cff] mb-4" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2">¡Bienvenido!</h3>
                      <p className="text-gray-400 text-center">Tu sesión ha sido iniciada correctamente</p>
                    </motion.div>
                  )}

                  {/* Link registro */}
                  {!showSuccess && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-center text-gray-500 text-sm mt-8"
                    >
                      ¿No tienes cuenta?{' '}
                      <motion.span
                        className="text-[#8c5cff] hover:text-[#a371ff] cursor-pointer font-semibold transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                      >
                        Regístrate aquí
                      </motion.span>
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
