/**
 * ★ 核心：神煞查表引擎
 *
 * 所有神煞均使用经典口诀查表法计算。
 * lunar-javascript 的 Lunar.getDayJiShen() 是黄历日神煞，不是生辰命盘神煞，
 * 因此本文件全部自实现。
 */

import type { BaziChart, HeavenlyStem, EarthlyBranch, PillarData } from '@/types/bazi'
import type { ShenShaResult } from '@/types/shensha'
import { getShenshaEntry } from '@/constants/shensha-dict'
import { getSanHeGroup, BRANCH_INDEX, BRANCH_BY_INDEX } from '@/constants/branches'

// ===== 主入口 =====

/**
 * 计算命盘中所有四柱的神煞
 * 返回: { 0: 年柱神煞[], 1: 月柱神煞[], 2: 日柱神煞[], 3: 时柱神煞[] }
 */
export function computeAllShenSha(chart: BaziChart): Record<number, ShenShaResult[]> {
  const result: Record<number, ShenShaResult[]> = { 0: [], 1: [], 2: [], 3: [] }
  const dayStem = chart.dayMaster
  const monthZhi = chart.pillars[1].zhi // 月支

  // 所有神煞检查函数列表
  const checkers: Array<{
    name: string
    category: 'library' | 'custom'
    fn: (pillar: PillarData, dayStem: HeavenlyStem, monthZhi: EarthlyBranch) => boolean
  }> = [
    // ---- 库自带神煞（实际上全部自定义实现） ----
    { name: '文昌贵人', category: 'library', fn: (p, ds) => checkWenChang(ds, p.zhi) },
    { name: '华盖', category: 'library', fn: (p, _ds, _mz) => checkHuaGai(p.zhi) },
    { name: '驿马', category: 'library', fn: (p, _ds, _mz) => checkYiMa(p.zhi) },
    { name: '桃花', category: 'library', fn: (p, _ds, _mz) => checkTaoHua(p.zhi) },
    { name: '天乙贵人', category: 'library', fn: (p, ds) => checkTianYiGuiRen(ds, p.zhi) },
    { name: '太极贵人', category: 'library', fn: (p, ds) => checkTaiJiGuiRen(ds, p.zhi) },
    { name: '福星贵人', category: 'library', fn: (p, ds) => checkFuXingGuiRen(ds, p.zhi) },
    // ---- 自定义神煞 ----
    { name: '天德贵人', category: 'custom', fn: (p, ds, mz) => checkTianDeGuiRen(mz, ds) },
    { name: '月德贵人', category: 'custom', fn: (p, ds, mz) => checkYueDeGuiRen(mz, ds) },
    { name: '天医', category: 'custom', fn: (p, _ds, mz) => checkTianYi(mz, p.zhi) },
    { name: '羊刃', category: 'custom', fn: (p, ds) => checkYangRen(ds, p.zhi) },
    { name: '天罗地网', category: 'custom', fn: (p) => checkTianLuoDiWang(p.zhi) },
    { name: '金舆', category: 'library', fn: (p, ds) => checkJinYu(ds, p.zhi) },
  ]

  // 对每个柱检查所有神煞
  for (let i = 0; i < 4; i++) {
    const pillar = chart.pillars[i]
    for (const checker of checkers) {
      if (checker.fn(pillar, dayStem, monthZhi)) {
        const entry = getShenshaEntry(checker.name)
        result[i].push({
          name: checker.name,
          type: entry.type,
          category: checker.category,
          meaning: entry.meaning,
        })
      }
    }
  }

  return result
}

// ===== 三合局辅助函数 =====

/**
 * 根据地支获取三合局的"帝旺/长生/墓"三个位置的对应神煞
 *
 * 三合局: 申子辰(水) 亥卯未(木) 寅午戌(火) 巳酉丑(金)
 *
 * 华盖 = 墓库位：申子辰→辰, 亥卯未→未, 寅午戌→戌, 巳酉丑→丑
 * 驿马 = 长生位对冲：申子辰→寅, 亥卯未→巳, 寅午戌→申, 巳酉丑→亥
 * 桃花 = 帝旺位：申子辰→午, 亥卯未→子, 寅午戌→卯, 巳酉丑→酉
 */

const SAN_HE_MU_KU: Record<EarthlyBranch, EarthlyBranch | null> = (() => {
  const map: Record<string, EarthlyBranch> = {}
  const groups: [EarthlyBranch, EarthlyBranch, EarthlyBranch, EarthlyBranch][] = [
    ['申', '子', '辰', '辰'],  // 水局，墓在辰
    ['亥', '卯', '未', '未'],  // 木局，墓在未
    ['寅', '午', '戌', '戌'],  // 火局，墓在戌
    ['巳', '酉', '丑', '丑'],  // 金局，墓在丑
  ]
  for (const [a, b, c, mu] of groups) {
    map[a] = mu; map[b] = mu; map[c] = mu
  }
  return map as Record<EarthlyBranch, EarthlyBranch | null>
})()

const SAN_HE_YI_MA: Record<EarthlyBranch, EarthlyBranch | null> = {
  '申': '寅', '子': '寅', '辰': '寅',  // 水局 → 寅(冲长生)
  '亥': '巳', '卯': '巳', '未': '巳',  // 木局 → 巳(冲长生)
  '寅': '申', '午': '申', '戌': '申',  // 火局 → 申(冲长生)
  '巳': '亥', '酉': '亥', '丑': '亥',  // 金局 → 亥(冲长生)
}

const SAN_HE_TAO_HUA: Record<EarthlyBranch, EarthlyBranch | null> = {
  '申': '酉', '子': '酉', '辰': '酉',  // 水局 → 酉(帝旺)
  '亥': '卯', '卯': '卯', '未': '卯',  // 木局 → 卯(帝旺)
  '寅': '午', '午': '午', '戌': '午',  // 火局 → 午(帝旺)
  '巳': '子', '酉': '子', '丑': '子',  // 金局 → 子(帝旺)
}

// ===== 1. 文昌贵人 =====
// 口诀：甲巳乙午报君知，丙戊申宫丁己鸡，庚猪辛鼠壬逢虎，癸人见卯入云梯

const WENCHANG_MAP: Record<HeavenlyStem, EarthlyBranch[]> = {
  '甲': ['巳'], '乙': ['午'], '丙': ['申'], '丁': ['酉'], '戊': ['申'],
  '己': ['酉'], '庚': ['亥'], '辛': ['子'], '壬': ['寅'], '癸': ['卯'],
}

function checkWenChang(dayStem: HeavenlyStem, branch: EarthlyBranch): boolean {
  return WENCHANG_MAP[dayStem]?.includes(branch) ?? false
}

// ===== 2. 华盖 =====
// 三合局墓库位

function checkHuaGai(branch: EarthlyBranch): boolean {
  return SAN_HE_MU_KU[branch] === branch
}

// ===== 3. 驿马 =====
// 三合局长生位对冲

function checkYiMa(branch: EarthlyBranch): boolean {
  return SAN_HE_YI_MA[branch] === branch
}

// ===== 4. 桃花（咸池） =====
// 三合局帝旺位

function checkTaoHua(branch: EarthlyBranch): boolean {
  return SAN_HE_TAO_HUA[branch] === branch
}

// ===== 5. 天乙贵人 =====
// 口诀：甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，六辛逢虎马

const TIANYI_MAP: Record<HeavenlyStem, EarthlyBranch[]> = {
  '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
  '乙': ['子', '申'], '己': ['子', '申'],
  '丙': ['亥', '酉'], '丁': ['亥', '酉'],
  '壬': ['卯', '巳'], '癸': ['卯', '巳'],
  '辛': ['午', '寅'],
}

function checkTianYiGuiRen(dayStem: HeavenlyStem, branch: EarthlyBranch): boolean {
  return TIANYI_MAP[dayStem]?.includes(branch) ?? false
}

// ===== 6. 太极贵人 =====
// 口诀：甲乙生人子午中，丙丁鸡兔定亨通，戊己两干临四季，庚辛寅亥禄丰隆，壬癸巳申偏喜美

const TAIJI_MAP: Record<HeavenlyStem, EarthlyBranch[]> = {
  '甲': ['子', '午'], '乙': ['子', '午'],
  '丙': ['卯', '酉'], '丁': ['卯', '酉'],
  '戊': ['辰', '戌', '丑', '未'], '己': ['辰', '戌', '丑', '未'],
  '庚': ['寅', '亥'], '辛': ['寅', '亥'],
  '壬': ['巳', '申'], '癸': ['巳', '申'],
}

function checkTaiJiGuiRen(dayStem: HeavenlyStem, branch: EarthlyBranch): boolean {
  return TAIJI_MAP[dayStem]?.includes(branch) ?? false
}

// ===== 7. 福星贵人 =====
// 口诀：甲丙相邀入虎乡，更逢鼠戊最高强，戊猴己未丁宜亥，乙癸逢牛福禄昌
//       庚赶马头辛到巳，壬骑龙背喜非常

const FUXING_MAP: Record<HeavenlyStem, EarthlyBranch[]> = {
  '甲': ['寅'], '丙': ['寅'],
  '戊': ['申'], '己': ['未'],
  '丁': ['亥'], '乙': ['丑'], '癸': ['丑'],
  '庚': ['午'], '辛': ['巳'],
  '壬': ['辰'],
}

function checkFuXingGuiRen(dayStem: HeavenlyStem, branch: EarthlyBranch): boolean {
  return FUXING_MAP[dayStem]?.includes(branch) ?? false
}

// ===== 8. 天德贵人 =====
// 口诀：正丁二申宫，三壬四辛同，五亥六甲上，七癸八寅逢，九丙十居乙，子巳丑庚中
// 月份按地支顺序（寅月起）：寅月见丁, 卯月见申, 辰月见壬, 巳月见辛, 午月见亥,
//                            未月见甲, 申月见癸, 酉月见寅, 戌月见丙, 亥月见乙,
//                            子月见巳, 丑月见庚

const TIANDE_MAP: Record<EarthlyBranch, HeavenlyStem[]> = {
  '寅': ['丁'], '卯': ['申' as any], '辰': ['壬'], '巳': ['辛'],
  '午': ['亥' as any], '未': ['甲'], '申': ['癸'], '酉': ['寅' as any],
  '戌': ['丙'], '亥': ['乙'], '子': ['巳' as any], '丑': ['庚'],
}

function checkTianDeGuiRen(monthZhi: EarthlyBranch, dayStem: HeavenlyStem): boolean {
  // 天德看的是天干
  // 简化：检查月支对应的天德天干是否出现在日/时干
  // 更通用的做法：检查日柱天干是否匹配月支对应的天德天干
  return TIANDE_MAP[monthZhi]?.some(s => s === dayStem) ?? false
}

// ===== 9. 月德贵人 =====
// 口诀：寅午戌月见丙，申子辰月见壬，亥卯未月见甲，巳酉丑月见庚

const YUEDE_GROUPS: Record<EarthlyBranch, HeavenlyStem> = {
  '寅': '丙', '午': '丙', '戌': '丙',
  '申': '壬', '子': '壬', '辰': '壬',
  '亥': '甲', '卯': '甲', '未': '甲',
  '巳': '庚', '酉': '庚', '丑': '庚',
}

function checkYueDeGuiRen(monthZhi: EarthlyBranch, dayStem: HeavenlyStem): boolean {
  return YUEDE_GROUPS[monthZhi] === dayStem
}

// ===== 10. 天医 =====
// 口诀：正月起丑，顺行十二辰（寅月丑、卯月寅、辰月卯...）

const TIANYI_POSITIONS: EarthlyBranch[] = [
  '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子',
]
const MONTH_ZHI_ORDER: EarthlyBranch[] = [
  '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑',
]

function checkTianYi(monthZhi: EarthlyBranch, branch: EarthlyBranch): boolean {
  const idx = MONTH_ZHI_ORDER.indexOf(monthZhi)
  if (idx < 0) return false
  return TIANYI_POSITIONS[idx] === branch
}

// ===== 11. 羊刃 =====
// 口诀：甲刃在卯，乙刃在寅，丙戊刃在午，丁己刃在巳，庚刃在酉，辛刃在申，壬刃在子，癸刃在亥

const YANGREN_MAP: Record<HeavenlyStem, EarthlyBranch> = {
  '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳', '戊': '午',
  '己': '巳', '庚': '酉', '辛': '申', '壬': '子', '癸': '亥',
}

function checkYangRen(dayStem: HeavenlyStem, branch: EarthlyBranch): boolean {
  return YANGREN_MAP[dayStem] === branch
}

// ===== 12. 天罗地网 =====
// 天罗：戌亥  地网：辰巳
// 男怕天罗，女怕地网

function checkTianLuoDiWang(branch: EarthlyBranch): boolean {
  return branch === '戌' || branch === '亥' || branch === '辰' || branch === '巳'
}

// ===== 13. 金舆 =====
// 口诀：甲龙乙蛇丙戊羊，丁己猴庚犬辛虎，壬猪癸兔是金舆

const JINYU_MAP: Record<HeavenlyStem, EarthlyBranch[]> = {
  '甲': ['辰'], '乙': ['巳'], '丙': ['未'], '丁': ['申'], '戊': ['未'],
  '己': ['申'], '庚': ['戌'], '辛': ['亥'], '壬': ['丑'], '癸': ['寅'],
}

function checkJinYu(dayStem: HeavenlyStem, branch: EarthlyBranch): boolean {
  return JINYU_MAP[dayStem]?.includes(branch) ?? false
}
