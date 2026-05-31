/**
 * useConfig — 全局配置状态管理
 *
 * 管理 API 配置的读写，绑定 LocalStorage 持久化。
 */

import { reactive, toRefs } from 'vue'
import type { APIConfig, GlobalConfig } from '@/types/config'
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '@/utils/storage'

// ===== 默认配置 =====

const DEFAULT_API_CONFIG: APIConfig = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  modelName: 'deepseek-chat',
}

// ===== 全局单例状态 =====

const state = reactive<{
  apiConfig: APIConfig
  configModalOpen: boolean
}>({
  apiConfig: loadFromStorage<APIConfig>(
    STORAGE_KEYS.API_CONFIG,
    { ...DEFAULT_API_CONFIG },
  ),
  configModalOpen: false,
})

// ===== Composable =====

export function useConfig() {
  /** 保存 API 配置 */
  function saveApiConfig(config: APIConfig): void {
    state.apiConfig = { ...config }
    saveToStorage(STORAGE_KEYS.API_CONFIG, state.apiConfig)
  }

  /** 检查 API 是否已配置 */
  function isApiConfigured(): boolean {
    return !!(state.apiConfig.apiKey && state.apiConfig.apiKey.trim().length > 0)
  }

  /** 打开配置弹窗 */
  function openConfigModal(): void {
    state.configModalOpen = true
  }

  /** 关闭配置弹窗 */
  function closeConfigModal(): void {
    state.configModalOpen = false
  }

  /** 重置配置为默认值 */
  function resetConfig(): void {
    state.apiConfig = { ...DEFAULT_API_CONFIG }
    saveToStorage(STORAGE_KEYS.API_CONFIG, state.apiConfig)
  }

  return {
    ...toRefs(state),
    saveApiConfig,
    isApiConfigured,
    openConfigModal,
    closeConfigModal,
    resetConfig,
  }
}
