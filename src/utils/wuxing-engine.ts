/**
 * 五行能量统计引擎
 *
 * 从八字命盘中统计五行分布，加权计算后输出归一化能量值供雷达图展示。
 *
 * 加权方案：
 * - 天干主气：权重 1.0（最显性的能量）
 * - 地支本气：权重 0.7（内在能量）
 * - 藏干中气/余气：权重 0.3（潜在能量）
 * - 归一化到 0-100
 */

import type { BaziChart, WuXingElement, HeavenlyStem } from '@/types/bazi'
import type { WuXingEnergyMap } from '@/types/fortune'
import { STEM_WUXING } from '@/constants/stems'
import { BRANCH_WUXING, BRANCH_HIDDEN_STEMS } from '@/constants/branches'

/**
 * 从八字命盘统计五行能量
 */
export function computeWuXingEnergy(chart: BaziChart): WuXingEnergyMap {
  const energy: WuXingEnergyMap = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 }

  for (const pillar of chart.pillars) {
    // 天干（权重 1.0）
    const ganWx = STEM_WUXING[pillar.gan]
    energy[ganWx] += 1.0

    // 地支本气（权重 0.7）
    const zhiWx = BRANCH_WUXING[pillar.zhi]
    energy[zhiWx] += 0.7

    // 藏干（权重 0.3 递减）
    const hideGan = pillar.hideGan
    for (let i = 0; i < hideGan.length; i++) {
      const hgWx = STEM_WUXING[hideGan[i]]
      // 首藏干 0.3，次藏干 0.2，三藏干 0.1
      const weight = 0.3 - i * 0.1
      energy[hgWx] += Math.max(weight, 0.05)
    }
  }

  // 归一化到 0-100
  const maxVal = Math.max(...Object.values(energy), 1)
  const normalized: WuXingEnergyMap = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 }
  for (const key of Object.keys(energy) as WuXingElement[]) {
    normalized[key] = Math.round((energy[key] / maxVal) * 100)
  }

  return normalized
}

/**
 * 将五行能量与流日干支叠加
 */
export function combineWithDaily(
  baseEnergy: WuXingEnergyMap,
  dailyStem: HeavenlyStem,
  dailyZhi: string,
): WuXingEnergyMap {
  const dailyStemWx = STEM_WUXING[dailyStem]
  const dailyZhiWx = BRANCH_WUXING[dailyZhi as keyof typeof BRANCH_WUXING] as WuXingElement | undefined

  const combined: WuXingEnergyMap = { ...baseEnergy }

  // 流日天干加 0.5 权重
  if (dailyStemWx) {
    combined[dailyStemWx] = (combined[dailyStemWx] || 0) + 10
  }
  // 流日地支加 0.3 权重
  if (dailyZhiWx) {
    combined[dailyZhiWx] = (combined[dailyZhiWx] || 0) + 7
  }

  // 再次归一化
  const maxVal = Math.max(...Object.values(combined), 1)
  for (const key of Object.keys(combined) as WuXingElement[]) {
    combined[key] = Math.min(100, Math.round((combined[key] / maxVal) * 100))
  }

  return combined
}

/**
 * 获取某个五行能量的心理学解读数据（给 AI Prompt 用）
 */
export function getWuXingProfile(energy: WuXingEnergyMap): string {
  const sorted = (Object.entries(energy) as [WuXingElement, number][])
    .sort((a, b) => b[1] - a[1])

  const strongest = sorted[0]
  const weakest = sorted[4]

  return `五行最强：${strongest[0]}(${strongest[1]}%)，五行最弱：${weakest[0]}(${weakest[1]}%)`
}
