<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  title: string
  classicalText: string
  modernInterpretation: string
  professionalAdvice: string
  type?: 'result' | 'reference'
}>()

const expanded = ref(false)

function toggle() {
  expanded.value = !expanded.value
}

// ★ 根据 type 切换视觉
const isResult = computed(() => props.type !== 'reference')
const badgeLabel = computed(() => isResult.value ? 'AI 实时推演' : '知识库 / 规则')
const badgeClass = computed(() => isResult.value
  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
  : 'bg-slate-600/30 text-slate-400 border-slate-600/30')
const titleClass = computed(() => isResult.value ? 'text-amber-300' : 'text-slate-400')
const containerClass = computed(() => isResult.value
  ? 'bg-slate-800/50 border-amber-500/20 shadow-[0_0_12px_rgba(251,191,36,0.08)]'
  : 'bg-slate-800/20 border-slate-700/20')
</script>

<template>
  <div class="w-full">
    <!-- 标题行：点击触发 -->
    <div
      @click="toggle"
      class="flex items-center justify-between gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 select-none"
      :class="[containerClass, expanded ? 'rounded-b-none border-b-0' : '']"
    >
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-0.5">
          <span v-if="isResult" class="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_#fbbf24] shrink-0" />
          <span v-else class="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
          <span v-if="title" class="text-xs font-semibold" :class="titleClass">{{ title }}</span>
          <span class="text-[9px] px-1.5 py-0.5 rounded-full border" :class="badgeClass">{{ badgeLabel }}</span>
        </div>
        <p class="text-[11px] text-slate-400 italic leading-relaxed truncate mt-1">{{ classicalText }}</p>
      </div>
      <span class="flex-shrink-0 text-[10px] text-purple-400 whitespace-nowrap transition-transform duration-200" :class="expanded ? 'rotate-180' : ''">
        {{ expanded ? '▲ 收起' : '💡 点击查看解读' }}
      </span>
    </div>

    <!-- 展开内容：max-height 过渡动画 -->
    <div
      class="overflow-hidden transition-all duration-400 ease-in-out"
      :style="{ maxHeight: expanded ? '600px' : '0px', opacity: expanded ? 1 : 0 }"
    >
      <div class="p-3 rounded-b-lg border border-t-0 space-y-3"
        :class="isResult ? 'border-amber-500/20 bg-slate-800/40' : 'border-slate-700/20 bg-slate-800/15'">
        <!-- 现状解读 -->
        <div v-if="modernInterpretation">
          <h5 class="text-[10px] font-semibold text-purple-400 mb-1">📋 现状解读</h5>
          <p class="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{{ modernInterpretation }}</p>
        </div>

        <!-- 专业建议 -->
        <div v-if="professionalAdvice">
          <h5 class="text-[10px] font-semibold text-purple-400 mb-1">💡 专业建议</h5>
          <p class="text-xs text-purple-200 leading-relaxed">{{ professionalAdvice }}</p>
        </div>

        <!-- 底部收起按钮 -->
        <div class="text-right pt-1">
          <button
            @click.stop="expanded = false"
            class="text-[10px] px-3 py-1 rounded-full bg-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
          >
            ▲ 收起
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
