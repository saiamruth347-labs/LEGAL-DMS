/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#070B14',
          darker: '#04070D',
          panel: '#0B132B',
          card: '#0F1E36',
          cardHover: '#152542',
          border: '#1E293B',
          borderLight: '#334155',
          accent: '#0284C7',
          cyan: '#06B6D4',
          cyanLight: '#38BDF8',
          glow: '#38BDF8',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          purple: '#8B5CF6',
          text: '#F1F5F9',
          muted: '#94A3B8'
        },
        gov: {
          navy: '#0A192F',
          blue: '#1E3A8A',
          gold: '#D97706',
          surface: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          text: '#0F172A',
          subtext: '#475569'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.25)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.25)',
        'glow-purple': '0 0 20px -3px rgba(139, 92, 246, 0.25)',
        'glow-rose': '0 0 20px -3px rgba(239, 68, 68, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
