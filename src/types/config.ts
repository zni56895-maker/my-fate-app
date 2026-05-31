/**
 * 全局配置 — TypeScript 类型定义
 */

/** API 配置 */
export interface APIConfig {
  apiKey: string
  baseUrl: string    // 如 "https://api.deepseek.com"
  modelName: string  // 如 "deepseek-chat"
}

/** 全局配置 */
export interface GlobalConfig {
  api: APIConfig
}
