import type { Config } from "tailwindcss";

const config: Config = {
  // Enable class-based dark mode
  darkMode: 'class',

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Semantic color tokens that adapt to theme
        surface: {
          primary: "var(--surface-primary)",
          secondary: "var(--surface-secondary)",
          tertiary: "var(--surface-tertiary)",
          hover: "var(--surface-hover)",
          active: "var(--surface-active)",
        },

        border: {
          DEFAULT: "var(--border-primary)",
          secondary: "var(--border-secondary)",
          hover: "var(--border-hover)",
        },
      },
      boxShadow: {
        // Theme-aware shadows using CSS variables
        'card-sm': 'var(--shadow-card-sm)',
        'card-md': 'var(--shadow-card-md)',
        'card-lg': 'var(--shadow-card-lg)',
        'card-xl': '0 12px 48px rgba(0, 0, 0, 0.25)',

        // Colored glow shadows (theme-aware opacity via CSS variable)
        'glow-emerald': '0 0 20px rgba(16, 185, 129, var(--glow-opacity)), 0 0 40px rgba(16, 185, 129, calc(var(--glow-opacity) * 0.5))',
        'glow-emerald-lg': '0 0 30px rgba(16, 185, 129, var(--glow-opacity)), 0 0 60px rgba(16, 185, 129, calc(var(--glow-opacity) * 0.6))',
        'glow-amber': '0 0 20px rgba(245, 158, 11, var(--glow-opacity)), 0 0 40px rgba(245, 158, 11, calc(var(--glow-opacity) * 0.5))',
        'glow-amber-lg': '0 0 30px rgba(245, 158, 11, var(--glow-opacity)), 0 0 60px rgba(245, 158, 11, calc(var(--glow-opacity) * 0.6))',
        'glow-rose': '0 0 20px rgba(244, 63, 94, var(--glow-opacity)), 0 0 40px rgba(244, 63, 94, calc(var(--glow-opacity) * 0.5))',
        'glow-rose-lg': '0 0 30px rgba(244, 63, 94, var(--glow-opacity)), 0 0 60px rgba(244, 63, 94, calc(var(--glow-opacity) * 0.6))',
        'glow-indigo': '0 0 20px rgba(99, 102, 241, var(--glow-opacity)), 0 0 40px rgba(99, 102, 241, calc(var(--glow-opacity) * 0.5))',
        'glow-indigo-lg': '0 0 30px rgba(99, 102, 241, var(--glow-opacity)), 0 0 60px rgba(99, 102, 241, calc(var(--glow-opacity) * 0.6))',
        'glow-purple': '0 0 20px rgba(168, 85, 247, var(--glow-opacity)), 0 0 40px rgba(168, 85, 247, calc(var(--glow-opacity) * 0.5))',
        'glow-purple-lg': '0 0 30px rgba(168, 85, 247, var(--glow-opacity)), 0 0 60px rgba(168, 85, 247, calc(var(--glow-opacity) * 0.6))',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, var(--glow-opacity)), 0 0 40px rgba(6, 182, 212, calc(var(--glow-opacity) * 0.5))',
        'glow-cyan-lg': '0 0 30px rgba(6, 182, 212, var(--glow-opacity)), 0 0 60px rgba(6, 182, 212, calc(var(--glow-opacity) * 0.6))',
      },
      animation: {
        'shimmer-loading': 'shimmer-loading 2s infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'shimmer-loading': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
};
export default config;
