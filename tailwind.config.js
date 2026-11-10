/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['newyork', 'serif'],
        mono: ['ltsuperiormono_medium', 'monospace'],
      },
      colors: {
        dark: '#000000',
        light: '#ffffff',
      }
    },
  },
  plugins: [],
}
