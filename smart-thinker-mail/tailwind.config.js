/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'st-blue': '#4285F4',
        'st-green': '#34A853',
        'st-yellow': '#FBBC05',
        'st-red': '#EA4335',
        'st-dark': '#202124',
        'st-gray': '#5f6368',
        'st-light': '#f8f9fa',
        'st-border': '#dfe1e5',
        'mail-bg': '#f6f8fc',
      },
    },
  },
  plugins: [],
}
