/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'chat-primary': '#7C3AED',
        'chat-secondary': '#EC4899',
      },
    },
  },
  plugins: [],
}