import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f6f1",
        paper: "#fffefb",
        ink: "#18202b",
        muted: "#667085",
        line: "#e4e3dc",
        moss: {
          50: "#f2f6ed",
          100: "#e4eddb",
          200: "#ccddbd",
          500: "#527a43",
          600: "#3f6837",
          700: "#31542d",
          800: "#274326",
        },
      },
      boxShadow: {
        soft: "0 12px 36px rgba(26, 38, 28, 0.06)",
        lift: "0 16px 36px rgba(26, 38, 28, 0.10)",
      },
      fontFamily: {
        sans: ["Inter", "Avenir Next", "Segoe UI", "Arial", "sans-serif"],
        display: ["Iowan Old Style", "Baskerville", "Georgia", "serif"],
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.98) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        rise: "rise 480ms cubic-bezier(.2,.8,.2,1) both",
        fade: "fade 200ms ease-out both",
        "scale-in": "scaleIn 220ms cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
