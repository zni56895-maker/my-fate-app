/**
 * shensha-engine.ts — 72神煞引擎桥接层，支持大运流年动态扩展
 */

import type { BaziChart, PillarData, HeavenlyStem, EarthlyBranch } from '@/types/bazi'
import type { ShenShaResult } from '@/types/shensha'
import { computeAllShenSha72, SHENSHA72_DICT } from '@/constants/fortuneDatabase'
import { getTodayDailyPillar } from '@/utils/daily-pillar'

/** 生成大运+流年的虚拟柱 */
export function buildDynamicPillars(chart: BaziChart): PillarData[] {
  const extra: PillarData[] = []
  const ds = chart.dayMaster

  // 流年柱
  const now = new Date()
  const liuNianYear = now.getFullYear()
  const liuNianGanIdx = (liuNianYear - 4) % 10
  const liuNianZhiIdx = (liuNianYear - 4) % 12
  const ganArr: HeavenlyStem[] = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
  const zhiArr: EarthlyBranch[] = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
  extra.push({
    pillarType: '流年' as any, gan: ganArr[liuNianGanIdx], zhi: zhiArr[liuNianZhiIdx],
    ganZhi: ganArr[liuNianGanIdx] + zhiArr[liuNianZhiIdx],
    shiShen: '日主', shiShenZhi: '日主', hideGan: [], diShi: '', naYin: '', shenSha: [],
  })

  // 今日流日柱
  const daily = getTodayDailyPillar()
  extra.push({
    pillarType: '流日' as any, gan: daily.gan as HeavenlyStem, zhi: daily.zhi as EarthlyBranch,
    ganZhi: daily.ganZhi, shiShen: '日主', shiShenZhi: '日主',
    hideGan: [], diShi: '', naYin: '', shenSha: [],
  })

  return extra
}

export function computeAllShenSha(chart: BaziChart): Record<number, ShenShaResult[]> {
  const result: Record<number, ShenShaResult[]> = { 0: [], 1: [], 2: [], 3: [] }
  // ★ 传入大运+流年柱参与计算
  const dynamicPillars = buildDynamicPillars(chart)
  const hits = computeAllShenSha72(chart, dynamicPillars)

  // ★ 每柱独立去重
  const seenPerPillar: Record<number, Set<string>> = { 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set() }

  for (const h of hits) {
    const pi = h.pillar < 4 ? h.pillar : 2  // 大运流年挂日柱
    if (!result[pi]) result[pi] = []

    // ★ 去重：同名神煞在该柱只保留一次
    const displayName = h.pillar < 4 ? h.name : h.name + '🔥'
    const dedupKey = h.name // 用原名去重
    if (seenPerPillar[pi].has(dedupKey)) continue
    seenPerPillar[pi].add(dedupKey)

    result[pi].push({
      name: displayName, type: h.jiXiong, category: 'custom' as any,
      meaning: h.desc, rarity: (h as any).rarity || '', tag: (h as any).tag || '',
    } as any)
  }
  return result
}

export const SHENSHA_FACTIONS: Record<string, { label: string; color: string; names: string[] }> = {
  auspicious: { label:'吉星高照',color:'#f0c040',names:[] },
  wealth: { label:'财富才华',color:'#4ecdc4',names:[] },
  romance: { label:'浪漫桃花',color:'#f472b6',names:[] },
  tough: { label:'硬核凶煞',color:'#a855f7',names:[] },
  change: { label:'运势波动',color:'#fb923c',names:[] },
}

const typeToFaction: Record<string, string> = {
  '吉星高照':'auspicious','财富才华':'wealth','浪漫桃花':'romance',
  '硬核凶煞':'tough','运势波动':'change',
}

for (const entry of Object.values(SHENSHA72_DICT)) {
  const faction = typeToFaction[entry.type]
  if (faction && SHENSHA_FACTIONS[faction]) {
    SHENSHA_FACTIONS[faction].names.push(entry.name)
  }
}

export function groupShenShaByFaction(pillarsShenSha: Record<number, ShenShaResult[]>): Record<string, ShenShaResult[]> {
  const grouped: Record<string, ShenShaResult[]> = {}
  for (const key of Object.keys(SHENSHA_FACTIONS)) grouped[key] = []
  const seen = new Set<string>()
  const maxPillar = Math.max(4, ...Object.keys(pillarsShenSha).map(Number))
  for (let i = 0; i <= maxPillar; i++) {
    for (const ss of pillarsShenSha[i] || []) {
      // ★ 核心修复：清理火焰后缀和别名，确保去重生效
      let cleanName = ss.name.replace('🔥', '')
      // 咸池桃花 → 桃花
      if (cleanName === '咸池桃花') cleanName = '桃花'
      if (seen.has(cleanName)) continue
      seen.add(cleanName)
      for (const [key, faction] of Object.entries(SHENSHA_FACTIONS)) {
        if (faction.names.includes(cleanName)) { grouped[key].push(ss); break }
      }
    }
  }
  return grouped
}
