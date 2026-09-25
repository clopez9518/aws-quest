/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aws: {
          squid: '#232F3E',
          orange: '#FF9900',
          smile: '#146EB4',
          dark: '#0F172A',
          card: '#1E293B',
          surface: '#334155'
        },
        feedback: {
          pass: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6'
        }
      }
    }
  },
  plugins: []
};
