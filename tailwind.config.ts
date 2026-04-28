import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#F3F6F9",
        foreground: "#061438",
        card: "#FFFFFF",
        primary: "#1DABFC",
        secondary: "#061438",
        muted: "#EBF0FE",
        border: "#DBEFFB",
        "mylegal-navy": "#061438",
        "mylegal-ocean": "#1DABFC",
        "mylegal-pale": "#DBEFFB",
        "mylegal-cloud": "#EBF0FE",
        "mylegal-fog": "#F3F6F9",
        "mylegal-steel": "#718696"
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(6,20,56,0.08)",
        premium: "0 18px 40px rgba(29,171,252,0.18)"
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
