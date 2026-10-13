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
          muted: "#f6f8fb",
          border: "#e4e9f2",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(13, 27, 52, 0.04), 0 4px 16px rgba(13, 27, 52, 0.06)",
        pop: "0 8px 30px rgba(13, 27, 52, 0.12)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
