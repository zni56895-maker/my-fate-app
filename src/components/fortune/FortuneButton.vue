<script setup lang="ts">
defineProps<{
  loading: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  calculate: []
}>()
</script>

<template>
  <div class="text-center">
    <button
      @click="emit('calculate')"
      :disabled="loading || disabled"
      class="inline-flex items-center gap-2 px-6 py-2 text-sm font-light text-white/60 border border-white/10 rounded-sm outline-none transition-all duration-300 hover:border-white/30 hover:text-white/80 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg v-if="!loading" viewBox="0 0 14 14" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1">
        <polygon points="7,1 9,5 13,5.5 10,8.5 10.5,13 7,11 3.5,13 4,8.5 1,5.5 5,5.5" />
      </svg>
      <span v-else class="inline-block w-3.5 h-3.5 border border-white/40 border-t-white/80 rounded-full animate-spin" />
      {{ loading ? '解读中...' : '测算今日运势' }}
    </button>
    <p v-if="!disabled && !loading" class="text-[10px] text-white/20 mt-3 font-extralight tracking-wider">
      纯本地计算 · 完全离线
    </p>
    <p v-if="disabled" class="text-[10px] text-white/20 mt-3 font-extralight">
      请先完成排盘
    </p>
  </div>
</template>
