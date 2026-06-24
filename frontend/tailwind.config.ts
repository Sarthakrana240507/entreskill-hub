import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAF6ED",
        "paper-line": "#E8DFC8",
        ink: "#1B2A4A",
        "ink-soft": "#3D4A66",
        marigold: {
          DEFAULT: "#D9762B",
          dark: "#B85F1E",
          light: "#F0A35C",
        },
        workshop: {
          DEFAULT: "#3F6B4F",
          dark: "#2E5039",
          light: "#6B9479",
        },
        clay: "#C44536",
        cream: "#FAF6ED",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "ledger-lines":
          "repeating-linear-gradient(to bottom, transparent, transparent 31px, #E8DFC8 31px, #E8DFC8 32px)",
      },
      boxShadow: {
        stamp: "0 0 0 1.5px currentColor",
        card: "0 1px 2px rgba(27,42,74,0.04), 0 4px 10px rgba(27,42,74,0.06)",
        "card-hover": "0 2px 4px rgba(27,42,74,0.06), 0 12px 24px rgba(27,42,74,0.10)",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
