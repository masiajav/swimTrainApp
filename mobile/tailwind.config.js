/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'swimming': {
          blue: '#0066CC',
          'blue-light': '#3399FF',
          'blue-dark': '#004499',
          teal: '#00B4A6',
          'teal-light': '#33D4CC',
          'teal-dark': '#008B8B',
        },
      },
    },
  },
  plugins: [],
}
