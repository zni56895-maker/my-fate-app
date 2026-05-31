/**
 * 五行 — 颜色/关键词/心理学含义
 */

import type { WuXingElement } from '@/types/bazi'

/** 五行颜色 */
export const WUXING_COLORS: Record<WuXingElement, string> = {
  '木': '#4ecdc4',
  '火': '#ff6b6b',
  '土': '#f9ca24',
  '金': '#a0a0c0',
  '水': '#4834d4',
}

/** 五行中文标签 */
export const WUXING_LABELS: Record<WuXingElement, string> = {
  '木': '木',
  '火': '火',
  '土': '土',
  '金': '金',
  '水': '水',
}

/** 五行心理学关键词 */
export const WUXING_PSYCH_KEYWORDS: Record<WuXingElement, string[]> = {
  '木': ['成长', '创造力', '决断力', '仁慈', '拓展'],
  '火': ['热情', '活力', '表达力', '礼仪', '行动'],
  '土': ['稳定', '诚信', '包容力', '务实', '积累'],
  '金': ['决断', '正义', '纪律', '变革', '收敛'],
  '水': ['智慧', '灵活', '洞察力', '内省', '流动'],
}

/** 五行相生关系 */
export const WUXING_SHENG: Record<WuXingElement, WuXingElement> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
}

/** 五行相克关系 */
export const WUXING_KE: Record<WuXingElement, WuXingElement> = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
}

/** 五行方位 */
export const WUXING_DIRECTION: Record<WuXingElement, string> = {
  '木': '东', '火': '南', '土': '中', '金': '西', '水': '北',
}

/** 五行对应的身体部位（中医角度） */
export const WUXING_BODY: Record<WuXingElement, string> = {
  '木': '肝胆', '火': '心小肠', '土': '脾胃', '金': '肺大肠', '水': '肾膀胱',
}
