/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'dark:border-slate-700/50',
    'dark:bg-slate-700/80',
    'border-slate-200',
    'bg-white/80',
    // add any others you use
  ],
}