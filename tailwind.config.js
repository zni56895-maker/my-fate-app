/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        cosmic: {
          bg: '#0a0a1a',
          card: '#12122a',
          border: '#2a2a5a',
          accent: '#6c5ce7',
          'accent-light': '#a78bfa',
          gold: '#f0c040',
          danger: '#e04040',
          text: '#e0e0f0',
          muted: '#8080b0',
        },
        wuxing: {
          wood: '#4ecdc4',
          fire: '#ff6b6b',
          earth: '#f9ca24',
          metal: '#a0a0c0',
          water: '#4834d4',
        },
      },
      fontFamily: {
        sans: [
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '"Hiragino Sans GB"',
          '"WenQuanYi Micro Hei"',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 0 15px rgba(108, 92, 231, 0.5)',
        'glow-strong': '0 0 30px rgba(108, 92, 231, 0.7)',
        'glow-gold': '0 0 15px rgba(240, 192, 64, 0.5)',
        'glow-danger': '0 0 10px rgba(224, 64, 64, 0.5)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(108, 92, 231, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(108, 92, 231, 0.7)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
