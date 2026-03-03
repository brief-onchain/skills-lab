import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#090807",
        panel: "#1A150C",
        gold: {
          DEFAULT: "#F0BE57",
          dark: "#C58B2E",
        },
        text: {
          main: "#F6ECDA",
          sub: "#B6AB95",
        },
      },
      fontFamily: {
        heading: ["var(--font-orbitron)", "sans-serif"],
        body: ["var(--font-noto)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
