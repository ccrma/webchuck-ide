/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    transitionDuration: {
      DEFAULT: '150ms'
    },
    extend: {
      colors: {
        "orange": {
          DEFAULT: "#FF8833",
          dark: "#D2691E",
          light: "#FFAA33",
          peach: "#FFE5C4",
        },
        "sky-blue": {
          DEFAULT: "#DDEEFF",
          900: "#003366",
          800: "#99D7FF",
          700: "#C9E0F7",
          600: "#9999FF",

          300: "#BBDBFA",
          200: "#DDEEFF",
          100: "#E7F3FF"
        },
        light: "#EEEEEE",
        dark: "#333333"
      },
    },
    plugins: [],
  }
}

