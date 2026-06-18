import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        purple: { DEFAULT: "#8b5cf6", deep: "#6d3fd4" },
        lilac: "#a78bfa",
        magic: { DEFAULT: "#e879f9", deep: "#c026d3" },
        cream: "#fdf3e3",
      },
      fontFamily: {
        display: ["Jua", "sans-serif"],
        body: ["'Noto Sans KR'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
