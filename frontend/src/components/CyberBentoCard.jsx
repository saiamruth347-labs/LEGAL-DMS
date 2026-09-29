import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * CyberBentoCard - 3D Tactile Defense-Grade Bento Card
 * Combines 3D gyro tilt physics, cursor spotlight tracking,
 * and high-contrast layered depth for government command centers.
 */
export default function CyberBentoCard({
  children,
  className = '',
  glowColor = 'cyan', // 'cyan' | 'emerald' | 'purple' | 'amber' | 'crimson'
  showCorners = true,
  enable3DTilt = true,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);

  // 3D Tilt Motion Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 25,
  });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    if (enable3DTilt) {
      mouseX.set(x / rect.width - 0.5);
      mouseY.set(y / rect.height - 0.5);
    }
  };

  const handleMouseLeave = () => {
    if (enable3DTilt) {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  const glowStyles = {
    cyan: 'hover:border-cyan-500/60 dark:hover:border-cyan-400/50 hover:shadow-[0_16px_36px_-6px_rgba(2,132,199,0.25)] dark:hover:shadow-[0_16px_36px_-8px_rgba(6,182,212,0.3)]',
    emerald: 'hover:border-emerald-500/60 dark:hover:border-emerald-400/50 hover:shadow-[0_16px_36px_-6px_rgba(4,120,87,0.22)] dark:hover:shadow-[0_16px_36px_-8px_rgba(16,185,129,0.3)]',
    purple: 'hover:border-purple-500/60 dark:hover:border-purple-400/50 hover:shadow-[0_16px_36px_-6px_rgba(109,40,217,0.22)] dark:hover:shadow-[0_16px_36px_-8px_rgba(168,85,247,0.3)]',
    amber: 'hover:border-amber-500/60 dark:hover:border-amber-400/50 hover:shadow-[0_16px_36px_-6px_rgba(180,83,9,0.22)] dark:hover:shadow-[0_16px_36px_-8px_rgba(245,158,11,0.3)]',
    crimson: 'hover:border-rose-500/60 dark:hover:border-rose-400/50 hover:shadow-[0_16px_36px_-6px_rgba(190,18,60,0.22)] dark:hover:shadow-[0_16px_36px_-8px_rgba(244,63,94,0.3)]',
  };

  const cornerColor = {
    cyan: 'text-cyan-600 dark:text-cyan-400/60',
    emerald: 'text-emerald-600 dark:text-emerald-400/60',
    purple: 'text-purple-600 dark:text-purple-400/60',
    amber: 'text-amber-600 dark:text-amber-400/60',
    crimson: 'text-rose-600 dark:text-rose-400/60',
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={enable3DTilt ? { rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 } : {}}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`spotlight-card group relative p-5 transition-all duration-200 cursor-default ${glowStyles[glowColor] || glowStyles.cyan} ${className}`}
      {...props}
    >
      {/* 3D Specular Sheen Glare */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-transparent via-white/5 to-white/10 dark:via-cyan-400/5 dark:to-cyan-400/10" />

      {/* HUD Corner Tech Brackets with 3D Depth */}
      {showCorners && (
        <div className="pointer-events-none select-none transition-transform duration-200 group-hover:scale-110" style={{ transform: 'translateZ(10px)' }}>
          <span className={`absolute top-2 left-2 font-mono text-[10px] font-bold ${cornerColor[glowColor]}`}>
            ┌
          </span>
          <span className={`absolute top-2 right-2 font-mono text-[10px] font-bold ${cornerColor[glowColor]}`}>
            ┐
          </span>
          <span className={`absolute bottom-2 left-2 font-mono text-[10px] font-bold ${cornerColor[glowColor]}`}>
            └
          </span>
          <span className={`absolute bottom-2 right-2 font-mono text-[10px] font-bold ${cornerColor[glowColor]}`}>
            ┘
          </span>
        </div>
      )}

      {/* Content with 3D Pop Out */}
      <div className="relative z-10 transition-transform duration-200" style={{ transform: 'translateZ(12px)' }}>
        {children}
      </div>
    </motion.div>
  );
}
