/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      invert: {
        20: '.2',
      },
      transitionDuration: {
        DEFAULT: '150ms'
      },
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

          300: "#D3EAFF",
          200: "#DDEEFF",
          100: "#E7F3FF"
        },
        light: "#EEEEEE",
        dark: {
          1: "#111111",
          2: "#222222",
          DEFAULT: "#333333",
          4: "#444444",
          5: "#555555",
          6: "#666666",
          7: "#777777",
          8: "#888888",
          9: "#999999",
          a: "#AAAAAA",
        }
      },
    },
    plugins: [],
  }
}

