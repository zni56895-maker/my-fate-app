<script setup lang="ts">
import type { JiXiong } from '@/types/bazi'

const props = withDefaults(defineProps<{
  name: string
  type?: JiXiong
}>(), {
  type: '中性',
})

const glowClass: Record<JiXiong, string> = {
  '吉': 'tag-glow-ji',
  '凶': 'tag-glow-xiong',
  '中性': 'tag-glow-neutral',
}

const typeEmoji: Record<JiXiong, string> = {
  '吉': '✨',
  '凶': '⚡',
  '中性': '🔮',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
      'transition-all duration-300 hover:scale-105',
      glowClass[type],
    ]"
  >
    <span class="text-[10px]">{{ typeEmoji[type] }}</span>
    {{ name }}
  </span>
</template>
