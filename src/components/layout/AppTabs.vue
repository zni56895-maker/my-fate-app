<script setup lang="ts">
defineProps<{
  activeTab: 'bazi' | 'fortune' | 'liuyao' | 'search'
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: 'bazi' | 'fortune' | 'liuyao' | 'search']
}>()

/** 极简线条 SVG */
const lineIcons: Record<string, string> = {
  bazi: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></svg>',
  fortune: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1"><circle cx="8" cy="8" r="5"/><path d="M8 3v2M8 11v2M3 8h2M11 8h2"/><path d="M4.93 4.93l1.41 1.41M9.66 9.66l1.41 1.41M4.93 11.07l1.41-1.41M9.66 6.34l1.41-1.41"/></svg>',
  liuyao: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1"><path d="M2 3h12"/><path d="M2 6.5h12"/><path d="M2 10h12"/><path d="M2 13.5h12"/><circle cx="10" cy="6.5" r=".8"/><circle cx="6" cy="13.5" r=".8"/></svg>',
  search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>',
}

const tabs = [
  { key: 'bazi' as const, label: '八字盘面' },
  { key: 'fortune' as const, label: '今日运势' },
  { key: 'liuyao' as const, label: '六爻占卜' },
  { key: 'search' as const, label: '六爻寻物' },
]
</script>

<template>
  <nav class="flex justify-center gap-1 md:gap-4 px-4 py-3">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="emit('update:activeTab', tab.key)"
      :class="[
        'flex items-center gap-2 px-3 md:px-5 py-2 text-sm font-light transition-all duration-300 relative outline-none',
        activeTab === tab.key ? 'text-white' : 'text-white/30 hover:text-white/60',
      ]"
    >
      <span class="inline-block w-4 h-4" :class="{ 'drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]': activeTab === tab.key }" v-html="lineIcons[tab.key]" />
      {{ tab.label }}
      <div v-if="activeTab === tab.key" class="absolute bottom-0 left-0 right-0 h-[0.5px]" style="background: linear-gradient(to right, transparent, rgba(255,255,255,0.45), transparent);" />
    </button>
  </nav>
</template>
