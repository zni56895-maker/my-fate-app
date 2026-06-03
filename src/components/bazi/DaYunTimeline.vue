<script setup lang="ts">
import type { DaYunResult } from '@/types/bazi'
import { ref, computed } from 'vue'

const props = defineProps<{ daYunResult: DaYunResult | null }>()
const showAll = ref(false)

const displayList = computed(() => {
  if (!props.daYunResult?.daYunList) return []
  return showAll.value ? props.daYunResult.daYunList : props.daYunResult.daYunList.slice(0, 4)
})
</script>

<template>
  <div v-if="daYunResult && daYunResult.daYunList.length > 0" class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-light text-white/30 tracking-wider">大运排盘</h3>
      <span class="text-[10px] text-white/20">起运 {{ daYunResult.startAge }}岁</span>
    </div>
    <div class="hidden md:flex gap-3 overflow-x-auto pb-2">
      <div v-for="(yun, idx) in displayList" :key="idx" class="flex-shrink-0 flex flex-col gap-1 px-3 py-2 min-w-[100px]">
        <div class="text-[10px] text-white/20">{{ yun.startAge }}-{{ yun.endAge }}岁</div>
        <div class="text-sm font-light text-white/70 tracking-widest">{{ yun.ganZhi }}</div>
        <div class="text-[10px] text-white/20">{{ yun.yearRange }}</div>
        <div class="mt-1 w-full" style="background: linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent); height: 0.5px;" />
      </div>
    </div>
    <div class="md:hidden grid grid-cols-2 gap-2">
      <div v-for="(yun, idx) in displayList" :key="idx" class="flex flex-col gap-1 px-3 py-2">
        <div class="text-[10px] text-white/20">{{ yun.startAge }}-{{ yun.endAge }}岁</div>
        <div class="text-sm font-light text-white/70 tracking-widest">{{ yun.ganZhi }}</div>
        <div class="text-[10px] text-white/20">{{ yun.yearRange }}</div>
        <div class="mt-1 w-full" style="background: linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent); height: 0.5px;" />
      </div>
    </div>
    <button v-if="daYunResult.daYunList.length > 4" @click="showAll = !showAll" class="text-xs text-white/30 hover:text-white/60 transition-colors w-full text-center outline-none">{{ showAll ? '收起 −' : `全部 ${daYunResult.daYunList.length} 步大运 +` }}</button>
  </div>
</template>
