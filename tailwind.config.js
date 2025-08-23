/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'dark-blue': '#0b0b46',
        'green': '#94BB0D',
        'greeny': '#0B3D3B',
        'white': '#e1e5e4',
        'black': '#181a15'
      },
    },
  },
  plugins: [],
}
