/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
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
          100: "#C3E2FF",
          200: "#68B7FF",
        },
        light: "#EEEEEE",
        dark: "#333333"
      },
    },
    plugins: [],
  }
}

