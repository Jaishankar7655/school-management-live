/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2f7',
          100: '#d5dfe9',
          200: '#abbfd3',
          300: '#7f9ebd',
          400: '#567ea7',
          500: '#1B2A4A',
          600: '#182543',
          700: '#14203a',
          800: '#101a30',
          900: '#0c1425',
        },
        accent: {
          50: '#fef6ee',
          100: '#fce8d0',
          200: '#f9cfa0',
          300: '#f5b370',
          400: '#f29640',
          500: '#E8913A',
          600: '#c67a30',
          700: '#a46326',
          800: '#824d1d',
          900: '#613813',
        },
        surface: '#FFFFFF',
        background: '#F5F5F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
