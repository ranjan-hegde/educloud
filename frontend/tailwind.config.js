/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2f8",
          100: "#d7e1f0",
          200: "#b0c3e1",
          300: "#84a1cf",
          400: "#5c81bd",
          500: "#3d64a8",
          600: "#2c4d8a",
          700: "#1f3a6b",
          800: "#152a4e",
          900: "#0d1b34",
          950: "#081226",
        },
        accent: {
          teal: "#0ea5a0",
          amber: "#e0a63a",
          coral: "#e0654a",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f4f6fb",
          border: "#e2e8f0",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(13, 27, 52, 0.03), 0 6px 20px rgba(13, 27, 52, 0.05)",
        pop: "0 10px 35px rgba(13, 27, 52, 0.12)",
        glass: "0 8px 32px 0 rgba(15, 23, 42, 0.07)",
        "glass-lg": "0 14px 40px -10px rgba(15, 23, 42, 0.12)",
        "glow-teal": "0 0 20px -3px rgba(14, 165, 160, 0.35)",
        "glow-indigo": "0 0 20px -3px rgba(79, 70, 229, 0.35)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
