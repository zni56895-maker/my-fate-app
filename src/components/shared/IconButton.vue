<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

const sizeClasses: Record<string, string> = {
  sm: 'text-lg p-1.5',
  md: 'text-2xl p-2',
  lg: 'text-3xl p-3',
}
</script>

<template>
  <button
    :class="[sizeClasses[size], 'hover:text-cosmic-accent transition-colors rounded-lg hover:bg-cosmic-accent/10']"
    :title="label"
  >
    {{ icon }}
  </button>
</template>
