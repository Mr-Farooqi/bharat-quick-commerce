/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blinkit: {
          yellow: '#F8CB46',
          green: '#0C831F',
          dark: '#1C1C1C',
          lightBg: '#F8F9FA',
        }
      }
    },
  },
  plugins: [],
}
