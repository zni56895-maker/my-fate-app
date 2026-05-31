/**
 * 八字排盘 — TypeScript 类型定义
 * 天干、地支、四柱、大运、十神等核心类型
 */

// ===== 基础类型 =====

/** 十天干 */
export type HeavenlyStem =
  | '甲' | '乙' | '丙' | '丁' | '戊'
  | '己' | '庚' | '辛' | '壬' | '癸'

/** 十二地支 */
export type EarthlyBranch =
  | '子' | '丑' | '寅' | '卯' | '辰' | '巳'
  | '午' | '未' | '申' | '酉' | '戌' | '亥'

/** 五行 */
export type WuXingElement = '木' | '火' | '土' | '金' | '水'

/** 阴阳 */
export type YinYang = '阳' | '阴'

/** 性别 */
export type Gender = 0 | 1 // 0=男 1=女

/** 吉凶类型 */
export type JiXiong = '吉' | '凶' | '中性'

// ===== 十神 =====

/** 十神（包含日主） */
export type TenGod =
  | '比肩' | '劫财' | '食神' | '伤官'
  | '正财' | '偏财' | '正官' | '七杀'
  | '正印' | '偏印' | '日主'

// ===== 四柱 =====

/** 柱位标识 */
export type PillarType = '年柱' | '月柱' | '日柱' | '时柱'

/** 单柱数据 */
export interface PillarData {
  pillarType: PillarType
  gan: HeavenlyStem          // 天干
  zhi: EarthlyBranch         // 地支
  ganZhi: string             // 干支组合，如"甲子"
  shiShen: TenGod            // 天干对应的十神
  shiShenZhi: TenGod         // 地支藏干主气对应的十神
  hideGan: HeavenlyStem[]    // 藏干列表
  diShi: string              // 十二长生地势
  naYin: string              // 纳音
  shenSha: ShenShaResult[]   // 该柱对应的神煞
}

// ===== 八字命盘 =====

/** 用户出生信息 */
export interface BirthInfo {
  year: number
  month: number    // 1-12
  day: number      // 1-31
  hour: number     // 0-23
  gender: Gender   // 0=男 1=女
}

/** 完整八字命盘 */
export interface BaziChart {
  pillars: PillarData[]       // [年, 月, 日, 时]，下标 0-3 对应四柱
  taiYuan: string             // 胎元
  mingGong: string            // 命宫
  shenGong: string            // 身宫
  dayMaster: HeavenlyStem     // 日主（日柱天干）
  birthInfo: BirthInfo        // 原始输入
}

// ===== 大运 =====

/** 单步大运 */
export interface DaYunEntry {
  index: number         // 0-based
  ganZhi: string        // 大运干支，如"甲子"
  startAge: number      // 起运年龄
  endAge: number        // 结束年龄
  yearRange: string     // 如 "2028-2037"
}

/** 大运结果 */
export interface DaYunResult {
  startYear: number
  startMonth: number
  startDay: number
  startAge: number
  daYunList: DaYunEntry[]
}

// ===== 神煞（从 shensha.ts 引用） =====
import type { ShenShaResult } from './shensha'
export type { ShenShaResult }
