/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#f2b90d",
        "primary-hover": "#d9a50b",
        "primary-dark": "#b38600",
        "secondary": "#a32424",
        "accent-red": "#8a1c1c",
        "accent-red-bright": "#c42b2b",
        "background-dark": "#0a0a0a",
        "surface-dark": "#161616",
        "surface-accent": "#231e10",
        "border-gold": "#493f22",
      },
      fontFamily: {
        "display": ["Cinzel", "serif"],
        "sans": ["Space Grotesk", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
