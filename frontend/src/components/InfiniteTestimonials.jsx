import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './InfiniteTestimonials.css';

const InfiniteTestimonials = ({ testimonios }) => {
  const [loadedImages, setLoadedImages] = useState({});
  const loadingRef = useRef(new Set());
  const loadedRef = useRef({});

  const { row1, row2, row3 } = useMemo(() => {
    const itemsPerRow = Math.ceil(testimonios.length / 3);
    return {
      row1: testimonios.slice(0, itemsPerRow),
      row2: testimonios.slice(itemsPerRow, itemsPerRow * 2),
      row3: testimonios.slice(itemsPerRow * 2)
    };
  }, [testimonios]);

  // Preload todas las imágenes para evitar parpadeos
  useEffect(() => {
    // Obtener URLs únicas de fotos
    const photoUrls = [];
    const photoSet = new Set();
    testimonios.forEach(t => {
      if (t.photo && !photoSet.has(t.photo)) {
        photoSet.add(t.photo);
        photoUrls.push(t.photo);
      }
    });

    // Cargar solo las fotos que no han sido cargadas ni están en proceso
    photoUrls.forEach((photoUrl) => {
      if (!loadedRef.current[photoUrl] && !loadingRef.current.has(photoUrl)) {
        loadingRef.current.add(photoUrl);
        const img = new Image();
        img.onload = () => {
          loadedRef.current[photoUrl] = true;
          setLoadedImages(prev => ({
            ...prev,
            [photoUrl]: true
          }));
        };
        img.onerror = () => {
          loadedRef.current[photoUrl] = true;
          setLoadedImages(prev => ({
            ...prev,
            [photoUrl]: true
          }));
        };
        img.src = photoUrl;
      }
    });
  }, [testimonios.length]); // Usar solo la longitud como dependencia

  const duplicateRow = (row) => [...row, ...row, ...row];

  const TestimonialCard = React.memo(({ testimonio, isLoaded }) => {
    return (
      <motion.div
        className="flex-shrink-0 w-64 sm:w-72 md:w-96"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative h-full bg-gradient-to-br from-[#2a2c33] to-[#1a1c22] rounded-2xl overflow-hidden border border-[#8c5cff]/20 hover:border-[#8c5cff]/60 transition-all duration-500 hover:shadow-2xl hover:shadow-[#8c5cff]/30 p-3 sm:p-5 md:p-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8c5cff]/5 via-transparent to-[#8c5cff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
              <div className="relative w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 flex-shrink-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8c5cff]/30 to-[#6a3dcf]/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8c5cff]/20 to-[#6a3dcf]/20 rounded-full border-2 border-[#8c5cff]/40 group-hover:border-[#8c5cff] transition-all duration-300 overflow-hidden">
                  {testimonio.photo ? (
                    <>
                      <img
                        src={testimonio.photo}
                        alt={testimonio.name}
                        className="w-full h-full object-cover"
                        style={{ display: isLoaded ? 'block' : 'none' }}
                      />
                      {!isLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#8c5cff]/40 to-[#6a3dcf]/40 animate-pulse"></div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#8c5cff]/40 to-[#6a3dcf]/40"></div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm md:text-lg font-bold text-white truncate group-hover:text-[#8c5cff] transition-colors duration-300">
                  {testimonio.name}
                </h4>
                <p className="text-xs sm:text-xs md:text-sm text-[#8c5cff] font-semibold truncate">
                  {testimonio.role}
                </p>
              </div>
            </div>

            <div className="relative flex-1">
              <p className="text-gray-300 text-xs sm:text-xs md:text-sm leading-relaxed italic font-light">
                "{testimonio.quote}"
              </p>
            </div>

            <div className="mt-3 sm:mt-4 h-0.5 bg-gradient-to-r from-transparent via-[#8c5cff] to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
          </div>
        </div>
      </motion.div>
    );
  });

  TestimonialCard.displayName = 'TestimonialCard';

  return (
    <div className="w-full space-y-3 sm:space-y-4 md:space-y-6">
      {/* Row 1 */}
      <div className="relative overflow-hidden">
        <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-black via-black to-transparent z-10 pointer-events-none"></div>
        <div className="scroll-animation-container">
          <div className="flex gap-2 sm:gap-3 md:gap-6 scroll-animation-left">
            {duplicateRow(row1).map((testimonio, index) => (
              <TestimonialCard
                key={`row1-${index}`}
                testimonio={testimonio}
                isLoaded={loadedImages[testimonio.photo] || !testimonio.photo}
              />
            ))}
          </div>
        </div>
        <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-black via-black to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* Row 2 */}
      <div className="relative overflow-hidden">
        <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-black via-black to-transparent z-10 pointer-events-none"></div>
        <div className="scroll-animation-container">
          <div className="flex gap-2 sm:gap-3 md:gap-6 scroll-animation-right">
            {duplicateRow(row2).map((testimonio, index) => (
              <TestimonialCard
                key={`row2-${index}`}
                testimonio={testimonio}
                isLoaded={loadedImages[testimonio.photo] || !testimonio.photo}
              />
            ))}
          </div>
        </div>
        <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-black via-black to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* Row 3 */}
      <div className="relative overflow-hidden">
        <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-black via-black to-transparent z-10 pointer-events-none"></div>
        <div className="scroll-animation-container">
          <div className="flex gap-2 sm:gap-3 md:gap-6 scroll-animation-left">
            {duplicateRow(row3).map((testimonio, index) => (
              <TestimonialCard
                key={`row3-${index}`}
                testimonio={testimonio}
                isLoaded={loadedImages[testimonio.photo] || !testimonio.photo}
              />
            ))}
          </div>
        </div>
        <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-black via-black to-transparent z-10 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default InfiniteTestimonials;
