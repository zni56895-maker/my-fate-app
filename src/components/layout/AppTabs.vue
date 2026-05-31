<script setup lang="ts">
defineProps<{
  activeTab: 'bazi' | 'fortune'
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: 'bazi' | 'fortune']
}>()

const tabs = [
  { key: 'bazi' as const, label: '我的八字盘面', icon: '📊' },
  { key: 'fortune' as const, label: '今日运势指南', icon: '🔮' },
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
      <span class="mr-1.5">{{ tab.icon }}</span>{{ tab.label }}
      <div
        v-if="activeTab === tab.key"
        class="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-cosmic-accent to-transparent"
      />
    </button>
  </nav>
</template>
