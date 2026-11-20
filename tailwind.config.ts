import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#059669",
          dark: "#0F172A",
          bg: "#F8FAFC",
          accent: "#F59E0B",
          error: "#DC2626",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
