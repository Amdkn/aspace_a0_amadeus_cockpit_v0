import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Solarpunk Color Scheme
        // Using Teal/Emerald range for primary (nature/high-tech fusion)
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf', // Teal-400
          500: '#14b8a6', // Teal-500 (not standard Emerald-500)
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        accent: {
          400: '#fbbf24', // Amber-400 (Gold accent)
        },
      },
      backdropBlur: {
        xl: '20px',
      },
    },
  },
  plugins: [],
};
export default config;
