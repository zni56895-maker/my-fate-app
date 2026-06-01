<script setup lang="ts">
import { ref } from 'vue'
import type { FortuneResult } from '@/composables/useFortune'

defineProps<{ result: FortuneResult }>()

const showDetails = ref(false)

const dateStr = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
})
</script>

<template>
  <div class="space-y-4 animate-fadeInUp">

    <!-- 报告标题 -->
    <div class="card-cosmic p-5 md:p-6 text-center">
      <div class="text-4xl mb-2">🔮</div>
      <h2 class="text-lg md:text-xl font-bold text-cosmic-accent-light mb-1">今日运势报告</h2>
      <p class="text-xs text-cosmic-muted">{{ dateStr }} · 流日 {{ result.dailyGanZhi }}</p>
      <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic-accent/10 border border-cosmic-accent/20">
        <span class="text-xs text-cosmic-muted">今日十神</span>
        <span class="text-sm font-bold text-cosmic-accent-light">{{ result.todayTenGod }}</span>
      </div>
    </div>

    <!-- 能量指数 -->
    <div class="card-cosmic p-5 md:p-6">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-cosmic-muted">📊 今日能量指数</span>
        <span :class="['text-lg font-bold', result.fortune.energy >= 70 ? 'text-cosmic-gold' : result.fortune.energy >= 50 ? 'text-cosmic-accent-light' : 'text-cosmic-danger']">
          {{ result.fortune.energy }}%
        </span>
      </div>
      <div class="w-full h-3 bg-cosmic-bg rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-1000 ease-out"
             :class="result.fortune.energy >= 80 ? 'bg-gradient-to-r from-green-400 to-cosmic-gold' : result.fortune.energy >= 60 ? 'bg-gradient-to-r from-cosmic-accent to-green-400' : result.fortune.energy >= 40 ? 'bg-gradient-to-r from-cosmic-accent to-cosmic-accent-light' : 'bg-gradient-to-r from-cosmic-danger to-cosmic-accent'"
             :style="{ width: result.fortune.energy + '%' }" />
      </div>
      <p class="text-xs text-cosmic-muted mt-2 text-center">能量指数仅供娱乐参考 ✨</p>
    </div>

    <!-- 核心主题 -->
    <div class="card-cosmic p-5 md:p-6 border-l-4 border-cosmic-accent">
      <h3 class="text-sm font-semibold text-cosmic-accent-light mb-2 flex items-center gap-2">
        <span>📌</span> 今日核心主题
      </h3>
      <p class="text-base md:text-lg font-bold text-cosmic-text">{{ result.fortune.theme }}</p>
    </div>

    <!-- 深度解析 -->
    <div class="card-cosmic p-5 md:p-6">
      <h3 class="text-sm font-semibold text-cosmic-accent-light mb-2 flex items-center gap-2">
        <span>🔍</span> 运势深度解析
      </h3>
      <p class="text-sm md:text-base text-cosmic-text leading-relaxed">{{ result.fortune.analysis }}</p>
    </div>

    <!-- 五行互动 -->
    <div class="card-cosmic p-5 md:p-6 border-l-4 border-cosmic-gold">
      <h3 class="text-sm font-semibold text-cosmic-gold mb-2 flex items-center gap-2">
        <span>☯</span> 五行互动
      </h3>
      <p class="text-sm text-cosmic-text leading-relaxed">{{ result.relationDesc }}</p>
    </div>

    <!-- 宜 / 忌 左右并列 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 宜 -->
      <div class="rounded-xl p-4 bg-green-500/5 border border-green-500/20">
        <h3 class="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1.5">
          <span>✅</span> 宜
        </h3>
        <ul class="space-y-1">
          <li v-for="(item, idx) in result.fortune.suitable" :key="'s'+idx"
            class="flex items-start gap-2 text-xs text-cosmic-text">
            <span class="w-4 h-4 rounded-full bg-green-500/20 text-green-400 text-[8px] flex items-center justify-center font-bold shrink-0 mt-0.5">{{ idx + 1 }}</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>

      <!-- 忌 -->
      <div class="rounded-xl p-4 bg-red-500/5 border border-red-500/20">
        <h3 class="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
          <span>⚠</span> 忌
        </h3>
        <ul class="space-y-1">
          <li v-for="(item, idx) in result.fortune.avoid" :key="'a'+idx"
            class="flex items-start gap-2 text-xs text-cosmic-text">
            <span class="w-4 h-4 rounded-full bg-red-500/20 text-red-400 text-[8px] flex items-center justify-center font-bold shrink-0 mt-0.5">{{ idx + 1 }}</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- ★ 神煞综合建议（聚合卡片） -->
    <div v-if="result.shenshaDetails.length > 0" class="card-cosmic p-5 md:p-6">
      <h3 class="text-sm font-semibold text-cosmic-accent-light mb-3 flex items-center gap-2">
        <span>🌟</span> 今日行动指引
      </h3>
      <div class="space-y-2 mb-3">
        <div v-for="(line, i) in result.shenshaAdvice" :key="i"
             class="flex items-start gap-2 p-2.5 rounded-lg bg-cosmic-bg/50 border border-cosmic-border">
          <span class="w-5 h-5 rounded-full bg-cosmic-accent/20 text-cosmic-accent-light text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{{ i + 1 }}</span>
          <p class="text-xs text-cosmic-text leading-relaxed">{{ line }}</p>
        </div>
      </div>
      <!-- 折叠的命理详情 -->
      <div class="text-center">
        <button @click="showDetails = !showDetails" class="text-[10px] text-cosmic-muted hover:text-cosmic-accent-light transition-colors">
          {{ showDetails ? '▲ 收起命理分析详情' : '📖 查看命理分析详情' }}
        </button>
      </div>
      <div v-if="showDetails" class="mt-3 space-y-2 border-t border-cosmic-border pt-3">
        <div v-for="(ss, idx) in result.shenshaDetails" :key="idx"
             class="p-2 rounded-lg bg-cosmic-bg/30 border border-cosmic-border/50">
          <div class="flex items-center gap-2 mb-0.5">
            <span class="text-xs font-semibold text-cosmic-accent-light">{{ ss.name }}</span>
            <span class="text-[10px] text-cosmic-muted">{{ ss.shortMeaning }}</span>
          </div>
          <p class="text-[10px] text-cosmic-text leading-relaxed">{{ ss.dailyGuide }}</p>
        </div>
      </div>
    </div>

    <div class="text-center py-2">
      <p class="text-[10px] text-cosmic-muted">本报告由纯前端算法生成 · 数据完全离线 · 结果仅供娱乐参考</p>
    </div>
  </div>
</template>
