import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ showLabel = false, className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
        isDark
          ? 'bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-slate-700/80 hover:border-amber-400/50 shadow-lg shadow-black/20'
          : 'bg-white hover:bg-slate-100 text-sky-600 border border-slate-200 hover:border-sky-400/50 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Official GovTech Light Mode' : 'Switch to Cyber Dark Mode'}
      aria-label="Toggle color theme"
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-all duration-300 group-hover:rotate-45 group-hover:scale-110 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
        ) : (
          <Moon className="w-4 h-4 text-sky-600 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110" />
        )}
      </div>

      {showLabel && (
        <span className={`ml-2 text-xs font-semibold tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {isDark ? 'Cyber Dark' : 'Gov Light'}
        </span>
      )}
    </button>
  );
}
