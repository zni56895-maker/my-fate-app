/**
 * LocalStorage 封装
 *
 * 所有数据存储在浏览器本地，绝不通过网络上传到任何服务器。
 * 键名使用统一前缀，防止与其他应用冲突。
 */

const PREFIX = 'my-fate-app'

export const STORAGE_KEYS = {
  BAZI_CHART: `${PREFIX}_bazi_chart`,
  API_CONFIG: `${PREFIX}_api_config`,
  BIRTH_INFO: `${PREFIX}_birth_info`,
  FORTUNE_CACHE: `${PREFIX}_fortune_cache`,
} as const

/**
 * 保存数据到 LocalStorage
 */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    const json = JSON.stringify(data)
    localStorage.setItem(key, json)
  } catch (e) {
    console.error(`[Storage] 保存失败 (${key}):`, e)
  }
}

/**
 * 从 LocalStorage 读取数据
 * @param key - 存储键名
 * @param fallback - 如果不存在或解析失败，返回此默认值
 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null || raw === undefined) return fallback
    return JSON.parse(raw) as T
  } catch (e) {
    console.error(`[Storage] 读取失败 (${key}):`, e)
    return fallback
  }
}

/**
 * 删除指定键的数据
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error(`[Storage] 删除失败 (${key}):`, e)
  }
}

/**
 * 清空本应用所有数据
 */
export function clearAllData(): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    removeFromStorage(key)
  }
}
