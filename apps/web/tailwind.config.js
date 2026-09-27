/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tokens del Sistema Visual Stitch (docs/design.md)
        surface: {
          canvas: '#0B0F19',
          card: '#111827',
          elevated: '#1F2937',
          high: '#262A35',
          highest: '#313540',
          bright: '#353944',
          subtle: '#171B26',
          lowest: '#0A0E18',
        },
        border: {
          subtle: '#374151',
          active: '#FF9900',
          cyan: '#38BDF8',
          violet: '#8B5CF6',
        },
        primary: {
          amber: '#FF9900',
          'amber-light': '#FFC082',
          'amber-dark': '#B45309',
          'amber-hover': '#FFAC1C',
        },
        secondary: {
          cyan: '#38BDF8',
          'cyan-light': '#7BD0FF',
          'cyan-dark': '#0284C7',
        },
        tertiary: {
          violet: '#8B5CF6',
          'violet-light': '#D5C3FF',
          'violet-dark': '#6D28D9',
        },
        status: {
          pass: '#10B981',
          fail: '#EF4444',
          warning: '#F59E0B',
          info: '#0284C7',
        },
        // Compatibilidad hacia atrás con componentes existentes
        aws: {
          squid: '#232F3E',
          orange: '#FF9900',
          smile: '#146EB4',
          dark: '#0B0F19',
          card: '#111827',
          surface: '#1F2937'
        },
        feedback: {
          pass: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#0284C7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      borderRadius: {
        sm: '0.125rem', // 2px
        DEFAULT: '0.25rem', // 4px
        md: '0.375rem', // 6px
        lg: '0.5rem', // 8px
        xl: '0.75rem', // 12px
        '2xl': '1rem', // 16px
      },
      boxShadow: {
        'glow-amber': '0 0 16px rgba(255, 153, 0, 0.35)',
        'glow-cyan': '0 0 16px rgba(56, 189, 248, 0.35)',
        'glow-violet': '0 0 16px rgba(139, 92, 246, 0.35)',
        'elevation-card': '0 4px 16px rgba(0, 0, 0, 0.5)',
        'elevation-drawer': '-8px 0 24px rgba(0, 0, 0, 0.7)',
        'elevation-modal': '0 12px 36px rgba(0, 0, 0, 0.8)',
      }
    }
  },
  plugins: []
};

