<script setup lang="ts">
import type { JiXiong } from '@/types/bazi'

const props = withDefaults(defineProps<{
  name: string
  type?: JiXiong
}>(), {
  type: '中性',
})
</script>

<template>
  <span class="text-purple-200/70 text-xs transition-all duration-300 hover:text-purple-200 hover:drop-shadow-[0_0_6px_rgba(168,85,247,0.4)] lowercase cursor-default">
    {{ name }}
  </span>
</template>
