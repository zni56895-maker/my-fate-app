/**
 * 十二地支 — 基础属性映射
 *
 * 索引顺序：子(0) 丑(1) 寅(2) 卯(3) 辰(4) 巳(5) 午(6) 未(7) 申(8) 酉(9) 戌(10) 亥(11)
 */

import type { EarthlyBranch, WuXingElement, HeavenlyStem } from '@/types/bazi'

/** 地支信息 */
export interface BranchInfo {
  branch: EarthlyBranch
  wuXing: WuXingElement   // 本气五行
  yinYang: string
  animal: string          // 生肖
  season: string          // 季节
}

/** 十二地支列表 */
export const EARTHLY_BRANCHES: EarthlyBranch[] = [
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥',
]

/** 地支 → 本气五行 */
export const BRANCH_WUXING: Record<EarthlyBranch, WuXingElement> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
}

/** 地支 → 藏干（本气:中气:余气） */
export const BRANCH_HIDDEN_STEMS: Record<EarthlyBranch, HeavenlyStem[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
}

/** 地支 → 生肖 */
export const BRANCH_ANIMAL: Record<EarthlyBranch, string> = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
  '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
  '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪',
}

/** 地支 → 月份（农历近似） */
export const BRANCH_MONTH: Record<EarthlyBranch, number> = {
  '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6,
  '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12,
}

/** 地支索引 */
export const BRANCH_INDEX: Record<EarthlyBranch, number> = {
  '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
  '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11,
}

/** 索引 → 地支 */
export const BRANCH_BY_INDEX: Record<number, EarthlyBranch> = {
  0: '子', 1: '丑', 2: '寅', 3: '卯', 4: '辰', 5: '巳',
  6: '午', 7: '未', 8: '申', 9: '酉', 10: '戌', 11: '亥',
}

/** 地支三合局 */
export const SAN_HE_GROUPS: EarthlyBranch[][] = [
  ['申', '子', '辰'],  // 水局
  ['亥', '卯', '未'],  // 木局
  ['寅', '午', '戌'],  // 火局
  ['巳', '酉', '丑'],  // 金局
]

/** 获取三合局 */
export function getSanHeGroup(branch: EarthlyBranch): EarthlyBranch[] | null {
  for (const group of SAN_HE_GROUPS) {
    if (group.includes(branch)) return group
  }
  return null
}

/** 地支六冲 */
export const LIU_CHONG: Record<EarthlyBranch, EarthlyBranch> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳',
}

/** 地支六合 */
export const LIU_HE: Record<EarthlyBranch, EarthlyBranch> = {
  '子': '丑', '丑': '子',
  '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳',
  '午': '未', '未': '午',
}

/** 地支 → 时辰名称（0-23 小时） */
export function hourToShiChen(hour: number): EarthlyBranch {
  const map: [number, EarthlyBranch][] = [
    [23, '子'], [0, '子'], [1, '丑'], [3, '寅'], [5, '卯'],
    [7, '辰'], [9, '巳'], [11, '午'], [13, '未'], [15, '申'],
    [17, '酉'], [19, '戌'], [21, '亥'],
  ]
  for (const [h, branch] of map) {
    if (hour >= h && hour < h + 2) return branch
  }
  return '子'
}

/** 获取地支描述 */
export function getBranchInfo(branch: EarthlyBranch): BranchInfo {
  return {
    branch,
    wuXing: BRANCH_WUXING[branch],
    yinYang: ['子', '寅', '辰', '午', '申', '戌'].includes(branch) ? '阳' : '阴',
    animal: BRANCH_ANIMAL[branch],
    season: ['寅', '卯', '辰'].includes(branch) ? '春'
      : ['巳', '午', '未'].includes(branch) ? '夏'
      : ['申', '酉', '戌'].includes(branch) ? '秋'
      : '冬',
  }
}
