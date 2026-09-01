import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-indigo-600",
    "bg-blue-600",
    "bg-purple-600",
    "bg-emerald-600",
    "bg-rose-600",
    "bg-amber-600",
    "text-indigo-600",
    "text-blue-600",
    "text-purple-600",
    "text-emerald-600",
    "text-rose-600",
    "text-amber-600",
    "text-indigo-400",
    "text-blue-400",
    "text-purple-400",
    "text-emerald-400",
    "text-rose-400",
    "text-amber-400",
    "bg-indigo-50",
    "bg-blue-50",
    "bg-purple-50",
    "bg-emerald-50",
    "bg-rose-50",
    "bg-amber-50",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
      },
    },
  },
  plugins: [],
};

export default config;
