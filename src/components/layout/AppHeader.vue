<script setup lang="ts">
import IconButton from '@/components/shared/IconButton.vue'

const emit = defineEmits<{
  openConfig: []
}>()
</script>

<template>
  <header class="flex items-center justify-between px-4 py-3 md:px-6 border-b border-cosmic-border bg-cosmic-bg/80 backdrop-blur-sm sticky top-0 z-40">
    <div class="flex items-center gap-2 md:gap-3">
      <span class="text-2xl md:text-3xl animate-float">☯</span>
      <div>
        <h1 class="text-lg md:text-xl font-bold text-cosmic-accent-light leading-tight">
          命理玄学
        </h1>
        <p class="text-[10px] md:text-xs text-cosmic-muted">八字排盘 · 运势指南</p>
      </div>
    </div>

    <IconButton
      icon="⚙"
      label="设置"
      size="md"
      @click="emit('openConfig')"
    />
  </header>
</template>
