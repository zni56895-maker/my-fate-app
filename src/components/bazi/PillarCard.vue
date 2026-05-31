<script setup lang="ts">
import type { PillarData } from '@/types/bazi'
import { STEM_WUXING } from '@/constants/stems'
import { BRANCH_ANIMAL } from '@/constants/branches'
import ShenShaTags from './ShenShaTags.vue'

const props = defineProps<{
  pillar: PillarData
}>()

// 五行对应的 Tailwind 颜色类
const wuxingColorMap: Record<string, string> = {
  '木': '#4ecdc4', '火': '#ff6b6b', '土': '#f9ca24', '金': '#a0a0c0', '水': '#4834d4',
}

const ganWuXingColor = STEM_WUXING[props.pillar.gan]
  ? wuxingColorMap[STEM_WUXING[props.pillar.gan]] : '#8080b0'

const pillarIcon: Record<string, string> = {
  '年柱': '🏛', '月柱': '🌙', '日柱': '☀', '时柱': '⏰',
}
</script>

<template>
  <div class="card-cosmic p-3 md:p-4 transform transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5">
    <!-- 柱位标题 -->
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs text-cosmic-muted flex items-center gap-1">
        {{ pillarIcon[pillar.pillarType] || '📌' }} {{ pillar.pillarType }}
      </span>
      <span class="text-[10px] px-2 py-0.5 rounded-full bg-cosmic-bg text-cosmic-muted">
        {{ pillar.naYin }}
      </span>
    </div>

    <!-- 干支大字 -->
    <div class="text-center mb-2">
      <span
        class="text-2xl md:text-3xl font-bold tracking-wider"
        :style="{ color: ganWuXingColor }"
      >
        {{ pillar.gan }}
      </span>
      <span class="text-xl md:text-2xl text-cosmic-text font-medium ml-1">
        {{ pillar.zhi }}
      </span>
      <span class="text-[10px] text-cosmic-muted ml-1 align-super">
        {{ BRANCH_ANIMAL[pillar.zhi] || '' }}
      </span>
    </div>

    <!-- 十神 -->
    <div class="flex items-center justify-center gap-2 mb-2">
      <span class="px-2 py-0.5 rounded text-xs font-medium bg-cosmic-accent/20 text-cosmic-accent-light">
        {{ pillar.shiShen }}
      </span>
      <span v-if="pillar.shiShenZhi && pillar.shiShenZhi !== pillar.shiShen"
            class="px-2 py-0.5 rounded text-[10px] bg-cosmic-bg text-cosmic-muted">
        支:{{ pillar.shiShenZhi }}
      </span>
    </div>

    <!-- 藏干 -->
    <div class="flex items-center justify-center gap-1 mb-2">
      <span class="text-[10px] text-cosmic-muted">藏:</span>
      <span
        v-for="(hg, idx) in pillar.hideGan"
        :key="hg"
        class="text-xs px-1.5 py-0.5 rounded"
        :class="idx === 0 ? 'text-cosmic-text bg-cosmic-bg' : 'text-cosmic-muted'"
      >
        {{ hg }}
        <span v-if="idx < pillar.hideGan.length - 1" class="text-cosmic-border mx-0.5">·</span>
      </span>
    </div>

    <!-- 地势 -->
    <div class="text-center mb-3">
      <span class="text-[10px] text-cosmic-muted bg-cosmic-bg px-2 py-0.5 rounded-full">
        {{ pillar.diShi }}
      </span>
    </div>

    <!-- 神煞标签 -->
    <ShenShaTags :shen-sha-list="pillar.shenSha" />
  </div>
</template>
