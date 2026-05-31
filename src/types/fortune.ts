/**
 * 运势 — TypeScript 类型定义
 */

import type { WuXingElement } from './bazi'

/** 五行能量分布 */
export type WuXingEnergyMap = Record<WuXingElement, number>

/** 运势测算状态 */
export interface FortuneState {
  isLoading: boolean
  isStreaming: boolean
  streamedText: string
  error: string | null
  fortuneScore: number       // 0-100
  scoreLabel: string         // 如 "大吉"
  dailyGanZhi: string        // 今日干支
  dailyWuXing: WuXingEnergyMap
}

/** 今日流日数据 */
export interface DailyPillar {
  gan: string
  zhi: string
  ganZhi: string
  lunarMonth: string  // 农历月
  lunarDay: string    // 农历日
}
