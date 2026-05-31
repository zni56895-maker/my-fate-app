<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  text?: string
}>(), {
  size: 'md',
  text: '',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-8">
    <div
      :class="[
        'rounded-full border-2 border-cosmic-accent/30 border-t-cosmic-accent animate-spin',
        size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8',
      ]"
    />
    <p v-if="text" class="text-cosmic-muted text-sm">{{ text }}</p>
  </div>
</template>
