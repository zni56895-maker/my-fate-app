/**
 * useBazi — 八字排盘响应式状态
 *
 * 监听出生信息变化，自动触发排盘计算。
 * 计算结果同时缓存到 LocalStorage。
 */

import { reactive, watch, toRefs } from 'vue'
import type { BirthInfo, BaziChart, DaYunResult, Gender } from '@/types/bazi'
import type { WuXingEnergyMap } from '@/types/fortune'
import { computeBazi } from '@/utils/bazi-engine'
import { computeDaYun } from '@/utils/yun-engine'
import { computeWuXingEnergy } from '@/utils/wuxing-engine'
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '@/utils/storage'

// ===== 默认出生信息 =====

const DEFAULT_BIRTH: BirthInfo = {
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  gender: 0 as Gender,
}

// ===== 全局状态（每个 reactive 对象内的属性名必须唯一，避免 toRefs 展开时覆盖） =====

const birthInfo = reactive<BirthInfo>(
  loadFromStorage<BirthInfo>(STORAGE_KEYS.BIRTH_INFO, { ...DEFAULT_BIRTH }),
)

const baziState = reactive<{
  data: BaziChart | null
  error: string | null
  computed: boolean
}>({
  data: null,
  error: null,
  computed: false,
})

const daYunState = reactive<{
  data: DaYunResult | null
}>({
  data: null,
})

const wuxingState = reactive<{
  data: WuXingEnergyMap
}>({
  data: { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 },
})

// ===== 自动计算 =====

function doCompute(): void {
  try {
    const chart = computeBazi(
      birthInfo.year,
      birthInfo.month,
      birthInfo.day,
      birthInfo.hour,
      birthInfo.gender,
    )
    baziState.data = chart
    baziState.error = null
    baziState.computed = true

    // 保存到 LocalStorage
    saveToStorage(STORAGE_KEYS.BAZI_CHART, chart)
    saveToStorage(STORAGE_KEYS.BIRTH_INFO, { ...birthInfo })

    // 大运
    try {
      const yun = computeDaYun(chart)
      daYunState.data = yun
    } catch (e: any) {
      console.warn('大运计算失败：', e.message || e)
      daYunState.data = null
    }

    // 五行能量
    try {
      const energy = computeWuXingEnergy(chart)
      wuxingState.data = energy
    } catch (e: any) {
      console.warn('五行能量计算失败：', e.message || e)
    }
  } catch (e: any) {
    baziState.error = e.message || '排盘计算失败，请检查输入日期'
    baziState.data = null
    baziState.computed = false
  }
}

// 首次加载时尝试从 LocalStorage 恢复
const savedChart = loadFromStorage<BaziChart | null>(STORAGE_KEYS.BAZI_CHART, null)
if (savedChart && savedChart.pillars && savedChart.pillars.length === 4) {
  baziState.data = savedChart
  baziState.computed = true

  // 恢复大运（重新计算，不缓存）
  try {
    const yun = computeDaYun(savedChart)
    daYunState.data = yun
  } catch { /* ignore */ }

  // 恢复五行
  try {
    const energy = computeWuXingEnergy(savedChart)
    wuxingState.data = energy
  } catch { /* ignore */ }
} else {
  // 首次加载，自动计算
  doCompute()
}

// 监听出生信息变化
watch(
  () => ({ ...birthInfo }),
  () => {
    doCompute()
  },
  { deep: true },
)

// ===== Composable =====

export function useBazi() {
  /** 更新出生信息中的某个字段 */
  function updateBirthInfo<K extends keyof BirthInfo>(key: K, value: BirthInfo[K]): void {
    ;(birthInfo as any)[key] = value
  }

  /** 重新计算 */
  function recalculate(): void {
    doCompute()
  }

  const baziRefs = toRefs(baziState)
  const yunRefs = toRefs(daYunState)
  const wxRefs = toRefs(wuxingState)

  return {
    birthInfo,
    // ★ 关键修复：给不同 reactive 的 data 用不同属性名返回
    baziData: baziRefs.data,
    baziError: baziRefs.error,
    baziComputed: baziRefs.computed,
    yunData: yunRefs.data,
    wuxingData: wxRefs.data,
    updateBirthInfo,
    recalculate,
  }
}
