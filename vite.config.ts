import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  // ★ 关键：所有资源路径相对化，支持 file:// 直接打开
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // ★ CJS 兼容：lunar-javascript 是 CommonJS 模块
  optimizeDeps: {
    include: ['lunar-javascript'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false,
    // ★ 拆包减小单文件体积，手机弱网也能加载
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'echarts', 'lunar-javascript'],
        },
      },
    },
  },
})
