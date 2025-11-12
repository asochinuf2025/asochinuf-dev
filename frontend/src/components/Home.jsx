import React, { useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Activity, Utensils, HeartPulse,
  Droplet, Facebook, Instagram, Twitter, Linkedin,
  GraduationCap, Clock, Sparkles, ArrowRight, Star,
  Users, Award, TrendingUp, Lock
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import AuthModal from './AuthModal';
import { mockData } from '../mock';

// Typewriter Animation Component
const TypewriterText = ({ text, onDeletingComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [phase, setPhase] = useState('typing'); // typing, pause, deleting
  const typingSpeed = 50; // ms per character
  const deletingSpeed = 25; // ms per character
  const pauseDuration = 2500; // ms to pause after typing complete

  useEffect(() => {
    let timeout;

    if (phase === 'typing') {
      if (displayedText.length < text.length) {
        timeout = setTimeout(() => {
          setDisplayedText(text.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        // Text is fully typed, move to pause phase
        timeout = setTimeout(() => {
          setPhase('deleting');
        }, pauseDuration);
      }
    } else if (phase === 'deleting') {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, deletingSpeed);
      } else {
        // Text is fully deleted, signal completion
        if (onDeletingComplete) {
          onDeletingComplete();
        }
        setPhase('typing');
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, phase, text, pauseDuration, onDeletingComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setPhase('typing');
  }, [text]);

  return (
    <span>
      {displayedText}
      {displayedText.length > 0 && phase === 'typing' && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-6 md:h-7 ml-1 bg-[#8c5cff] align-middle"
        />
      )}
    </span>
  );
};

const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showMemberDescription, setShowMemberDescription] = useState(null);
  const { scrollYProgress } = useScroll();

  // Optimizar parallax - desactivar en móvil para mejor rendimiento
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  // Reducir magnitud de parallax en desktop también para mejor rendimiento
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Text rotation is now handled by TypewriterText component

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  // Icon mapping
  const iconMap = {
    activity: Activity,
    utensils: Utensils,
    'heart-pulse': HeartPulse,
    droplet: Droplet,
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Enhanced typography */}
      <motion.header
        style={{ backgroundColor: `rgba(0, 0, 0, ${headerOpacity.get() * 0.8})` }}
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md transition-all duration-300"
      >
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => scrollToSection('#hero')}
          >
            <img
              src="/logos/logo.png"
              alt="ASOCHINUF Logo"
              className="h-12 w-auto object-contain group-hover:scale-110 transition-all duration-300 filter brightness-100 group-hover:brightness-110"
            />
          </motion.div>

          {/* Desktop Navigation - Enhanced typography */}
          <nav className="hidden md:flex items-center space-x-2">
            {[
              { name: 'cursos' },
              { name: 'mision-vision' },
              { name: 'capacitaciones' },
              { name: 'profesionales' },
              { name: 'organigrama' }
            ].map(({ name }) => (
              <button
                key={name}
                onClick={() => scrollToSection(`#${name}`)}
                className="px-5 py-3 text-gray-200 hover:text-white group font-bold text-base rounded-lg transition-all duration-300 relative overflow-hidden bg-gradient-to-r from-transparent to-transparent hover:from-[#8c5cff]/20 hover:to-[#6a3dcf]/20 border border-transparent hover:border-[#8c5cff]/40"
                style={{ fontWeight: 700, letterSpacing: '0.03em' }}
              >
                <span className="relative z-10">
                  <span className="capitalize">{name}</span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#8c5cff]/0 via-[#8c5cff]/10 to-[#8c5cff]/0 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105 origin-center"></span>
                <span className="absolute -bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#8c5cff] via-[#a371ff] to-[#8c5cff] transition-all duration-500 group-hover:w-full rounded-full shadow-lg shadow-[#8c5cff]/50"></span>
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-[#8c5cff] hover:bg-[#8c5cff]/10 rounded-lg transition-all duration-300"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu - Mejorado */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden"
            >
              {/* Fondo con efecto glassmorphism */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a1c22]/95 via-[#0f1117]/95 to-[#161821]/95 backdrop-blur-xl border-t border-[#8c5cff]/20" />

              {/* Efecto de luz */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#8c5cff]/5 rounded-full blur-3xl" />

              {/* Contenido */}
              <nav className="relative flex flex-col space-y-2 p-6 pt-8 pb-8">
                {[
                  { name: 'Cursos', icon: GraduationCap },
                  { name: 'Misión y Visión', icon: Target, id: 'mision-vision' },
                  { name: 'Capacitaciones', icon: Sparkles },
                  { name: 'Profesionales', icon: Award },
                  { name: 'Organigrama', icon: Users }
                ].map(({ name, icon: Icon, id }, index) => (
                  <motion.button
                    key={name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => scrollToSection(`#${id || name.toLowerCase()}`)}
                    className="group px-6 py-4 text-left text-gray-300 hover:text-white font-bold text-base transition-all duration-300 rounded-xl flex items-center gap-4 relative overflow-hidden"
                    style={{ letterSpacing: '0.03em', fontWeight: 700 }}
                  >
                    {/* Fondo hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#8c5cff]/20 via-[#8c5cff]/10 to-[#6a3dcf]/20 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl" />

                    {/* Borde hover */}
                    <div className="absolute inset-0 border border-[#8c5cff]/0 group-hover:border-[#8c5cff]/40 rounded-xl transition-all duration-300" />

                    {/* Contenido */}
                    <div className="relative flex items-center gap-4 w-full">
                      <div className="p-2 bg-[#8c5cff]/10 group-hover:bg-[#8c5cff]/20 rounded-lg transition-all duration-300 group-hover:scale-110">
                        <Icon size={20} className="text-[#8c5cff] group-hover:text-[#a371ff] transition-all duration-300" />
                      </div>
                      <span className="flex-1">{name}</span>
                      <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 text-[#8c5cff]" />
                    </div>
                  </motion.button>
                ))}

                {/* Botón Login en mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="pt-4 mt-4 border-t border-[#8c5cff]/10"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLoginOpen(true);
                    }}
                    className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] hover:from-[#a371ff] hover:to-[#7a4de6] transition-all duration-300 shadow-lg hover:shadow-[#8c5cff]/50 flex items-center justify-center gap-2 group"
                  >
                    <Lock size={18} />
                    Iniciar Sesión
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight size={18} />
                    </motion.div>
                  </motion.button>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        {/* Background image with blur and overlay */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/fondo.webp)',
              filter: 'blur(8px)',
              transform: 'scale(1.1)',
            }}
          />
          {/* Dark overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-[#1a0a2e]/85 to-black/80"></div>

          {/* Purple tint overlay */}
          <div className="absolute inset-0 bg-[#8c5cff]/10 mix-blend-overlay"></div>
        </div>

        {/* Animated background elements - Optimized for mobile */}
        <div className="absolute inset-0 overflow-hidden">
          {!isMobile && (
            <>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8c5cff]/10 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8c5cff]/10 rounded-full blur-3xl"
              />
            </>
          )}
          {/* Simplified background for mobile */}
          {isMobile && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#8c5cff]/5 via-transparent to-[#8c5cff]/5" />
          )}
          {/* Sparkle effects - Reduced on mobile */}
          {[...Array(isMobile ? 2 : 5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.7,
              }}
              className="absolute"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 20}%`,
              }}
            >
              <Sparkles className="text-[#8c5cff]/30" size={isMobile ? 16 : 20} />
            </motion.div>
          ))}
        </div>

        <motion.div
          style={isMobile ? {} : { opacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto flex-1 flex flex-col justify-center"
        >
          <motion.h1
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={isMobile ? {} : { duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-[#8c5cff] to-white bg-clip-text text-transparent"
            style={{ fontWeight: 800, letterSpacing: '-0.02em' }}
          >
            {mockData.hero.title}
          </motion.h1>

          <motion.p
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={isMobile ? {} : { duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-3xl text-gray-300 mb-4 font-semibold"
            style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
          >
            {mockData.hero.subtitle}
          </motion.p>

          {/* Typewriter animation */}
          <div className="h-16 md:h-20 mb-8 flex items-center justify-center">
            <motion.p
              className="text-lg md:text-xl text-[#8c5cff] font-medium min-h-8"
            >
              <TypewriterText
                text={mockData.hero.rotatingTexts[currentTextIndex]}
                onDeletingComplete={() => {
                  setCurrentTextIndex((prev) => (prev + 1) % mockData.hero.rotatingTexts.length);
                }}
              />
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button
              onClick={() => setIsLoginOpen(true)}
              className="bg-[#8c5cff] hover:bg-[#7a4de6] text-white text-lg px-12 py-7 rounded-full font-semibold shadow-2xl hover:shadow-[#8c5cff]/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                {mockData.hero.ctaText}
                <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={20} />
              </span>
              <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Sponsors Carousel - Optimized for mobile */}
        <div className="relative z-10 w-full py-12 overflow-hidden">
          <div className="sponsors-carousel-wrapper">
            <motion.div
              className="sponsors-carousel flex gap-16 items-center"
              animate={{
                x: [0, -2400]
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: isMobile ? 60 : 40,
                  ease: "linear"
                }
              }}
            >
              {/* Duplicate sponsors for seamless loop */}
              {[...mockData.sponsors, ...mockData.sponsors].map((sponsor, index) => (
                <div
                  key={`${sponsor.id}-${index}`}
                  className={`sponsor-logo flex-shrink-0 flex items-center justify-center ${!isMobile ? 'hover:scale-110' : ''} transition-transform duration-300 cursor-pointer`}
                >
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className={`${isMobile ? 'h-10' : 'h-12'} w-auto object-contain filter brightness-90 ${!isMobile ? 'hover:brightness-110' : ''} transition-all duration-300`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <span className="text-white/80 hover:text-white font-bold text-xl transition-colors duration-300 hidden">
                    {sponsor.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cursos Section - Premium Magazine Layout */}
      <section id="cursos" className="py-24 px-4 bg-gradient-to-b from-black to-[#0a0a0a] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8c5cff]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Header with standardized style */}
          <motion.div
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={isMobile ? { opacity: 1 } : { scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4"
            >
              <div className="px-6 py-2 bg-gradient-to-r from-[#8c5cff]/20 to-[#6a3dcf]/20 rounded-full border border-[#8c5cff]/30 backdrop-blur-sm">
                <span className="text-[#8c5cff] font-semibold text-sm tracking-wider uppercase">Educación Continua</span>
              </div>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-[#8c5cff] to-white bg-clip-text text-transparent" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Cursos Especializados
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Programas de formación integral con metodología práctica y certificación internacional
            </p>
          </motion.div>

          {/* Magazine-style horizontal cards */}
          <div className="space-y-8">
            {mockData.cursos.map((curso, index) => (
              <motion.div
                key={curso.id}
                initial={isMobile ? { opacity: 1 } : { opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={isMobile ? {} : { duration: 0.8, type: "spring", stiffness: 80 }}
                className="group"
              >
                <div className={`relative bg-gradient-to-br from-[#2a2c33] via-[#1f2127] to-[#1a1c22] rounded-3xl overflow-hidden border border-[#8c5cff]/20 hover:border-[#8c5cff]/60 transition-all duration-700 hover:shadow-2xl hover:shadow-[#8c5cff]/30 ${
                  index % 2 === 0 ? '' : 'md:flex-row-reverse'
                }`}>
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8c5cff]/0 via-[#8c5cff]/5 to-[#8c5cff]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  <div className="relative flex flex-col md:flex-row">
                    {/* Visual Section with Number */}
                    <div className={`relative md:w-2/5 h-48 md:h-auto bg-gradient-to-br from-[#8c5cff]/30 via-[#6a3dcf]/20 to-transparent p-6 flex flex-col justify-between ${
                      index % 2 === 0 ? 'md:order-1' : 'md:order-2'
                    }`}>
                      {/* Large decorative number */}
                      <div className="absolute top-4 right-4 text-[80px] md:text-[120px] font-black text-[#8c5cff]/10 leading-none" style={{ fontWeight: 900 }}>
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      {/* Floating icon */}
                      <motion.div
                        className="relative z-10 mt-auto"
                        animate={!isMobile ? { y: [0, -10, 0] } : {}}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-[#8c5cff] rounded-2xl blur-xl opacity-50"></div>
                          <div className="relative bg-gradient-to-br from-[#8c5cff] to-[#6a3dcf] rounded-2xl p-4 shadow-2xl">
                            <GraduationCap size={40} className="text-white" strokeWidth={1.5} />
                          </div>
                        </div>
                      </motion.div>

                      {/* Level badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-[#8c5cff]/40">
                          <span className="text-white text-xs font-bold tracking-wide">{curso.level}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className={`relative md:w-3/5 p-6 md:p-7 flex flex-col justify-center ${
                      index % 2 === 0 ? 'md:order-2' : 'md:order-1'
                    }`}>
                      <div className="space-y-3">
                        {/* Title */}
                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#8c5cff] group-hover:bg-clip-text transition-all duration-500" style={{ fontWeight: 800 }}>
                          {curso.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-400 group-hover:text-gray-300 text-sm md:text-base leading-relaxed transition-colors duration-500">
                          {curso.description}
                        </p>

                        {/* Footer with duration and CTA */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#8c5cff]/20 group-hover:border-[#8c5cff]/40 transition-colors duration-500">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[#8c5cff]/10 rounded-lg">
                              <Clock size={16} className="text-[#8c5cff]" />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Duración</p>
                              <p className="text-[#8c5cff] font-bold text-sm">{curso.duration}</p>
                            </div>
                          </div>

                          {/* Explore button */}
                          <motion.button
                            whileHover={!isMobile ? { scale: 1.05, x: 5 } : {}}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#8c5cff] to-[#6a3dcf] rounded-full text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-[#8c5cff]/50 transition-all duration-300"
                          >
                            <span>Explorar</span>
                            <ArrowRight size={16} />
                          </motion.button>
                        </div>
                      </div>

                      {/* Decorative corner accent */}
                      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#8c5cff]/20 rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Misión y Visión Section - Clean Layout with Logo */}
      <section id="mision-vision" className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] via-black to-[#0a0a0a] relative overflow-hidden">
        {/* Background decorations - animated gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 right-0 w-96 h-96 bg-[#8c5cff]/15 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-0 left-0 w-80 h-80 bg-[#6a3dcf]/15 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Main content - Logo left, Text right */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Logo Section - Left */}
            <motion.div
              initial={isMobile ? { opacity: 1 } : { opacity: 0, x: -100, scale: 0.8 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1 }}
              className="flex justify-center items-center md:justify-start"
            >
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(140, 92, 255, 0.3)",
                      "0 0 40px rgba(140, 92, 255, 0.6)",
                      "0 0 20px rgba(140, 92, 255, 0.3)"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative bg-gradient-to-br from-[#8c5cff]/20 via-[#6a3dcf]/10 to-[#4a2c8f]/20 rounded-2xl p-8 backdrop-blur-sm border border-[#8c5cff]/30"
                >
                  <img
                    src="/logos/logo.png"
                    alt="ASOCHINUF Logo"
                    className="h-64 w-auto object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Text Section - Right */}
            <motion.div
              initial={isMobile ? { opacity: 1 } : { opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-12"
            >
              {/* Misión */}
              <motion.div
                whileHover={{ x: 10 }}
                transition={{ duration: 0.3 }}
                className="group relative"
              >
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8c5cff] to-[#6a3dcf] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="pl-4">
                  <motion.h3
                    className="text-2xl md:text-3xl font-bold text-white mb-3"
                    style={{ fontWeight: 800 }}
                  >
                    {mockData.misionVision.mision.title}
                  </motion.h3>
                  <motion.p
                    className="text-gray-300 text-base leading-relaxed group-hover:text-gray-200 transition-colors duration-300"
                  >
                    {mockData.misionVision.mision.description}
                  </motion.p>
                </div>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-px bg-gradient-to-r from-[#8c5cff]/30 via-[#8c5cff]/60 to-[#8c5cff]/30"
              />

              {/* Visión */}
              <motion.div
                whileHover={{ x: 10 }}
                transition={{ duration: 0.3 }}
                className="group relative"
              >
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[#6a3dcf] to-[#8c5cff] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="pl-4">
                  <motion.h3
                    className="text-2xl md:text-3xl font-bold text-white mb-3"
                    style={{ fontWeight: 800 }}
                  >
                    {mockData.misionVision.vision.title}
                  </motion.h3>
                  <motion.p
                    className="text-gray-300 text-base leading-relaxed group-hover:text-gray-200 transition-colors duration-300"
                  >
                    {mockData.misionVision.vision.description}
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capacitaciones Section - Ultra Premium Bento Box Design */}
      <section id="capacitaciones" className="py-24 px-4 bg-gradient-to-b from-black via-[#0a0a0a] to-black relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#8c5cff]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6a3dcf]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={isMobile ? { opacity: 1 } : { scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4"
            >
              <div className="px-6 py-2 bg-gradient-to-r from-[#8c5cff]/20 to-[#6a3dcf]/20 rounded-full border border-[#8c5cff]/30 backdrop-blur-sm">
                <span className="text-[#8c5cff] font-semibold text-sm tracking-wider uppercase">Formación Profesional</span>
              </div>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-[#8c5cff] to-white bg-clip-text text-transparent" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Capacitaciones Especializadas
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Talleres intensivos de vanguardia diseñados para elevar tu práctica profesional
            </p>
          </motion.div>

          {/* Bento Box Grid - Single row with 4 columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {mockData.capacitaciones.map((capacitacion, index) => {
              const IconComponent = iconMap[capacitacion.icon];
              return (
                <motion.div
                  key={capacitacion.id}
                  initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={isMobile ? {} : { duration: 0.6, delay: index * 0.15, type: "spring", stiffness: 100 }}
                  className="group cursor-pointer"
                >
                  <div className="relative h-full bg-gradient-to-br from-[#2a2c33] via-[#1f2127] to-[#1a1c22] rounded-2xl overflow-hidden border border-[#8c5cff]/20 hover:border-[#8c5cff]/60 transition-all duration-700 hover:shadow-2xl hover:shadow-[#8c5cff]/40">
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8c5cff]/0 via-[#8c5cff]/5 to-[#8c5cff]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    {/* Glowing orb effect */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#8c5cff]/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150"></div>

                    <div className="relative p-5">
                      {/* Icon Section with floating animation */}
                      <motion.div
                        className="mb-4 relative"
                        whileHover={!isMobile ? { y: -10 } : {}}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="relative inline-block">
                          {/* Glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-[#8c5cff] to-[#6a3dcf] rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>

                          {/* Icon container */}
                          <div className="relative w-14 h-14 bg-gradient-to-br from-[#8c5cff] to-[#6a3dcf] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:shadow-[#8c5cff]/50 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                            {IconComponent && <IconComponent className="text-white" size={28} strokeWidth={2.5} />}
                          </div>

                          {/* Orbiting dots */}
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#8c5cff] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#a371ff] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </motion.div>

                      {/* Content */}
                      <div className="space-y-3">
                        <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#8c5cff] group-hover:bg-clip-text transition-all duration-500" style={{ fontWeight: 700 }}>
                          {capacitacion.title}
                        </h3>

                        <p className="text-gray-400 group-hover:text-gray-300 text-sm leading-relaxed transition-colors duration-500">
                          {capacitacion.description}
                        </p>

                        {/* Duration badge */}
                        <div className="flex items-center gap-2 pt-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8c5cff]/10 group-hover:bg-[#8c5cff]/20 rounded-full border border-[#8c5cff]/30 transition-all duration-500">
                            <Clock size={14} className="text-[#8c5cff]" />
                            <span className="text-[#8c5cff] font-semibold text-xs">{capacitacion.duration}</span>
                          </div>

                          {/* Arrow indicator */}
                          <motion.div
                            className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-500"
                            animate={!isMobile ? { x: [0, 5, 0] } : {}}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            <ArrowRight className="text-[#8c5cff]" size={20} />
                          </motion.div>
                        </div>
                      </div>

                      {/* Bottom decorative line */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8c5cff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Profesionales/Testimonios Section */}
      <section id="profesionales" className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#8c5cff]" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Qué Piensan Nuestros Profesionales
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Historias de éxito de nutricionistas que transformaron su carrera
            </p>
          </motion.div>

          <div className="flex flex-col gap-12">
            {mockData.testimonios.map((testimonio, index) => (
              <motion.div
                key={testimonio.id}
                initial={isMobile ? { opacity: 1 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={isMobile ? {} : { duration: 0.7, delay: 0.2 }}
                className="group"
              >
                <div className={`relative bg-gradient-to-br from-[#2a2c33] to-[#1a1c22] rounded-2xl overflow-hidden border border-[#8c5cff]/20 hover:border-[#8c5cff]/60 transition-all duration-500 hover:shadow-2xl hover:shadow-[#8c5cff]/30 ${
                  index % 2 === 0 ? '' : 'md:flex-row-reverse'
                }`}>
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8c5cff]/5 via-transparent to-[#8c5cff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 p-8 md:p-10">
                    {/* Photo Section */}
                    <motion.div
                      className={`relative flex-shrink-0 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}
                      whileHover={!isMobile ? { scale: 1.05 } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative w-48 h-48 md:w-56 md:h-56">
                        {/* Glow effect behind image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#8c5cff]/30 to-[#6a3dcf]/30 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-110"></div>

                        {/* Image with transparent background */}
                        <div className="relative z-10 w-full h-full">
                          <img
                            src={testimonio.photo}
                            alt={testimonio.name}
                            className="w-full h-full object-contain drop-shadow-2xl filter group-hover:brightness-110 transition-all duration-500"
                          />
                        </div>

                        {/* Accent border decoration */}
                        <div className="absolute -bottom-2 -right-2 w-20 h-20 border-4 border-[#8c5cff] rounded-tl-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                        <div className="absolute -top-2 -left-2 w-20 h-20 border-4 border-[#8c5cff] rounded-br-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                      </div>
                    </motion.div>

                    {/* Content Section */}
                    <div className={`flex-1 flex flex-col justify-center ${index % 2 === 0 ? 'md:order-2 md:pl-4' : 'md:order-1 md:pr-4'} ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'} text-center`}>
                      {/* Name */}
                      <motion.h3
                        className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white via-[#8c5cff] to-white bg-clip-text text-transparent group-hover:from-[#8c5cff] group-hover:via-white group-hover:to-[#8c5cff] transition-all duration-500"
                        style={{ fontWeight: 800, letterSpacing: '-0.01em' }}
                      >
                        {testimonio.name}
                      </motion.h3>

                      {/* Role */}
                      <p className="text-[#8c5cff] font-semibold text-lg mb-4 tracking-wide">
                        {testimonio.role}
                      </p>

                      {/* Stars */}
                      <div className={`flex gap-1 mb-6 ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'} justify-center`}>
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                          >
                            <Star size={18} className="text-[#8c5cff] fill-[#8c5cff]" />
                          </motion.div>
                        ))}
                      </div>

                      {/* Quote */}
                      <div className="relative">
                        {/* Opening quote mark */}
                        <div className={`absolute -top-4 ${index % 2 === 0 ? '-left-2 md:-left-4' : '-right-2 md:-right-4 md:left-auto left-0'} text-[#8c5cff]/30 text-6xl font-serif leading-none`}>"</div>

                        <p className="text-gray-300 text-lg md:text-xl leading-relaxed relative z-10 italic font-light">
                          {testimonio.quote}
                        </p>

                        {/* Closing quote mark */}
                        <div className={`absolute -bottom-8 ${index % 2 === 0 ? 'right-0 md:right-4' : 'left-0 md:left-4'} text-[#8c5cff]/30 text-6xl font-serif leading-none`}>"</div>
                      </div>

                      {/* Decorative line */}
                      <div className={`mt-8 h-1 bg-gradient-to-r from-transparent via-[#8c5cff] to-transparent ${index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'} w-3/4 mx-auto md:mx-0 opacity-30 group-hover:opacity-60 transition-opacity duration-500`}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Organigrama Section - Ultra Modern Org Chart */}
      <section id="organigrama" className="py-32 px-4 bg-gradient-to-b from-black via-[#0a0a0a] to-black relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#8c5cff 1px, transparent 1px), linear-gradient(90deg, #8c5cff 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Radial gradient overlays */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#8c5cff]/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <motion.div
              initial={isMobile ? { opacity: 1 } : { scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <div className="px-8 py-3 bg-gradient-to-r from-[#8c5cff]/20 to-[#6a3dcf]/20 rounded-full border border-[#8c5cff]/40 backdrop-blur-sm">
                <span className="text-[#8c5cff] font-bold text-base tracking-widest uppercase">Liderazgo</span>
              </div>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-[#8c5cff] to-white bg-clip-text text-transparent" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              {mockData.organigrama.title}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              {mockData.organigrama.subtitle}
            </p>
          </motion.div>

          <div className="space-y-16">
            {[1, 2, 3].map((nivel) => {
              const miembros = mockData.organigrama.estructura.filter(m => m.nivel === nivel);
              return (
                <div key={nivel} className="flex flex-col items-center">
                  <div className={`grid gap-4 md:gap-8 w-full ${
                    nivel === 1 ? 'grid-cols-1 max-w-2xl' :
                    nivel === 2 ? 'grid-cols-3 max-w-6xl' :
                    'grid-cols-3 max-w-6xl'
                  }`}>
                    {miembros.map((miembro, index) => (
                      <motion.div
                        key={miembro.id}
                        initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 60, scale: 0.8 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={isMobile ?
                          {} :
                          {
                            duration: 0.7,
                            delay: index * 0.2,
                            type: "spring",
                            stiffness: 80
                          }
                        }
                        className="group cursor-pointer"
                      >
                        <div className="relative">
                          {/* Connecting line top */}
                          {nivel > 1 && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-[#8c5cff]/50 to-[#8c5cff] hidden md:block"></div>
                          )}

                          {miembro.foto ? (
                            /* Layout for members with photo - expandable card */
                            <div className="relative group/member">
                              {/* Photo */}
                              <motion.div
                                className="relative cursor-pointer"
                                whileHover={!isMobile ? { scale: 1.03 } : {}}
                                transition={{ type: "spring", stiffness: 300 }}
                                onClick={() => isMobile && setShowMemberDescription(showMemberDescription === miembro.id ? null : miembro.id)}
                              >
                                <img
                                  src={miembro.foto}
                                  alt={miembro.nombre}
                                  className={`${
                                    nivel === 1 ? 'w-full max-w-[200px] md:max-w-md' :
                                    nivel === 2 ? 'w-full max-w-[100px] md:max-w-xs' :
                                    'w-full max-w-[100px] md:max-w-sm'
                                  } h-auto object-contain drop-shadow-2xl transition-all duration-300 mx-auto`}
                                />
                              </motion.div>

                              {/* Name and Title below photo */}
                              <div className="mt-2 md:mt-6 text-center space-y-0.5 md:space-y-2">
                                <h3 className={`${
                                  nivel === 1 ? 'text-base md:text-3xl' :
                                  nivel === 2 ? 'text-xs md:text-2xl' :
                                  'text-xs md:text-xl'
                                } font-bold text-white leading-tight`}
                                  style={{ fontWeight: 800, letterSpacing: '-0.02em' }}
                                >
                                  {miembro.nombre}
                                </h3>
                                <p className={`${
                                  nivel === 1 ? 'text-xs md:text-xl' :
                                  nivel === 2 ? 'text-[10px] md:text-lg' :
                                  'text-[10px] md:text-base'
                                } text-[#8c5cff] font-semibold uppercase tracking-wide leading-tight`}>
                                  {miembro.cargo}
                                </p>
                              </div>

                              {/* Expandable Description Card - appears on hover (Desktop) */}
                              {miembro.descripcion && !isMobile && (
                                <div className="absolute left-full top-0 ml-8 w-80 opacity-0 group-hover/member:opacity-100 invisible group-hover/member:visible transition-all duration-500 z-50">
                                  {/* Arrow pointing to image */}
                                  <div className="absolute left-0 top-8 -translate-x-full">
                                    <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-[#2a2c33]"></div>
                                  </div>

                                  {/* Description card */}
                                  <div className="relative bg-gradient-to-br from-[#2a2c33] via-[#1f2127] to-[#1a1c22] rounded-2xl border border-[#8c5cff]/40 shadow-2xl shadow-[#8c5cff]/20 p-6 backdrop-blur-xl transform group-hover/member:translate-x-0 -translate-x-4 transition-transform duration-500">
                                    {/* Glowing effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#8c5cff]/10 via-transparent to-[#6a3dcf]/10 rounded-2xl"></div>

                                    {/* Content */}
                                    <div className="relative z-10">
                                      {/* Title badge */}
                                      <div className="inline-flex items-center px-3 py-1 bg-[#8c5cff]/20 rounded-full border border-[#8c5cff]/40 mb-4">
                                        <span className="text-xs text-[#8c5cff] font-bold uppercase tracking-wider">
                                          Perfil Profesional
                                        </span>
                                      </div>

                                      {/* Description text */}
                                      <p className="text-sm text-gray-300 leading-relaxed">
                                        {miembro.descripcion}
                                      </p>
                                    </div>

                                    {/* Decorative corner */}
                                    <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#8c5cff]/30 rounded-tr-2xl"></div>
                                    <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#8c5cff]/30 rounded-bl-2xl"></div>
                                  </div>
                                </div>
                              )}

                            </div>
                          ) : (
                            /* Layout for members without photo - keep card */
                            <div className="relative bg-gradient-to-br from-[#2a2c33] via-[#1f2127] to-[#1a1c22] rounded-2xl overflow-hidden border border-[#8c5cff]/30 group-hover:border-[#8c5cff] transition-all duration-500 hover:shadow-xl hover:shadow-[#8c5cff]/30 p-6">
                              {/* Glowing background effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-[#8c5cff]/0 via-[#8c5cff]/10 to-[#8c5cff]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                {/* Avatar */}
                                <motion.div
                                  className="relative"
                                  whileHover={!isMobile ? { scale: 1.05 } : {}}
                                  transition={{ type: "spring", stiffness: 300 }}
                                >
                                  <div className={`relative ${
                                    nivel === 1 ? 'w-24 h-24' : nivel === 2 ? 'w-20 h-20' : 'w-16 h-16'
                                  } mx-auto bg-gradient-to-br from-[#8c5cff] to-[#6a3dcf] rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-[#1a1c22] group-hover:border-[#8c5cff]/50 transition-all duration-500`}
                                    style={{ fontSize: nivel === 1 ? '1.5rem' : nivel === 2 ? '1.25rem' : '1rem' }}
                                  >
                                    {miembro.nombre.split(' ').map(n => n.charAt(0)).join('')}
                                  </div>
                                </motion.div>

                                {/* Content */}
                                <div className="space-y-2">
                                  <h3 className={`${
                                    nivel === 1 ? 'text-xl md:text-2xl' : nivel === 2 ? 'text-lg md:text-xl' : 'text-base md:text-lg'
                                  } font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#8c5cff] group-hover:to-white group-hover:bg-clip-text transition-all duration-500`}
                                    style={{ fontWeight: 800 }}
                                  >
                                    {miembro.cargo}
                                  </h3>

                                  <p className={`${
                                    nivel === 1 ? 'text-base' : 'text-sm'
                                  } text-[#8c5cff] font-semibold`}>
                                    {miembro.nombre}
                                  </p>

                                  {/* Description */}
                                  {miembro.descripcion && (
                                    <p className="text-sm text-gray-400 leading-relaxed pt-3 border-t border-[#8c5cff]/20">
                                      {miembro.descripcion}
                                    </p>
                                  )}

                                  {/* Area badge */}
                                  {miembro.area && (
                                    <div className="inline-flex items-center px-4 py-1.5 bg-[#8c5cff]/10 group-hover:bg-[#8c5cff]/20 rounded-full border border-[#8c5cff]/30 transition-all duration-500 mt-3">
                                      <span className="text-xs text-gray-400 group-hover:text-gray-300 font-medium">
                                        {miembro.area}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mobile: Full-width description card */}
                  {isMobile && showMemberDescription && (
                    <AnimatePresence>
                      {miembros.find(m => m.id === showMemberDescription) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 overflow-hidden w-full"
                        >
                          {/* Description card - full width */}
                          <div className="relative bg-gradient-to-br from-[#2a2c33] via-[#1f2127] to-[#1a1c22] rounded-2xl border border-[#8c5cff]/40 shadow-2xl shadow-[#8c5cff]/20 p-4 backdrop-blur-xl">
                            {/* Glowing effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#8c5cff]/10 via-transparent to-[#6a3dcf]/10 rounded-2xl"></div>

                            {/* Content */}
                            <div className="relative z-10">
                              {/* Title badge */}
                              <div className="inline-flex items-center px-3 py-1 bg-[#8c5cff]/20 rounded-full border border-[#8c5cff]/40 mb-3">
                                <span className="text-xs text-[#8c5cff] font-bold uppercase tracking-wider">
                                  Perfil Profesional
                                </span>
                              </div>

                              {/* Description text - full text for nivel 1 and Vicepresidente (id:2), truncated for others */}
                              <p className="text-xs text-gray-300 leading-relaxed">
                                {(nivel === 1 || showMemberDescription === 2)
                                  ? miembros.find(m => m.id === showMemberDescription)?.descripcion
                                  : miembros.find(m => m.id === showMemberDescription)?.descripcion.split('.')[0] + '.'}
                              </p>
                            </div>

                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#8c5cff]/30 rounded-tr-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#8c5cff]/30 rounded-bl-2xl"></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  {/* Connecting lines between levels */}
                  {nivel < 3 && (
                    <motion.div
                      initial={isMobile ? { opacity: 1 } : { opacity: 0, scaleY: 0 }}
                      whileInView={{ opacity: 1, scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="relative my-8 hidden md:block"
                    >
                      {/* Main vertical line */}
                      <div className="w-1 h-16 bg-gradient-to-b from-[#8c5cff] via-[#8c5cff]/50 to-[#8c5cff] mx-auto relative">
                        {/* Pulsing dot */}
                        <motion.div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#8c5cff] rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        ></motion.div>
                      </div>

                      {/* Horizontal branching lines */}
                      {nivel === 1 && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 flex gap-32">
                          <div className="w-0.5 h-8 bg-gradient-to-b from-[#8c5cff] to-transparent"></div>
                          <div className="w-0.5 h-8 bg-gradient-to-b from-[#8c5cff] to-transparent"></div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-[#0a0a0a] to-black border-t border-[#8c5cff]/20 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Brand Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#8c5cff] to-[#a371ff] bg-clip-text text-transparent" style={{ fontWeight: 800 }}>
                  ASOCHINUF
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Asociación Chilena de Nutricionistas en el Fútbol
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-500 text-sm">
                  Elevando los estándares de la nutrición deportiva en el fútbol profesional chileno
                </p>
              </div>

              {/* Contact Info */}
              <div className="pt-4 space-y-2">
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#8c5cff] rounded-full"></span>
                  contacto@asochinuf.cl
                </p>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#8c5cff] rounded-full"></span>
                  Santiago, Chile
                </p>
              </div>
            </div>

            {/* Social Section */}
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-bold mb-6 text-xl" style={{ fontWeight: 700 }}>Síguenos</h4>
                <div className="flex gap-4 flex-wrap">
                  {mockData.footer.social.map((social) => {
                    const IconComponent = iconMap[social.icon];
                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        className="group relative"
                        aria-label={social.name}
                      >
                        <div className="absolute inset-0 bg-[#8c5cff] rounded-xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-[#2a2c33] to-[#1a1c22] rounded-xl flex items-center justify-center text-[#8c5cff] border border-[#8c5cff]/30 group-hover:border-[#8c5cff] group-hover:bg-[#8c5cff] group-hover:text-white transition-all duration-300 group-hover:scale-110">
                          {IconComponent && <IconComponent size={22} strokeWidth={2} />}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Stats or Info */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-gradient-to-br from-[#2a2c33] to-[#1a1c22] rounded-xl p-4 border border-[#8c5cff]/20">
                  <p className="text-2xl font-bold text-[#8c5cff]">100+</p>
                  <p className="text-xs text-gray-400 mt-1">Profesionales certificados</p>
                </div>
                <div className="bg-gradient-to-br from-[#2a2c33] to-[#1a1c22] rounded-xl p-4 border border-[#8c5cff]/20">
                  <p className="text-2xl font-bold text-[#8c5cff]">10+</p>
                  <p className="text-xs text-gray-400 mt-1">Clubes asociados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#8c5cff]/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">{mockData.footer.copyright}</p>
            <div className="flex gap-6 text-xs text-gray-500">
              <button className="hover:text-[#8c5cff] transition-colors">Política de Privacidad</button>
              <button className="hover:text-[#8c5cff] transition-colors">Términos de Uso</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal - Login, Registro, Recuperación */}
      <AuthModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default Home;
