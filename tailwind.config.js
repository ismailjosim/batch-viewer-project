/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fluent: {
          bg: {
            light: '#f9f9f9',
            dark: '#202020',
          },
          card: {
            light: '#ffffff',
            dark: '#2d2d2d',
          },
          border: {
            light: '#e5e5e5',
            dark: '#383838',
          },
          accent: {
            DEFAULT: '#0078d4',
            hover: '#106ebe',
            light: '#e1dfdd',
          },
          text: {
            primaryLight: '#1f1f1f',
            primaryDark: '#f3f3f3',
            secondaryLight: '#5c5c5c',
            secondaryDark: '#a6a6a6',
          }
        }
      },
      fontFamily: {
        sans: ['Segoe UI Variable', 'Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['Cascadia Code', 'Consolas', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
