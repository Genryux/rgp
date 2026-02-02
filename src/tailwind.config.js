/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'bebas': ['"Bebas Neue"', 'cursive'],
        'nuosu': ['"Nuosu SIL"', 'serif'],
        'italianno': ['"Italianno"', 'cursive'],
      },
    },
  },
  plugins: [],
}
