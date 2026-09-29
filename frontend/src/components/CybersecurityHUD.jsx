import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';

export default function CybersecurityHUD() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
      {/* Central Cyan/Blue Atmospheric Radial Glow */}
      <div className="absolute w-[700px] h-[700px] rounded-full bg-gradient-to-r from-cyan-500/15 via-[#0878D1]/10 to-transparent blur-[120px] animate-pulse" />

      {/* SVG Multi-Layered Rotating Security Rings */}
      <div className="relative w-[720px] h-[720px] flex items-center justify-center opacity-70 dark:opacity-80">
        
        {/* Layer 1: Outermost Dashed Cyan Ring (Rotates Clockwise 60s) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-cyan-400/30"
          style={{ boxShadow: '0 0 30px rgba(25, 198, 232, 0.15)' }}
        />

        {/* Layer 2: Segmented Data Ring (Rotates Counter-Clockwise 45s) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-8 rounded-full border border-cyan-500/20"
        >
          {/* 4 Cardinal Tick Markers */}
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1 bg-cyan-400/80 rounded-full shadow-[0_0_8px_#19C6E8]" />
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-1 bg-cyan-400/80 rounded-full shadow-[0_0_8px_#19C6E8]" />
          <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-1 bg-cyan-400/80 rounded-full shadow-[0_0_8px_#19C6E8]" />
          <span className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 h-4 w-1 bg-cyan-400/80 rounded-full shadow-[0_0_8px_#19C6E8]" />

          {/* Diagonal Corner Tick Marks */}
          <span className="absolute top-[14%] left-[14%] w-2 h-2 rounded-full bg-cyan-400/60 shadow-[0_0_6px_#19C6E8]" />
          <span className="absolute top-[14%] right-[14%] w-2 h-2 rounded-full bg-cyan-400/60 shadow-[0_0_6px_#19C6E8]" />
          <span className="absolute bottom-[14%] left-[14%] w-2 h-2 rounded-full bg-cyan-400/60 shadow-[0_0_6px_#19C6E8]" />
          <span className="absolute bottom-[14%] right-[14%] w-2 h-2 rounded-full bg-cyan-400/60 shadow-[0_0_6px_#19C6E8]" />
        </motion.div>

        {/* Layer 3: Concentric Tech Ring with Security Badges */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-16 rounded-full border border-cyan-400/25"
        >
          {/* Orbiting Security Shield Node */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-[#071525] border border-cyan-400 shadow-[0_0_12px_rgba(25,198,232,0.6)]">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          {/* Orbiting Security Lock Node */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-[#071525] border border-emerald-400 shadow-[0_0_12px_rgba(32,180,134,0.6)]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </motion.div>

        {/* Layer 4: Inner Pulse Aura Ring */}
        <motion.div
          animate={{ scale: [0.98, 1.02, 0.98], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-28 rounded-full border border-cyan-300/30"
          style={{ boxShadow: 'inset 0 0 25px rgba(25, 198, 232, 0.2)' }}
        />

        {/* Micro-Data Ring */}
        <div className="absolute inset-36 rounded-full border border-dotted border-slate-400/20" />
      </div>
    </div>
  );
}
