<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  text: string
  isStreaming: boolean
  error: string | null
}>()

const outputRef = ref<HTMLDivElement>()

// 当文本更新时，自动滚动到底部
watch(() => props.text, async () => {
  await nextTick()
  if (outputRef.value) {
    outputRef.value.scrollTop = outputRef.value.scrollHeight
  }
})

/** 渲染 markdown 中的粗体和标题（简单处理） */
function renderMarkdown(text: string): string {
  let html = text
    // 标题
    .replace(/###\s*(.+)/g, '<h4 class="text-cosmic-accent-light font-semibold mt-4 mb-2 text-base">$1</h4>')
    .replace(/##\s*(.+)/g, '<h3 class="text-cosmic-gold font-bold mt-4 mb-2 text-lg">$1</h3>')
    // 粗体
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-cosmic-accent-light font-semibold">$1</strong>')
    // 换行
    .replace(/\n/g, '<br />')
    // 列表
    .replace(/^-\s+(.+)$/gm, '<div class="flex items-start gap-2 ml-2 my-1"><span class="text-cosmic-accent mt-1">•</span><span>$1</span></div>')
  return html
}
</script>

<template>
  <div class="card-cosmic p-4 md:p-6">
    <!-- 状态提示 -->
    <div v-if="!text && !isStreaming && !error" class="text-center py-8">
      <span class="text-4xl block mb-3"><svg viewBox="0 0 16 16" class="w-12 h-12 mx-auto text-white/30" fill="none" stroke="currentColor" stroke-width="1"><polygon points="8,2 10,6 14,6.5 11,9.5 11.5,14 8,12 4.5,14 5,9.5 2,6.5 6,6.5"/></svg></span>
      <p class="text-cosmic-muted">完成排盘后，点击上方按钮即可获取 AI 运势解读</p>
      <p class="text-xs text-cosmic-muted mt-2">请先在右上角配置 API Key</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="text-center py-4">
      <span class="text-3xl block mb-2"><svg viewBox="0 0 16 16" class="w-8 h-8 mx-auto text-rose-400/60" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="5.5"/><path d="M5 5l6 6M11 5l-6 6"/></svg></span>
      <p class="text-cosmic-danger text-sm">{{ error }}</p>
    </div>

    <!-- 流式输出区域 -->
    <div
      v-if="text"
      ref="outputRef"
      class="prose prose-invert max-w-none max-h-[60vh] overflow-y-auto
             text-sm md:text-base leading-relaxed text-cosmic-text"
    >
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="renderMarkdown(text)" />
      <span v-if="isStreaming" class="cursor-blink" />
    </div>

    <!-- 空输出 + 流式中 -->
    <div v-if="isStreaming && !text" class="flex flex-col items-center gap-3 py-8">
      <div class="w-8 h-8 border-2 border-cosmic-accent/30 border-t-cosmic-accent rounded-full animate-spin" />
      <p class="text-cosmic-muted text-sm">AI 正在解读...</p>
    </div>
  </div>
</template>
