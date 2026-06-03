/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        // ═══ 五行色板 ═══
        primary: {
          wood:  '#4ecdc4', fire:  '#ff6b6b', earth: '#f9ca24',
          metal: '#a0a0c0', water: '#4834d4',
        },
        // ═══ 星云五行（降饱和，星系灰度） ═══
        nebula: {
          wood:  '#6ee7b7',   // emerald-300
          fire:  '#fda4af',   // rose-300
          earth: '#fde68a',   // amber-200
          metal: '#e2e8f0',   // slate-200
          water: '#7dd3fc',   // sky-300
        },
        // ═══ 神煞六维色板 ═══
        shensha: {
          nobility: '#fbbf24', talent: '#38bdf8', emotion: '#f472b6',
          wisdom: '#34d399', achievement: '#f59e0b', trial: '#a78bfa',
        },
        // ═══ 吉凶色 ═══
        polarity: {
          auspicious: '#f0c040', inauspicious: '#e04040', neutral: '#6c5ce7',
        },
        // ═══ 宇宙 UI 色（Legacy compat） ═══
        cosmic: {
          bg: '#0a0a1a', card: '#12122a', border: '#2a2a5a',
          accent: '#6c5ce7', 'accent-light': '#a78bfa',
          gold: '#f0c040', danger: '#e04040', text: '#e0e0f0', muted: '#8080b0',
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Hiragino Sans GB"', '"WenQuanYi Micro Hei"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(108, 92, 231, 0.5)',
        'glow-strong': '0 0 30px rgba(108, 92, 231, 0.7)',
        'glow-gold': '0 0 15px rgba(240, 192, 64, 0.5)',
        'glow-danger': '0 0 10px rgba(224, 64, 64, 0.5)',
      },
      transitionTimingFunction: {
        'stretch': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'snap': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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
        'rise': {
          '0%': { opacity: 0, transform: 'translateY(12px) scale(0.97)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
