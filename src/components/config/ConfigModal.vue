<script setup lang="ts">
import { ref, watch } from 'vue'
import ModalOverlay from '@/components/shared/ModalOverlay.vue'
import type { APIConfig } from '@/types/config'

const props = defineProps<{
  visible: boolean
  apiConfig: APIConfig
}>()

const emit = defineEmits<{
  close: []
  save: [config: APIConfig]
}>()

const localConfig = ref<APIConfig>({ ...props.apiConfig })

watch(() => props.visible, (v) => {
  if (v) {
    localConfig.value = { ...props.apiConfig }
  }
})

function handleSave(): void {
  emit('save', { ...localConfig.value })
  emit('close')
}

const presets = [
  { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
  { name: 'OpenAI', baseUrl: 'https://api.openai.com', model: 'gpt-4o' },
  { name: '硅基流动', baseUrl: 'https://api.siliconflow.cn', model: 'deepseek-ai/DeepSeek-V3' },
]

function applyPreset(preset: typeof presets[0]): void {
  localConfig.value.baseUrl = preset.baseUrl
  localConfig.value.modelName = preset.model
}
</script>

<template>
  <ModalOverlay :visible="visible" @close="emit('close')">
    <div class="p-5 md:p-6">
      <!-- 标题 -->
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold text-cosmic-accent-light flex items-center gap-2">
          <span>⚙</span> 全局配置中心
        </h2>
        <button
          @click="emit('close')"
          class="text-cosmic-muted hover:text-cosmic-text transition-colors text-xl"
        >
          ✕
        </button>
      </div>

      <!-- 预设 -->
      <div class="mb-5">
        <p class="text-xs text-cosmic-muted mb-2">快捷预设</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="p in presets"
            :key="p.name"
            @click="applyPreset(p)"
            class="px-3 py-1.5 rounded-lg text-xs border border-cosmic-border
                   hover:border-cosmic-accent hover:text-cosmic-accent transition-all
                   bg-cosmic-bg text-cosmic-muted"
          >
            {{ p.name }}
          </button>
        </div>
      </div>

      <!-- API Key -->
      <div class="mb-4">
        <label class="block text-xs text-cosmic-muted mb-1.5">API Key</label>
        <input
          v-model="localConfig.apiKey"
          type="password"
          placeholder="sk-..."
          class="input-cosmic"
        />
        <p class="text-[10px] text-cosmic-muted mt-1">
          密钥仅保存在浏览器本地，绝不通过网络上传
        </p>
      </div>

      <!-- Base URL -->
      <div class="mb-4">
        <label class="block text-xs text-cosmic-muted mb-1.5">Base URL（API 地址）</label>
        <input
          v-model="localConfig.baseUrl"
          type="text"
          placeholder="https://api.deepseek.com"
          class="input-cosmic"
        />
      </div>

      <!-- Model Name -->
      <div class="mb-5">
        <label class="block text-xs text-cosmic-muted mb-1.5">Model Name（模型名称）</label>
        <input
          v-model="localConfig.modelName"
          type="text"
          placeholder="deepseek-chat"
          class="input-cosmic"
        />
      </div>

      <!-- 提示 -->
      <div class="p-3 rounded-lg bg-cosmic-bg border border-cosmic-border mb-5">
        <p class="text-[10px] text-cosmic-muted leading-relaxed">
          💡 <strong>提示：</strong>支持任何兼容 OpenAI API 格式的服务商（DeepSeek、OpenAI、硅基流动、Ollama 等）。请确保 Base URL 以 <code>https://</code> 开头，且以 <code>/v1</code> 结尾可省略（系统会自动补全）。
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3">
        <button @click="emit('close')" class="btn-cosmic-outline flex-1">
          取消
        </button>
        <button @click="handleSave" class="btn-cosmic flex-1" :disabled="!localConfig.apiKey.trim()">
          保存配置
        </button>
      </div>
    </div>
  </ModalOverlay>
</template>
