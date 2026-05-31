/**
 * 十天干 — 基础属性映射
 *
 * 索引顺序：甲(0) 乙(1) 丙(2) 丁(3) 戊(4) 己(5) 庚(6) 辛(7) 壬(8) 癸(9)
 */

import type { HeavenlyStem, WuXingElement, YinYang } from '@/types/bazi'

/** 天干信息 */
export interface StemInfo {
  stem: HeavenlyStem
  wuXing: WuXingElement
  yinYang: YinYang
  label: string      // 中文名
}

/** 十天干列表（索引顺序） */
export const HEAVENLY_STEMS: HeavenlyStem[] = [
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸',
]

/** 天干 → 五行映射 */
export const STEM_WUXING: Record<HeavenlyStem, WuXingElement> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
}

/** 天干 → 阴阳映射 */
export const STEM_YINYANG: Record<HeavenlyStem, YinYang> = {
  '甲': '阳', '乙': '阴',
  '丙': '阳', '丁': '阴',
  '戊': '阳', '己': '阴',
  '庚': '阳', '辛': '阴',
  '壬': '阳', '癸': '阴',
}

/** 天干 → 标签映射（数值为索引） */
export const STEM_INDEX: Record<HeavenlyStem, number> = {
  '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
  '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9,
}

/** 索引 → 天干 */
export const STEM_BY_INDEX: Record<number, HeavenlyStem> = {
  0: '甲', 1: '乙', 2: '丙', 3: '丁', 4: '戊',
  5: '己', 6: '庚', 7: '辛', 8: '壬', 9: '癸',
}

/**
 * 计算十神：
 * 以日干为基准（"我"），与其他天干进行生克比较
 *
 * 规则：
 * - 同我 + 同阴阳 = 比肩
 * - 同我 + 异阴阳 = 劫财
 * - 生我 + 同阴阳 = 偏印
 * - 生我 + 异阴阳 = 正印
 * - 我生 + 同阴阳 = 食神
 * - 我生 + 异阴阳 = 伤官
 * - 克我 + 同阴阳 = 七杀
 * - 克我 + 异阴阳 = 正官
 * - 我克 + 同阴阳 = 偏财
 * - 我克 + 异阴阳 = 正财
 */
export function getTenGod(dayStem: HeavenlyStem, targetStem: HeavenlyStem): string {
  if (dayStem === targetStem) return '日主'

  const wuXingMap: Record<WuXingElement, WuXingElement> = {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木', // 我生
  }
  const keMap: Record<WuXingElement, WuXingElement> = {
    '木': '土', '火': '金', '土': '水', '金': '木', '水': '火', // 我克
  }

  const myWx = STEM_WUXING[dayStem]
  const tWx = STEM_WUXING[targetStem]
  const myYy = STEM_YINYANG[dayStem]
  const tYy = STEM_YINYANG[targetStem]
  const sameYinYang = myYy === tYy

  // 同五行 → 比劫
  if (myWx === tWx) return sameYinYang ? '比肩' : '劫财'

  // 对方生我 → 印星
  if (wuXingMap[tWx] === myWx) return sameYinYang ? '偏印' : '正印'

  // 我生对方 → 食伤
  if (wuXingMap[myWx] === tWx) return sameYinYang ? '食神' : '伤官'

  // 对方克我 → 官杀
  if (keMap[tWx] === myWx) return sameYinYang ? '七杀' : '正官'

  // 我克对方 → 财星
  if (keMap[myWx] === tWx) return sameYinYang ? '偏财' : '正财'

  return '日主'
}

/** 天干五行生克表（用于 AI prompt） */
export function getStemDescription(stem: HeavenlyStem): string {
  const info = getStemInfo(stem)
  return `${stem}(${info.yinYang}${info.wuXing})`
}

export function getStemInfo(stem: HeavenlyStem): StemInfo {
  return {
    stem,
    wuXing: STEM_WUXING[stem],
    yinYang: STEM_YINYANG[stem],
    label: stem,
  }
}
