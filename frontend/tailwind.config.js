/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#0b0f19', // Deep dark graphite background
          900: '#111827', // Dark card background
          800: '#1f2937', // Hover state grey
          700: '#374151', // Border / secondary layout grey
          600: '#4b5563', // Muted text
          500: '#6b7280', // Inactive icons
          400: '#9ca3af', // Secondary text
          300: '#d1d5db', // Normal text
          200: '#e5e7eb', // Bright highlights
          100: '#f3f4f6', // Maximum white text
        },
        metal: {
          copper: '#d97706',      // Rich warm amber/copper
          steel: '#64748b',       // High-quality slate steel
          aluminium: '#94a3b8',   // Bright metallic silver-grey
          brass: '#b45309',       // Deep golden yellow-brown
        },
        neon: {
          green: '#10b981',       // High-visibility processing emerald
          blue: '#3b82f6',        // Digital display blue
          yellow: '#f59e0b',      // Warning/caution amber
          red: '#ef4444'          // Emergency/alert red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.15)',
        'neon-amber': '0 0 15px rgba(217, 119, 6, 0.15)',
        'neon-blue': '0 0 15px rgba(59, 130, 246, 0.15)',
        'glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
