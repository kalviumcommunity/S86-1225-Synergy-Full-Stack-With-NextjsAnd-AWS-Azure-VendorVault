/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#93C5FD",
          DEFAULT: "#3B82F6",
          dark: "#1E40AF",
        },
        success: {
          light: "#86efac",
          DEFAULT: "#22c55e",
          dark: "#15803d",
        },
        warning: {
          light: "#fcd34d",
          DEFAULT: "#f59e0b",
          dark: "#b45309",
        },
        error: {
          light: "#fca5a5",
          DEFAULT: "#ef4444",
          dark: "#b91c1c",
        },
        info: {
          light: "#7dd3fc",
          DEFAULT: "#0ea5e9",
          dark: "#0369a1",
        },
      },
      boxShadow: {
        brand: "0 4px 14px 0 rgba(59, 130, 246, 0.39)",
        "brand-lg": "0 10px 40px 0 rgba(59, 130, 246, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
