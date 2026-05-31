<script setup lang="ts">
import type { DaYunEntry, DaYunResult } from '@/types/bazi'
import { ref, computed } from 'vue'

const props = defineProps<{
  daYunResult: DaYunResult | null
}>()

const showAll = ref(false)

const displayList = computed(() => {
  if (!props.daYunResult?.daYunList) return []
  return showAll.value
    ? props.daYunResult.daYunList
    : props.daYunResult.daYunList.slice(0, 4)
})
</script>

<template>
  <div v-if="daYunResult && daYunResult.daYunList.length > 0" class="card-cosmic p-4 md:p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base md:text-lg font-semibold text-cosmic-accent-light flex items-center gap-2">
        <span>🔄</span> 大运排盘
      </h3>
      <span class="text-xs text-cosmic-muted bg-cosmic-bg px-3 py-1 rounded-full">
        起运年龄：{{ daYunResult.startAge }}岁
      </span>
    </div>

    <!-- 桌面端横向时间线 -->
    <div class="hidden md:block overflow-x-auto pb-2">
      <div class="flex gap-3 min-w-max">
        <div
          v-for="(yun, idx) in displayList"
          :key="idx"
          class="flex-shrink-0 w-32 p-3 rounded-lg border border-cosmic-border bg-cosmic-bg/50
                 hover:border-cosmic-accent hover:shadow-glow transition-all duration-300"
        >
          <div class="text-xs text-cosmic-muted mb-1">{{ yun.startAge }}-{{ yun.endAge }}岁</div>
          <div class="text-lg font-bold text-cosmic-text tracking-wider">{{ yun.ganZhi }}</div>
          <div class="text-[10px] text-cosmic-muted mt-1">{{ yun.yearRange }}</div>
        </div>
      </div>
    </div>

    <!-- 移动端纵向列表 -->
    <div class="md:hidden grid grid-cols-2 gap-2">
      <div
        v-for="(yun, idx) in displayList"
        :key="idx"
        class="p-3 rounded-lg border border-cosmic-border bg-cosmic-bg/50"
      >
        <div class="text-[10px] text-cosmic-muted">{{ yun.startAge }}-{{ yun.endAge }}岁</div>
        <div class="text-base font-bold text-cosmic-text tracking-wider">{{ yun.ganZhi }}</div>
        <div class="text-[10px] text-cosmic-muted">{{ yun.yearRange }}</div>
      </div>
    </div>

    <button
      v-if="daYunResult.daYunList.length > 4"
      @click="showAll = !showAll"
      class="mt-3 text-xs text-cosmic-accent hover:text-cosmic-accent-light transition-colors w-full text-center"
    >
      {{ showAll ? '收起 ▲' : `展开全部 ${daYunResult.daYunList.length} 步大运 ▼` }}
    </button>
  </div>
</template>
