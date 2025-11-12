import { useEffect, useRef, useMemo } from 'react';

const StarBorder = ({
  as: Component = 'button',
  className = '',
  color = '#8c5cff',
  speed = '6s',
  thickness = 2,
  children,
  ...rest
}) => {
  const ref = useRef(null);
  const animationName = useMemo(() => {
    const randomBytes = new Uint8Array(4);
    crypto.getRandomValues(randomBytes);
    const hex = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `star-border-${hex}`;
  }, []);

  useEffect(() => {
    // Create style tag for keyframes animation
    const style = document.createElement('style');

    style.textContent = `
      @keyframes ${animationName} {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [animationName]);

  return (
    <Component
      ref={ref}
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[${color}]/50 group ${className}`}
      style={{
        padding: `${thickness}px`,
        background: `linear-gradient(90deg, ${color}, ${color}, transparent, ${color}, ${color}) 0% 0% / 200% 100%`,
        animation: `${animationName} ${speed} linear infinite`,
        ...rest.style
      }}
      {...rest}
    >
      {/* Inner content - transparent background */}
      <div className="flex items-center justify-center gap-2 text-white text-center text-[16px] py-4 px-8 rounded-full bg-black/80 hover:bg-black/60 transition-colors duration-300 backdrop-blur-sm">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
