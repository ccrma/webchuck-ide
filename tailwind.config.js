/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: true,
  theme: {
    transitionDuration: {
      DEFAULT: '300ms'
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
          100: "#003366",
          200: "#99D7FF",
          300: "#C9E0F7",
          400: "#9999FF",
          700: "#BBDBFA",
          800: "#DDEEFF",
          900: "#E7F3FF"
        },
        light: "#EEEEEE",
        dark: "#333333"
      },
    },
    plugins: [],
  }
}

