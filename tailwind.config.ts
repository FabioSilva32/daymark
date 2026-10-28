import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#000000",
          sidebar: "#0D0D0D",
        },
        surface: {
          DEFAULT: "#141414",
          card: "#141414",
          elevated: "#1A1A1A",
          hover: "#222222",
        },
        border: {
          DEFAULT: "#242424",
          subtle: "#1C1C1C",
          focus: "#E50914",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#AAAAAA",
          muted: "#777777",
        },
        brand: {
          red: "#E50914",
          "red-hover": "#C11119",
          "red-subtle": "rgba(229, 9, 20, 0.15)",
          "red-surface": "#200B0D",
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        heading: [
          '"Outfit"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};

export default config;
