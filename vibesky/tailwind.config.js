/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d0b14',
        panel: '#16121f',
        panel2: '#1e1930',
        ink: '#f4f2fb',
        ink2: '#a49dc0',
        accent: '#ff7ac6',
        accent2: '#8f5bff',
        warm: '#ffc857'
      }
    }
  },
  plugins: []
}