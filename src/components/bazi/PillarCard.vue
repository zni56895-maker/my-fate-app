<script setup lang="ts">
import type { PillarData } from '@/types/bazi'
import { STEM_WUXING } from '@/constants/stems'
import { BRANCH_ANIMAL } from '@/constants/branches'
import ShenShaTags from './ShenShaTags.vue'

const props = defineProps<{
  pillar: PillarData
}>()

// 星云五行色板（降饱和 · 星系灰度）
const wuxingColorMap: Record<string, string> = {
  '木': '#6ee7b7', '火': '#fda4af', '土': '#fde68a', '金': '#e2e8f0', '水': '#7dd3fc',
}

const ganWuXingColor = STEM_WUXING[props.pillar.gan]
  ? wuxingColorMap[STEM_WUXING[props.pillar.gan]] : '#8080b0'

/** 干支光晕色（配合星云色系微光） */
const ganGlowColor = ganWuXingColor + '40'

/** 极简线条 SVG 图标 */
const pillarSvgIcon: Record<string, string> = {
  '年柱': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="11" rx="1"/><path d="M2 6h12"/><path d="M5 1v3M11 1v3"/><circle cx="8" cy="10" r="1.5"/></svg>',
  '月柱': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 8A6 6 0 1 1 4.5 2.5 5 5 0 0 0 13 8Z"/></svg>',
  '日柱': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg>',
  '时柱': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>',
}

/** 每柱悬浮动画延迟 */
const floatDelayMap: Record<string, string> = {
  '年柱': '0s', '月柱': '0.5s', '日柱': '1s', '时柱': '1.5s',
}
const floatDelay = floatDelayMap[props.pillar.pillarType] || '0s'
</script>

<template>
  <div class="flex flex-col items-center gap-3 px-3 py-4">
    <!-- 辅助层：柱位标题 + 纳音 -->
    <div class="flex items-center justify-between w-full">
      <span class="flex items-center gap-1 text-white/30 text-xs">
        <span class="pillar-icon" v-html="pillarSvgIcon[pillar.pillarType]"></span>
        {{ pillar.pillarType }}
      </span>
      <span class="text-white/30 text-xs">{{ pillar.naYin }}</span>
    </div>

    <!-- 核心层：干支大字（细长美学 + 悬浮动画） -->
    <div class="flex items-baseline gap-1 mt-1 animate-float" :style="{ animationDelay: floatDelay }">
      <span class="text-3xl md:text-4xl font-thin tracking-widest" :style="{ color: ganWuXingColor, filter: 'drop-shadow(0 0 8px ' + ganGlowColor + ')' }">
        {{ pillar.gan }}
      </span>
      <span class="text-3xl md:text-4xl font-light tracking-wider" :style="{ color: '#c4b8d8', filter: 'drop-shadow(0 0 4px ' + ganGlowColor + ')' }">{{ pillar.zhi }}</span>
      <span class="text-xs text-white/30 self-center ml-1">{{ BRANCH_ANIMAL[pillar.zhi] || '' }}</span>
    </div>

    <!-- 辅助层：十神 · 藏干 · 地势 -->
    <div class="flex flex-col items-center gap-1 mt-2">
      <div class="flex items-center gap-2 text-xs text-white/30">
        <span>{{ pillar.shiShen }}</span>
        <span v-if="pillar.shiShenZhi && pillar.shiShenZhi !== pillar.shiShen" class="text-white/20">支:{{ pillar.shiShenZhi }}</span>
      </div>
      <div class="flex items-center gap-1 text-xs text-white/30">
        <span>藏</span>
        <span v-for="(hg, idx) in pillar.hideGan" :key="hg" :class="[ idx === 0 ? 'font-medium text-white/40' : 'text-white/20' ]">
          {{ hg }}<span v-if="idx < pillar.hideGan.length - 1" class="mx-0.5 text-white/10">·</span>
        </span>
      </div>
      <div><span class="text-white/25 text-xs">{{ pillar.diShi }}</span></div>
    </div>

    <!-- 星光层：神煞 -->
    <div class="mt-4 pt-3 border-t border-white/[0.04] w-full">
      <ShenShaTags :shen-sha-list="pillar.shenSha" />
    </div>
  </div>
</template>

<style scoped>
:deep(.pillar-icon) { display: inline-block; width: 1em; height: 1em; vertical-align: -0.125em; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.animate-float { animation: float 3s ease-in-out infinite; }
</style>
