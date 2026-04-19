/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'groww-teal': '#00D09C',
        'groww-gray': '#F1F1F5',
        'groww-dark': '#44475B',
        'groww-text-muted': '#7C7E8C',
        'apple-gray': '#F5F5F7',
        'apple-blue': '#0071E3',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      scale: {
        '98': '0.98',
      }
    },
  },
  plugins: [],
}
