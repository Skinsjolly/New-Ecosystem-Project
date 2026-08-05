/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'st-blue': '#4285F4',
        'st-blue-hover': '#3367D6',
        'st-dark': '#202124',
        'st-gray': '#5f6368',
        'st-light-gray': '#9aa0a6',
        'st-light': '#f8f9fa',
        'st-border': '#dadce0',
        'st-red': '#ea4335',
        'st-green': '#34a853',
        'st-yellow': '#fbbc04',
      },
    },
  },
  plugins: [],
}
