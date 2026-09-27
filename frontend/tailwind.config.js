/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#581c87",
          900: "#2e1065",
          950: "#130722",
        },
        rose: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        secondary: {
          50: "#fff5f8",
          100: "#ffe3ed",
          200: "#ffc7dc",
          300: "#ff9bc2",
          400: "#ff639f",
          500: "#f43f8e",
          600: "#d91e6f",
          700: "#b51255",
          800: "#870d3e",
          900: "#4c0521",
        },
        gold: {
          300: "#fde047",
          400: "#facc15",
          500: "#eab308",
        },
        neutral: {
          900: "#11091c",
          950: "#0b0512",
        },
      },
      fontFamily: {
        sans: ['"Cairo"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        floral:
          "radial-gradient(circle at 15% 15%, rgba(244,63,142,0.18), transparent 45%), radial-gradient(circle at 85% 20%, rgba(168,85,247,0.2), transparent 50%), radial-gradient(circle at 50% 80%, rgba(251,113,133,0.12), transparent 60%)",
        "rose-glow":
          "radial-gradient(circle at 50% 50%, rgba(255,107,157,0.25), transparent 70%)",
        "card-shimmer":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03) 60%, rgba(244, 63, 142, 0.12))",
      },
      animation: {
        "float-gentle": "floatGentle 5s ease-in-out infinite",
        "pulse-petal": "pulsePetal 3s ease-in-out infinite",
        "shimmer-border": "shimmerBorder 6s linear infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        floatGentle: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(2deg)" },
        },
        pulsePetal: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(244, 63, 142, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(244, 63, 142, 0.65)" },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

