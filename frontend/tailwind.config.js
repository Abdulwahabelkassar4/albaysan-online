/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f8f5ff",
          100: "#f1ebff",
          200: "#ded0ff",
          300: "#c0a1ff",
          400: "#a075ff",
          500: "#7c49e0",
          600: "#5d32b3",
          700: "#452585",
          800: "#2c154f",
          900: "#18092b",
        },
        secondary: {
          50: "#fff5f7",
          100: "#ffe1eb",
          200: "#ffb8d1",
          300: "#ff8fb8",
          400: "#ff669f",
          500: "#dc3c86",
          600: "#ad2e68",
          700: "#7d214b",
          800: "#4e142d",
          900: "#200611",
        },
        neutral: {
          900: "#0f0b1a",
        },
      },
      fontFamily: {
        sans: ['"Cairo"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        floral:
          "radial-gradient(circle at 20% 20%, rgba(124,73,224,0.12), transparent 55%), radial-gradient(circle at 80% 0, rgba(220,60,134,0.18), transparent 50%)",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

