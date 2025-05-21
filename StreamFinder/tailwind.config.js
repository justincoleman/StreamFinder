/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6', // vivid purple
          light: '#A78BFA',
          dark: '#6D28D9',
        },
        accent: {
          yellow: '#F7FF5A', // neon yellow
          green: '#B6FFB0',  // soft green
          orange: '#FFB86B', // accent orange
        },
        neutral: {
          bg: '#F8F8F6', // soft off-white background
          card: '#F3F2ED', // card background
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        card: '0 4px 24px 0 rgba(139, 92, 246, 0.08)',
      },
    },
  },
  plugins: [],
  safelist: [
    'dark:border-slate-700/50',
    'dark:bg-slate-700/80',
    'border-slate-200',
    'bg-white/80',
    // add any others you use
    'border-primary',
    'bg-primary',
    'text-primary',
    'border-accent-yellow',
    'bg-accent-yellow',
    'border-accent-green',
    'bg-accent-green',
  ],
}

// NOTE: After updating the safelist, restart your dev server to ensure Tailwind regenerates the CSS.