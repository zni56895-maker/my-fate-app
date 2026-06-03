<script setup lang="ts">
import type { JiXiong } from '@/types/bazi'

const props = withDefaults(defineProps<{
  name: string
  type?: JiXiong
}>(), {
  type: '中性',
})

const typeClass: Record<JiXiong, string> = {
  '吉': 'text-polarity-auspicious',
  '凶': 'text-polarity-inauspicious',
  '中性': 'text-polarity-neutral',
}
</script>

<template>
  <span :class="[typeClass[type], 'text-xs transition-all duration-300 hover:text-white lowercase cursor-default']">
    {{ name }}
  </span>
</template>
