import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#030a07",
          900: "#071a12",
          800: "#0a1f1a",
          700: "#0d2920",
          600: "#0f2922",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      animation: {
        "xp-fill": "xpFill 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "level-up": "levelUp 1.6s ease-out forwards",
        "streak-flame": "streakFlame 1.6s ease-in-out infinite",
        "gold-glow": "goldGlow 2.4s ease-in-out infinite",
        "fade-up": "fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "shimmer": "shimmer 2.4s ease-in-out infinite",
        "float-y": "floatY 5s ease-in-out infinite",
      },
      keyframes: {
        xpFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--xp-target, 100%)" },
        },
        levelUp: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "30%": { transform: "scale(1.06)", opacity: "1" },
          "60%": { transform: "scale(1)" },
          "100%": { opacity: "1" },
        },
        streakFlame: {
          "0%, 100%": { transform: "translateY(0) scale(1)", filter: "brightness(1)" },
          "50%": { transform: "translateY(-2px) scale(1.05)", filter: "brightness(1.15)" },
        },
        goldGlow: {
          "0%, 100%": {
            boxShadow:
              "0 0 0 1px rgba(251,191,36,0.45), 0 6px 22px -6px rgba(245,158,11,0.45), 0 0 22px rgba(245,158,11,0.25)",
          },
          "50%": {
            boxShadow:
              "0 0 0 1px rgba(251,191,36,0.75), 0 12px 32px -6px rgba(245,158,11,0.65), 0 0 40px rgba(245,158,11,0.45)",
          },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      backgroundImage: {
        "shimmer-gold":
          "linear-gradient(90deg, transparent, rgba(251,191,36,0.35), transparent)",
        "grid-emerald":
          "radial-gradient(circle, rgba(16,185,129,0.5) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-32": "32px 32px",
      },
    },
  },
  plugins: [],
};

export default config;
