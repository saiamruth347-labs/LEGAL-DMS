import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShieldCheck, Award, Lock, Sparkles, Globe, Cpu } from 'lucide-react';

export default function SovereignMotionGateway() {
  const cardRef = useRef(null);

  // 3D Spring Tilt Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 180, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);
  const glareX = useTransform(smoothX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(smoothY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-4 perspective-1000">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="sovereign-motion-card relative overflow-hidden rounded-3xl shadow-2xl group"
      >
        {/* National Tricolour Ribbon at Top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-95 shadow-[0_0_12px_rgba(255,153,51,0.5)]" />

        {/* Ambient Subtle Background Glow */}
        <div className="absolute -top-24 left-1/4 w-96 h-40 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 right-1/4 w-96 h-40 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Specular Sheen Glare */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-500"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle 350px at ${gx} ${gy}, rgba(251,191,36,0.35), transparent 70%)`
            ),
          }}
        />

        <div className="p-4 sm:p-5 lg:p-6 flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
          
          {/* Left: 3D Realistic Legislative Dome Motion Vignette */}
          <div className="flex items-center space-x-4 sm:space-x-5 flex-shrink-0">
            {/* The Real Legislative Dome + Ashoka Capital Photograph */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-xl shadow-amber-500/20 bg-slate-950 flex-shrink-0 ring-2 ring-white/10 group-hover:border-amber-300 transition-colors"
            >
              <img
                src="/sovereign-emblem.jpg"
                alt="Ashoka Lion Capital & Indian Tricolour on Legislative Dome"
                className="w-full h-full object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-1 left-0 right-0 text-center">
                <span className="text-[8px] font-bold tracking-widest text-amber-300 uppercase font-mono bg-black/60 px-1 py-0.5 rounded backdrop-blur-xs">
                  NEW DELHI
                </span>
              </div>
            </motion.div>

            {/* Complementary 3D Gold Ashoka Seal Medallion */}
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="hidden sm:block relative w-16 h-16 rounded-2xl overflow-hidden border border-cyan-400/50 shadow-lg shadow-cyan-500/20 bg-slate-950 flex-shrink-0 ring-1 ring-white/10"
              title="State Emblem of India 3D Cryptographic Sculpture"
            >
              <img
                src="/sovereign-gold-3d.jpg"
                alt="3D Golden Ashoka Lion Capital"
                className="w-full h-full object-cover scale-115 group-hover:scale-125 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/40 via-transparent to-transparent pointer-events-none" />
            </motion.div>

            {/* Sovereign Authority Titles */}
            <div className="text-left space-y-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-500 dark:text-amber-300 text-[11px] font-bold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>सत्यमेव जयते</span>
                </span>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800/80 text-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 font-mono font-bold">
                  GOVT OF INDIA
                </span>
                <span className="text-[10px] bg-emerald-950/70 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono">
                  MHA • NCRB
                </span>
              </div>

              <h2 className="sovereign-title text-base sm:text-lg lg:text-xl font-black tracking-tight flex items-center space-x-2">
                <span>National Crime Records Bureau</span>
                <span className="text-xs text-amber-500 dark:text-amber-400 font-mono font-normal hidden lg:inline">
                  (Ministry of Home Affairs)
                </span>
              </h2>

              <p className="sovereign-desc text-xs max-w-xl leading-relaxed font-normal">
                Sovereign Digital Document Custody & Blockchain Chain-of-Custody Infrastructure •
                Under the mandate of Section 63 of Bharatiya Nagarik Suraksha Sanhita (BNSS, 2023).
              </p>
            </div>
          </div>

          {/* Right: Security & Cryptographic Authority Specs */}
          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-5 flex-shrink-0">
            <div className="text-left md:text-right space-y-0.5">
              <div className="text-[10px] font-mono text-cyan-400 font-semibold flex items-center md:justify-end space-x-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>NODE: DELHI-HQ-01</span>
              </div>
              <div className="text-[11px] font-bold text-white flex items-center md:justify-end space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>FIPS 180-4 SHA-256</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Section 63 BNSS Admissible
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-amber-300 bg-amber-950/50 px-2.5 py-1 rounded-xl border border-amber-500/30">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>5FA SEQUENTIAL CLEARANCE</span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
