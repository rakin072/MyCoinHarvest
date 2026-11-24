/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0b14',
          surface: '#0d111e',
          card: '#13192c',
          cardHover: '#182038',
          border: 'rgba(255, 255, 255, 0.08)',
          cyan: '#00f0ff',
          purple: '#a855f7',
          pink: '#ec4899',
          gold: '#fbbf24',
          teal: '#0e2d3a',
          coral: '#f97316',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 16px rgba(0, 240, 255, 0.35)',
        'glow-pink': '0 0 16px rgba(236, 72, 153, 0.35)',
        'glow-purple': '0 0 16px rgba(168, 85, 247, 0.35)',
        'glow-gold': '0 0 16px rgba(251, 191, 36, 0.35)',
        'glow-cyan-lg': '0 0 28px rgba(0, 240, 255, 0.5)',
        'glow-dual': '0 0 24px rgba(0, 240, 255, 0.3), 0 0 24px rgba(236, 72, 153, 0.3)',
      },
      animation: {
        'float-slow': 'float 3.5s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'spin-slow': 'spin 18s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
