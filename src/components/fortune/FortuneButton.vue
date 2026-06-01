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
      :class="[
        'btn-cosmic text-base md:text-lg px-8 md:px-10 py-3 md:py-4 rounded-xl font-semibold',
        'inline-flex items-center gap-2',
        loading ? 'opacity-70' : '',
      ]"
    >
      <span v-if="loading" class="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      <span v-else>🔮</span>
      {{ loading ? '解读中...' : '测算今日运势' }}
    </button>
    <p v-if="!disabled && !loading" class="text-[10px] text-cosmic-muted mt-2">
      纯本地计算 · 点击即出结果 · 完全离线可用
    </p>
    <p v-if="disabled" class="text-xs text-cosmic-danger mt-2">
      ⚠ 请先在八字盘面中完成排盘
    </p>
  </div>
</template>
