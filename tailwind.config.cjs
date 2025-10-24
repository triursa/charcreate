/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#0f172a',
          100: '#111827',
          200: '#1e293b',
          300: '#273449',
          400: '#334155',
          500: '#3b475f',
        },
      },
    },
  },
  plugins: [],
};
