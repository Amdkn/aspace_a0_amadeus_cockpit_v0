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
        // 🌿 A'SPACE SOLARPUNK PALETTE
        // Nature + High Tech fusion with biomimetic progression
        
        // Primary: Teal/Emerald (Organic Growth)
        primary: {
          50: '#f0fdfa',   // Morning Mist
          100: '#ccfbf1',  // Dew
          200: '#99f6e4',  // Spring Leaf
          300: '#5eead4',  // Ocean Foam
          400: '#2dd4bf',  // Neon Teal (Bioluminescence)
          500: '#14b8a6',  // Deep Teal (Core)
          600: '#0d9488',  // Forest Shadow
          700: '#0f766e',  // Ancient Moss
          800: '#115e59',  // Deep Sea
          900: '#134e4a',  // Primordial
          950: '#042f2e',  // Void
        },
        
        // Accent: Amber/Gold (Solar Energy)
        accent: {
          50: '#fffbeb',   // Dawn
          100: '#fef3c7',  // Sunrise
          200: '#fde68a',  // Golden Hour
          300: '#fcd34d',  // Honey
          400: '#fbbf24',  // Solar Gold (Primary)
          500: '#f59e0b',  // Amber Core
          600: '#d97706',  // Ember
          700: '#b45309',  // Bronze
          800: '#92400e',  // Rust
          900: '#78350f',  // Earth
        },
        
        // Deep: Dark foundations (Biomimetic depth)
        deep: {
          50: '#1a1a1a',   // Carbon
          100: '#0f0f0f',  // Obsidian
          200: '#0a0a0a',  // Void
          300: '#050505',  // Abyss
          DEFAULT: '#000000', // Pure Black
        },
        
        // Glow: Bioluminescent accents
        glow: {
          teal: '#2dd4bf',     // Electric Teal
          amber: '#fbbf24',    // Solar Amber
          emerald: '#10b981',  // Bio Green
          cyan: '#06b6d4',     // Crystal Cyan
        },
      },
      
      // 🌟 GLASS MORPHISM DEPTHS
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '40px',
        '3xl': '64px',
      },
      
      // ✨ GLOW & SHADOW SYSTEM (Iron Man HUD inspired)
      boxShadow: {
        // Subtle glows
        'glow-sm': '0 0 10px rgba(45, 212, 191, 0.3)',
        'glow-md': '0 0 20px rgba(45, 212, 191, 0.4)',
        'glow-lg': '0 0 30px rgba(45, 212, 191, 0.5)',
        
        // Amber solar glow
        'solar-sm': '0 0 10px rgba(251, 191, 36, 0.3)',
        'solar-md': '0 0 20px rgba(251, 191, 36, 0.4)',
        'solar-lg': '0 0 30px rgba(251, 191, 36, 0.5)',
        
        // Intense HUD glow
        'hud-teal': '0 0 40px rgba(45, 212, 191, 0.6), 0 0 80px rgba(45, 212, 191, 0.3)',
        'hud-amber': '0 0 40px rgba(251, 191, 36, 0.6), 0 0 80px rgba(251, 191, 36, 0.3)',
        
        // Inner glow (inset)
        'inner-glow': 'inset 0 0 20px rgba(45, 212, 191, 0.2)',
        'inner-solar': 'inset 0 0 20px rgba(251, 191, 36, 0.2)',
        
        // Depth shadows (organic)
        'depth-sm': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'depth-md': '0 4px 16px rgba(0, 0, 0, 0.5)',
        'depth-lg': '0 8px 32px rgba(0, 0, 0, 0.6)',
        'depth-xl': '0 16px 64px rgba(0, 0, 0, 0.7)',
        
        // Biomimetic (layered depth + glow)
        'bio-teal': '0 4px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(45, 212, 191, 0.3)',
        'bio-amber': '0 4px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)',
      },
      
      // 🎨 GRADIENT PRESETS (Organic transitions)
      backgroundImage: {
        'solarpunk-radial': 'radial-gradient(circle at 50% 50%, #14b8a6 0%, #0f766e 50%, #042f2e 100%)',
        'solarpunk-linear': 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)',
        'solar-burst': 'radial-gradient(circle at center, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
        'depth-fade': 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
        'glass-shimmer': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      
      // 🌊 ANIMATION CURVES (Organic motion)
      transitionTimingFunction: {
        'organic': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'pulse': 'cubic-bezier(0.4, 0.0, 0.6, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      
      // ⏱️ ANIMATION DURATIONS
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(45, 212, 191, 0.3)',
            opacity: '1' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(45, 212, 191, 0.6)',
            opacity: '0.8' 
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
