/**
 * classicRules.ts — 三本古籍神煞加权算法库
 *
 * 《三命通会》— 季节五行旺衰加权
 * 《协纪辨方书》— 流年神煞互涉联动
 * 《五行精纪》— 神煞互化规则
 */

import type { HeavenlyStem, EarthlyBranch } from '@/types/bazi'

// ============================================================
// 一、《三命通会》季节五行旺衰判定
// ============================================================

/** 根据地支判断季节 */
export function getSeason(zhi: EarthlyBranch): 'spring' | 'summer' | 'autumn' | 'winter' {
  if (['寅','卯','辰'].includes(zhi)) return 'spring'
  if (['巳','午','未'].includes(zhi)) return 'summer'
  if (['申','酉','戌'].includes(zhi)) return 'autumn'
  return 'winter'
}

/** 季节五行旺衰系数 */
export function seasonBoost(season: string, element: string): number {
  const table: Record<string, Record<string, number>> = {
    spring: { '木': 1.5, '火': 1.2, '土': 0.8, '金': 0.6, '水': 0.9 },
    summer: { '木': 0.8, '火': 1.5, '土': 1.2, '金': 0.9, '水': 0.6 },
    autumn: { '木': 0.6, '火': 0.9, '土': 0.8, '金': 1.5, '水': 1.2 },
    winter: { '木': 1.2, '火': 0.6, '土': 0.9, '金': 0.8, '水': 1.5 },
  }
  return table[season]?.[element] ?? 1.0
}

/** 天赦日季节校验（春戊寅/夏甲午/秋戊申/冬甲子） */
export function isTianSheSeasonMatch(monthZhi: EarthlyBranch, ganZhi: string): boolean {
  const s = getSeason(monthZhi)
  if (s === 'spring' && ganZhi === '戊寅') return true
  if (s === 'summer' && ganZhi === '甲午') return true
  if (s === 'autumn' && ganZhi === '戊申') return true
  if (s === 'winter' && ganZhi === '甲子') return true
  return false
}

/** 天德贵人季节权重加成（春木旺时天德力量更强） */
export function tianDeSeasonBonus(monthZhi: EarthlyBranch): number {
  const s = getSeason(monthZhi)
  return s === 'spring' ? 1.5 : s === 'autumn' ? 1.3 : 1.0
}

/** 月德贵人月令权重（当月月德额外加分） */
export function yueDeCurrentMonthBonus(monthZhi: EarthlyBranch, currentMonthZhi: EarthlyBranch): number {
  return monthZhi === currentMonthZhi ? 10 : 0
}

// ============================================================
// 二、《协纪辨方书》流年神煞互涉
// ============================================================

export interface ShenShaInteract {
  /** 互涉名称 */
  name: string
  /** 涉及的神煞名数组（需全部命中才触发） */
  triggers: string[]
  /** 对六维维度的影响 */
  effects: Partial<Record<'贵人'|'才华'|'情感'|'慧根'|'成就'|'考验', number>>
}

/** 流年神煞互涉规则表 */
export const INTERACT_RULES: ShenShaInteract[] = [
  { name:'太岁丧门双重凶', triggers:['太岁','丧门'], effects:{考验:20} },
  { name:'白虎血忌意外预警', triggers:['白虎','血忌'], effects:{考验:15} },
  { name:'天德化解太岁', triggers:['天德贵人','太岁'], effects:{考验:-20,贵人:15} },
  { name:'月德化解太岁', triggers:['月德贵人','太岁'], effects:{考验:-15,贵人:10} },
  { name:'驿马禄神动中得财', triggers:['驿马','禄神'], effects:{成就:15,考验:-10} },
  { name:'驿马金舆动中得贵', triggers:['驿马','金舆贵人'], effects:{成就:15} },
  { name:'吊客病符健康双警', triggers:['吊客','病符'], effects:{考验:15} },
  { name:'天德白虎吉化解凶', triggers:['天德贵人','白虎'], effects:{考验:-15,贵人:10} },
  { name:'福星岁破福镇破星', triggers:['福星贵人','岁破'], effects:{考验:-10,贵人:10} },
  { name:'将星驿马出师大吉', triggers:['将星','驿马'], effects:{成就:20} },
]

/** 检查互涉规则并返回累计效果 */
export function calcInteractEffects(hitNames: Set<string>): Partial<Record<string, number>> {
  const effects: Partial<Record<string, number>> = {}
  for (const rule of INTERACT_RULES) {
    if (rule.triggers.every(t => hitNames.has(t))) {
      for (const [dim, val] of Object.entries(rule.effects)) {
        effects[dim] = (effects[dim] || 0) + val
      }
    }
  }
  return effects
}

// ============================================================
// 三、《五行精纪》神煞互化
// ============================================================

export interface ShenShaTransform {
  name: string
  /** 需要同时命中的神煞对 */
  pair: [string, string]
  /** 对六维维度的调整 */
  effects: Partial<Record<string, number>>
  /** 互化文案 */
  desc: string
}

/** 神煞互化规则表 */
export const TRANSFORM_RULES: ShenShaTransform[] = [
  { pair:['劫煞','天乙贵人'], effects:{考验:-15,贵人:10}, name:'劫煞遇贵化吉', desc:'劫煞凶性被天乙贵人压制，凶中有救' },
  { pair:['亡神','华盖'], effects:{考验:-10}, name:'亡神遇华盖', desc:'亡神波动被华盖的定力吸收，凶转中性' },
  { pair:['羊刃','文昌贵人'], effects:{考验:-10,才华:15}, name:'羊刃遇文昌', desc:'刚猛有了智慧的引导，文武双全之象' },
  { pair:['咸池桃花','学堂'], effects:{情感:10,才华:15}, name:'桃花遇学堂', desc:'浪漫与才华兼备，以才养情之贵格' },
  { pair:['驿马','金神'], effects:{成就:20}, name:'驿马遇金神', desc:'动中带刚，奔波中出大成就的格局' },
  { pair:['孤辰','太极贵人'], effects:{考验:-15,慧根:10}, name:'孤辰遇太极', desc:'孤独被智慧转化，独处中悟道的天赋' },
  { pair:['寡宿','华盖'], effects:{考验:-10,慧根:15}, name:'寡宿遇华盖', desc:'独居之性化为深度创作力，天生艺术家的格局' },
  { pair:['天罗地网','禄神'], effects:{考验:-15,成就:10}, name:'天网遇禄', desc:'困境中有稳定的经济支撑，网不困有粮之人' },
  { pair:['阴阳差错','红鸾'], effects:{考验:-10,情感:10}, name:'阴阳差错遇红鸾', desc:'感情中的误会得到正桃花的修正' },
  { pair:['亡神','十灵日'], effects:{考验:-15,慧根:20}, name:'亡神遇十灵', desc:'灵魂波动被灵性觉知引导，慧根深厚的标志' },
  // ★ 禄马同乡（禄神+驿马同柱）
  { pair:['禄神','驿马'], effects:{成就:25}, name:'禄马同乡', desc:'《三命通会》禄马同乡格——禄位与驿马同宫，动中发财之大贵格' },
  // ★ 贵人乘旺（天乙+禄神同现）
  { pair:['天乙贵人','禄神'], effects:{贵人:20,成就:15}, name:'贵人乘旺', desc:'《三命通会》贵人乘旺——天乙贵人落在禄位，贵气加倍福泽深厚' },
  // ★ 空亡打折（吉星落空亡）
  { pair:['空亡','文昌贵人'], effects:{才华:-15}, name:'文昌落空', desc:'文昌贵人落入空亡，才华需更多努力才能兑现' },
  { pair:['空亡','天乙贵人'], effects:{贵人:-15}, name:'天乙落空', desc:'天乙贵人落入空亡，贵人虽有但助力减半' },
  { pair:['空亡','红鸾'], effects:{情感:-10}, name:'红鸾落空', desc:'红鸾落入空亡，感情机缘较晚成熟' },
]

/** 计算互化效果 */
export function calcTransformEffects(hitNames: Set<string>): {
  effects: Partial<Record<string, number>>
  descriptions: string[]
} {
  const effects: Partial<Record<string, number>> = {}
  const descriptions: string[] = []
  for (const rule of TRANSFORM_RULES) {
    if (hitNames.has(rule.pair[0]) && hitNames.has(rule.pair[1])) {
      descriptions.push(rule.desc)
      for (const [dim, val] of Object.entries(rule.effects)) {
        effects[dim] = (effects[dim] || 0) + (val as number)
      }
    }
  }
  return { effects, descriptions }
}
