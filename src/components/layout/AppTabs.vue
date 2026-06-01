<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  activeTab: 'bazi' | 'fortune' | 'liuyao' | 'search'
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: 'bazi' | 'fortune' | 'liuyao' | 'search']
}>()

const tabs = [
  { key: 'bazi' as const, label: '我的八字盘面', icon: 'material-symbols:table-chart-outline' },
  { key: 'fortune' as const, label: '今日运势指南', icon: 'material-symbols:magic-button' },
  { key: 'liuyao' as const, label: '六爻占卜', icon: 'mdi:bagua' },
  { key: 'search' as const, label: '六爻寻物', icon: 'mdi:search-web' },
]
</script>

<template>
  <nav class="flex border-b border-cosmic-border bg-cosmic-bg/60 backdrop-blur-sm sticky top-[57px] md:top-[65px] z-30">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="emit('update:activeTab', tab.key)"
      :class="[
        'flex-1 md:flex-none px-4 md:px-8 py-3 md:py-4 text-sm md:text-base font-medium transition-all duration-300 relative',
        activeTab === tab.key
          ? 'text-cosmic-accent-light'
          : 'text-cosmic-muted hover:text-cosmic-text',
      ]"
    >
      <Icon :icon="tab.icon" class="inline-block text-lg mr-1.5 align-middle" />{{ tab.label }}
      <div
        v-if="activeTab === tab.key"
        class="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-cosmic-accent to-transparent"
      />
    </button>
  </nav>
</template>
