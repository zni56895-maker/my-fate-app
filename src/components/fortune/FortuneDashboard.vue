<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DailyFortuneV3 } from '@/constants/fortuneDatabase'

const props = defineProps<{
  fortune: DailyFortuneV3
  todayTenGod: string
  dimScores: { label: string; value: number; color: string }[]
  dimExplanations?: string[]
}>()

// ≪ 点击弹出说明 ≫
const selectedDim = ref<{ label: string; value: number; explanation: string } | null>(null)

function showDimExplanation(dim: { label: string; value: number }, idx: number) {
  const exp = props.dimExplanations?.[idx]
  if (exp) selectedDim.value = { ...dim, explanation: exp }
}

// SVG环形参数
const radius = 70; const stroke = 8; const circumference = 2 * Math.PI * (radius - stroke)
const dashOffset = computed(() => circumference * (1 - props.fortune.energy / 100))
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- SVG环形进度条 -->
    <div class="backdrop-blur-lg bg-slate-900/40 border border-purple-500/20 rounded-2xl p-5 flex flex-col items-center">
      <h3 class="text-xs font-semibold text-purple-300 mb-3">今日能量指数</h3>
      <div class="relative w-40 h-40">
        <svg viewBox="0 0 160 160" class="w-full h-full -rotate-90">
          <circle cx="80" cy="80" :r="radius - stroke" fill="none" stroke="#1e1b4b" :stroke-width="stroke" />
          <circle cx="80" cy="80" :r="radius - stroke" fill="none"
            :stroke="fortune.energy >= 70 ? '#f0c040' : fortune.energy >= 50 ? '#6c5ce7' : '#e04040'"
            :stroke-width="stroke" stroke-linecap="round"
            :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset"
            class="transition-all duration-1000 ease-out"
            style="filter: drop-shadow(0 0 8px currentColor);" />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-3xl font-bold" :class="fortune.energy >= 70 ? 'text-yellow-400' : fortune.energy >= 50 ? 'text-purple-400' : 'text-red-400'">
            {{ fortune.energy }}
          </span>
          <span class="text-[10px] text-slate-500">/ 100</span>
        </div>
      </div>
      <p class="text-xs text-slate-400 mt-2 text-center">{{ fortune.theme }}</p>
    </div>

    <!-- 四维条形图 -->
    <div class="backdrop-blur-lg bg-slate-900/40 border border-purple-500/20 rounded-2xl p-5">
      <h3 class="text-xs font-semibold text-purple-300 mb-4">四维能量分析</h3>
      <div class="space-y-3">
        <div v-for="(dim, idx) in dimScores" :key="dim.label"
             @click="showDimExplanation(dim, idx)"
             class="flex items-center gap-3 cursor-pointer hover:bg-slate-800/30 rounded-lg px-1 py-0.5 transition"
             :title="dimExplanations?.[idx] || '点击查看'">
          <span class="text-xs text-slate-400 w-8 flex-shrink-0">{{ dim.label }}</span>
          <div class="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-1000 ease-out"
              :style="{ width: dim.value + '%', background: dim.color, boxShadow: `0 0 8px ${dim.color}40` }" />
          </div>
          <span class="text-xs text-slate-500 w-8 text-right">{{ dim.value }}</span>
        </div>
      </div>

      <!-- ≪ 维度说明浮窗 ≫ -->
      <div v-if="selectedDim"
           class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
           @click.self="selectedDim = null">
        <div class="max-w-sm mx-4 p-5 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-2xl">
          <h4 class="text-sm font-semibold text-purple-300 mb-2">{{ selectedDim.label }} · {{ selectedDim.value }}分</h4>
          <p class="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{{ selectedDim.explanation }}</p>
          <button @click="selectedDim = null"
            class="mt-4 text-xs px-4 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
