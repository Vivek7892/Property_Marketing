/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: '#F8FAFC',
        card: '#FFFFFF',
        primary: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        secondary: '#0F172A',
        success: '#10B981',
        warning: '#F59E0B',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      boxShadow: {
        card: '0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)',
        'card-hover': '0_8px_30px_rgba(0,0,0,0.10)',
        blue: '0_2px_8px_rgba(37,99,235,0.3)',
      },
      ringWidth: {
        3: '3px',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
