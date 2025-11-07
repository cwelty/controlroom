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
        // Synthwave theme colors
        background: {
          primary: '#0A0E14',
          secondary: '#111826',
        },
        neon: {
          cyan: '#00FFF7',
          blue: '#00B7FF',
          purple: '#8A2BE2',
          magenta: '#FF00E5',
        },
        // Standard color scheme
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'exo': ['Exo', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          'from': {
            'box-shadow': '0 0 5px #00FFF7, 0 0 10px #00FFF7, 0 0 15px #00FFF7',
          },
          'to': {
            'box-shadow': '0 0 10px #00FFF7, 0 0 20px #00FFF7, 0 0 30px #00FFF7',
          },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};

export default config;