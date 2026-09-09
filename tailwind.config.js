/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0f1115',
        paper: '#fafafa',
        accent: '#2563eb',
        muted: '#6b7280',
        border: '#e5e7eb',
        ok: '#16a34a',
        warn: '#d97706',
        off: '#9ca3af',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
};
