/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a365d',
          light: '#2c5282',
          dark: '#0f2442',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          DEFAULT: '#3182ce',
          light: '#63b3ed',
        },
        success: {
          DEFAULT: '#38a169',
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          DEFAULT: '#d69e2e',
          50: '#fefce8',
          500: '#eab308',
          600: '#ca8a04',
        },
        danger: {
          DEFAULT: '#e53e3e',
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        info: {
          DEFAULT: '#00b5d8',
        },
        purple: {
          DEFAULT: '#9f7aea',
        },
        pink: {
          DEFAULT: '#ed64a6',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      width: {
        'sidebar': '280px',
        'sidebar-collapsed': '60px',
      },
      height: {
        'header': '60px',
      },
      spacing: {
        'sidebar': '280px',
        'sidebar-collapsed': '60px',
        'header': '60px',
      },
      transitionDuration: {
        'DEFAULT': '300ms',
      },
    },
  },
  plugins: [],
}
