/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEEDFE',
          100: '#D5D3FC',
          500: '#7F77DD',
          600: '#534AB7',
          700: '#3C3489',
        }
      }
    },
  },
  plugins: [],
}