/**
 * useFortune — 纯本地运势测算
 *
 * v3: 使用 fortuneDatabase.ts 的升级版断语数据库。
 * 点击即出结果，零网络请求，完全离线可用。
 */

import { reactive, toRefs } from 'vue'
import type { BaziChart, HeavenlyStem } from '@/types/bazi'
import type { WuXingEnergyMap } from '@/types/fortune'
import { getTodayDailyPillar } from '@/utils/daily-pillar'
import { getTenGod } from '@/constants/stems'
import { getDailyTenShenFortune, getShenshaFull, buildDailyFortune, buildDimExplanations, generateShenshaSummary, type DailyFortuneV3 } from '@/constants/fortuneDatabase'

// ===== 类型 =====

export interface FortuneResult {
  dailyGanZhi: string
  todayTenGod: string
  fortune: DailyFortuneV3
  wuxingEnergy: WuXingEnergyMap
  shenshaDetails: { name: string; shortMeaning: string; dailyGuide: string }[]
  shenshaAdvice: string[]
  relationDesc: string
  dimScores: { label: string; value: number; color: string }[]
  dimExplanations: string[]
}

// ===== 全局状态 =====

const state = reactive<{
  result: FortuneResult | null
  computed: boolean
  error: string | null
}>({
  result: null,
  computed: false,
  error: null,
})

// ===== Composable =====

export function useFortune() {
  function calculate(chart: BaziChart, wuxingEnergy: WuXingEnergyMap): void {
    try {
      const daily = getTodayDailyPillar()
      const dailyGan = daily.gan as HeavenlyStem
      const dailyZhi = daily.zhi
      const dayMaster = chart.dayMaster

      // 今日十神
      const todayTenGod = dayMaster === dailyGan ? '日主' : getTenGod(dayMaster, dailyGan)

      // ★ 收集所有命中的神煞名
      const allShenShaNames: string[] = []
      for (const pillar of chart.pillars) {
        for (const ss of pillar.shenSha) {
          allShenShaNames.push(ss.name)
        }
      }

      // ★ 流日动态模板：五行生克 + 神煞维度分 + 十神偏移 → clamp 53-85
      const { fortune, dimScores } = buildDailyFortune(daily.ganZhi, todayTenGod, dayMaster, dailyGan, allShenShaNames)

      // ★ 每维评分逻辑说明
      const dimExplanations = buildDimExplanations(allShenShaNames, todayTenGod)

      // ★ 神煞聚合 2-3 条行动指引
      const shenshaAdvice = generateShenshaSummary(allShenShaNames, todayTenGod)

      // 收集神煞详情（去重）

      // 收集神煞详情（去重）
      const seen = new Set<string>()
      const shenshaDetails: { name: string; shortMeaning: string; dailyGuide: string }[] = []
      for (const pillar of chart.pillars) {
        for (const ss of pillar.shenSha) {
          if (seen.has(ss.name)) continue
          seen.add(ss.name)
          const full = getShenshaFull(ss.name)
          shenshaDetails.push({
            name: ss.name,
            shortMeaning: full.shortMeaning,
            dailyGuide: full.dailyGuide,
          })
        }
      }

      // 生克关系描述
      const relationDesc = buildRelationDesc(dayMaster, dailyGan, dailyZhi, todayTenGod)

      state.result = {
        dailyGanZhi: daily.ganZhi,
        todayTenGod,
        fortune,
        wuxingEnergy,
        shenshaDetails,
        shenshaAdvice,
        relationDesc,
        dimScores,
        dimExplanations,
      }
      state.computed = true
      state.error = null
    } catch (e: any) {
      state.error = e.message || '运势计算失败'
      state.result = null
    }
  }

  function clearResult(): void {
    state.result = null
    state.computed = false
    state.error = null
  }

  return { ...toRefs(state), calculate, clearResult }
}

// ===== 辅助 =====

function buildRelationDesc(
  dayMaster: HeavenlyStem,
  dailyGan: HeavenlyStem,
  dailyZhi: string,
  todayTenGod: string,
): string {
  const desc: Record<string, string> = {
    '比肩': '今日干支与日主五行相同、阴阳一致，是和自我能量同频共振的一天。适合独立行动和自我确认。',
    '劫财': '今日干支与日主五行相同但阴阳相反，社交和合作能量较强，但需注意财务支出。',
    '食神': '日主生出今日天干（同阴阳），创造力与才华自然流淌，是适合表达和享受的日子。',
    '伤官': '日主生出今日天干（异阴阳），思维活跃且锋芒毕露，注意语言表达的分寸。',
    '正财': '日主克制今日天干（异阴阳），对财富和价值的掌控感增强，是务实求财的好日子。',
    '偏财': '日主克制今日天干（同阴阳），意外之财和投资机会浮现，灵活应变能抓住好运。',
    '正官': '今日天干克制日主（异阴阳），责任感和自律性增强，适合接受挑战和展示专业。',
    '七杀': '今日天干克制日主（同阴阳），压力即动力——面对挑战时展现你的韧性和果敢。',
    '正印': '今日天干生出日主（异阴阳），贵人运和学习力提升，适合获取知识和寻求指导。',
    '偏印': '今日天干生出日主（同阴阳），深度思考与独立研究的好时机，深入的洞察将浮现。',
    '日主': '今日干支与日主相同，是最"自我"的一天。适合回归内心，确认自己的方向。',
  }
  return desc[todayTenGod] || `今日十神为${todayTenGod}，是与自己命格特殊互动的一天。`
}
