/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        macos: {
          sidebar: {
            light: "rgba(246, 246, 248, 0.72)",
            dark: "rgba(30, 30, 32, 0.75)",
          },
          accent: {
            blue: "#007AFF",
            purple: "#AF52DE",
            teal: "#30B0C7",
            green: "#34C759",
            amber: "#FF9500",
            coral: "#FF3B30",
            indigo: "#5856D6",
          },
        },
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
          blue: "#007AFF",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f4f6fb",
          border: "#e2e8f0",
        },
      },
      fontFamily: {
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Display'",
          "'SF Pro Text'",
          "'Inter'",
          "sans-serif",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Text'",
          "'Inter'",
          "-system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(13, 27, 52, 0.03), 0 6px 20px rgba(13, 27, 52, 0.05)",
        pop: "0 10px 35px rgba(13, 27, 52, 0.12)",
        glass: "0 8px 32px 0 rgba(15, 23, 42, 0.07)",
        "glass-lg": "0 14px 40px -10px rgba(15, 23, 42, 0.12)",
        "glow-teal": "0 0 20px -3px rgba(14, 165, 160, 0.35)",
        "glow-indigo": "0 0 20px -3px rgba(79, 70, 229, 0.35)",
        "glow-blue": "0 0 24px -2px rgba(0, 122, 255, 0.4)",
        "liquid": "0 10px 30px -5px rgba(0, 0, 0, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.04)",
        "liquid-dark": "0 12px 40px -5px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.18), inset 0 -1px 0 0 rgba(0, 0, 0, 0.6)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      backdropBlur: {
        xs: "2px",
        "3xl": "32px",
      },
    },
  },
  plugins: [],
};
