/**
 * ★ 核心：八字排盘引擎
 *
 * 基于 lunar-javascript 天文历法库，将公历出生日期转换为完整的八字命盘。
 * 输出：四柱干支、藏干、十神、纳音、地势、胎元、命宫、身宫、日主
 */

import { Solar, Lunar, EightChar } from 'lunar-javascript'
import type {
  BaziChart, PillarData, PillarType, BirthInfo,
  HeavenlyStem, EarthlyBranch, Gender,
} from '@/types/bazi'
import { STEM_WUXING, STEM_YINYANG, getTenGod } from '@/constants/stems'
import { BRANCH_HIDDEN_STEMS, hourToShiChen } from '@/constants/branches'
import { computeAllShenSha } from './shensha-engine'

// ===== 主入口 =====

/**
 * 根据公历出生信息计算完整八字命盘
 */
export function computeBazi(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: Gender,
): BaziChart {
  // 1. 构造 Solar 对象
  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0)
  const lunar = solar.getLunar()
  const eightChar = lunar.getEightChar()

  // 2. 提取四柱干支
  const yearGan = eightChar.getYearGan() as HeavenlyStem
  const yearZhi = eightChar.getYearZhi() as EarthlyBranch
  const monthGan = eightChar.getMonthGan() as HeavenlyStem
  const monthZhi = eightChar.getMonthZhi() as EarthlyBranch
  const dayGan = eightChar.getDayGan() as HeavenlyStem
  const dayZhi = eightChar.getDayZhi() as EarthlyBranch
  const timeGan = eightChar.getTimeGan() as HeavenlyStem
  const timeZhi = eightChar.getTimeZhi() as EarthlyBranch

  const dayMaster = dayGan

  // 3. 构建四柱数据
  const pillars: PillarData[] = [
    buildPillar('年柱', yearGan, yearZhi, dayMaster),
    buildPillar('月柱', monthGan, monthZhi, dayMaster),
    buildPillar('日柱', dayGan, dayZhi, dayMaster),
    buildPillar('时柱', timeGan, timeZhi, dayMaster),
  ]

  // 4. 胎元、命宫、身宫
  const taiYuan = computeTaiYuan(monthGan, monthZhi)
  const mingGong = computeMingGong(monthZhi, hourToShiChen(hour))
  const shenGong = computeShenGong(monthZhi, hourToShiChen(hour))

  // 5. 构建完整命盘（先不填神煞）
  const chart: BaziChart = {
    pillars,
    taiYuan,
    mingGong,
    shenGong,
    dayMaster,
    birthInfo: { year, month, day, hour, gender },
  }

  // 6. 计算神煞并附加到各柱
  const shenShaMap = computeAllShenSha(chart)
  for (let i = 0; i < 4; i++) {
    chart.pillars[i].shenSha = shenShaMap[i] || []
  }

  return chart
}

// ===== 构建单柱数据 =====

function buildPillar(
  pillarType: PillarType,
  gan: HeavenlyStem,
  zhi: EarthlyBranch,
  dayMaster: HeavenlyStem,
): PillarData {
  const hideGan = BRANCH_HIDDEN_STEMS[zhi]
  const shiShen = pillarType === '日柱' ? '日主' : getTenGod(dayMaster, gan) as any
  // 地支主气十神（藏干第一位）
  const shiShenZhi = getTenGod(dayMaster, hideGan[0]) as any
  const diShi = getDiShi(dayMaster, zhi)
  const naYin = getNaYin(gan, zhi)

  return {
    pillarType,
    gan,
    zhi,
    ganZhi: `${gan}${zhi}`,
    shiShen,
    shiShenZhi,
    hideGan,
    diShi,
    naYin,
    shenSha: [],
  }
}

// ===== 纳音（六十甲子纳音表） =====

const NAYIN_TABLE: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
}

function getNaYin(gan: HeavenlyStem, zhi: EarthlyBranch): string {
  return NAYIN_TABLE[`${gan}${zhi}`] || '未知'
}

// ===== 十二长生地势 =====

const CHANG_SHENG_MAP: Record<HeavenlyStem, EarthlyBranch[]> = {
  '甲': ['亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌'],
  '乙': ['午', '巳', '辰', '卯', '寅', '丑', '子', '亥', '戌', '酉', '申', '未'],
  '丙': ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'],
  '丁': ['酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑', '子', '亥', '戌'],
  '戊': ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'],
  '己': ['酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑', '子', '亥', '戌'],
  '庚': ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰'],
  '辛': ['子', '亥', '戌', '酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑'],
  '壬': ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未'],
  '癸': ['卯', '寅', '丑', '子', '亥', '戌', '酉', '申', '未', '午', '巳', '辰'],
}

const DI_SHI_NAMES: string[] = [
  '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养',
]

function getDiShi(stem: HeavenlyStem, branch: EarthlyBranch): string {
  const seq = CHANG_SHENG_MAP[stem]
  if (!seq) return '未知'
  const idx = seq.indexOf(branch)
  return idx >= 0 ? DI_SHI_NAMES[idx] : '未知'
}

// ===== 胎元 =====
// 胎元 = 月干前一位 + 月支前三位

function computeTaiYuan(monthGan: HeavenlyStem, monthZhi: EarthlyBranch): string {
  const ganOrder: HeavenlyStem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const zhiOrder: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

  const ganIdx = ganOrder.indexOf(monthGan)
  const zhiIdx = zhiOrder.indexOf(monthZhi)

  const taiYuanGan = ganOrder[(ganIdx + 1) % 10]
  const taiYuanZhi = zhiOrder[(zhiIdx + 3) % 12]

  return `${taiYuanGan}${taiYuanZhi}`
}

// ===== 命宫 =====
// 命宫地支：从子位起正月，逆数到出生月；再从该位起子时，顺数到出生时

function computeMingGong(monthZhi: EarthlyBranch, timeZhi: EarthlyBranch): string {
  const zhiOrder: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const monthNum = zhiOrder.indexOf(monthZhi) + 1 // 寅=1 ... 丑=12（调整为正月的月支序号）

  // 简化计算：命宫地支 = (14 - monthNum + timeIdx) % 12
  const timeIdx = zhiOrder.indexOf(timeZhi)
  // 修正算法：从子起正月逆数
  const adjustedMonth = (monthNum + 1) % 12 // 子=正月
  const mingGongIdx = (adjustedMonth + timeIdx) % 12

  // 命宫天干：以年干按五虎遁
  return `(${zhiOrder[mingGongIdx]})`
}

// ===== 身宫 =====
// 与命宫对称

function computeShenGong(monthZhi: EarthlyBranch, timeZhi: EarthlyBranch): string {
  const zhiOrder: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const monthNum = zhiOrder.indexOf(monthZhi) + 1
  const timeIdx = zhiOrder.indexOf(timeZhi)
  const adjustedMonth = (monthNum + 1) % 12
  const shenGongIdx = (adjustedMonth - timeIdx + 12) % 12
  return `(${zhiOrder[shenGongIdx]})`
}

// ===== 八字摘要工具函数（供 AI Prompt 使用） =====

/**
 * 将命盘转为可读文本摘要
 */
export function baziToText(chart: BaziChart): string {
  const p = chart.pillars
  let text = '【八字命盘】\n'
  text += `出生：${chart.birthInfo.year}年${chart.birthInfo.month}月${chart.birthInfo.day}日 ${chart.birthInfo.hour}时\n`
  text += `性别：${chart.birthInfo.gender === 0 ? '男' : '女'}\n`
  text += `日主：${chart.dayMaster}\n\n`

  text += '四柱详情：\n'
  for (const pillar of p) {
    text += `${pillar.pillarType}：${pillar.ganZhi} `
    text += `天干${pillar.gan}(${pillar.shiShen}) `
    text += `地支${pillar.zhi} 藏干[${pillar.hideGan.join(', ')}] `
    text += `纳音${pillar.naYin} ${pillar.diShi}\n`

    if (pillar.shenSha.length > 0) {
      text += `  神煞：${pillar.shenSha.map(s => `${s.name}(${s.type})`).join('、')}\n`
    }
  }

  return text
}
