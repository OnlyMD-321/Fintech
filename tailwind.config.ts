import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#F9FAFB",
        foreground: "#111827",
        card: "#FFFFFF",
        primary: "#2563EB",
        secondary: "#6366F1",
        muted: "#E5E7EB",
        border: "#E5E7EB"
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(17,24,39,0.06)",
        premium: "0 18px 40px rgba(37,99,235,0.15)"
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        floatIn: "floatIn 400ms ease-out"
      }
    }
  },
  plugins: []
};

export default config;
