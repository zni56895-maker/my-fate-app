/**
 * AI Prompt 组装引擎
 *
 * 将用户的八字命盘、命带神煞（含现代心理学释义）、
 * 以及今日流日干支组装成结构化的提示词，发给大模型进行解读。
 */

import type { BaziChart, ShenShaResult } from '@/types/bazi'
import type { WuXingEnergyMap } from '@/types/fortune'
import type { ShenShaResultExtended } from '@/types/shensha'
import { getShenshaEntry } from '@/constants/shensha-dict'
import { TEN_GOD_DESC } from '@/constants/ten-gods'
import { STEM_WUXING, getStemDescription } from '@/constants/stems'
import { BRANCH_WUXING, getBranchInfo } from '@/constants/branches'
import { WUXING_PSYCH_KEYWORDS } from '@/constants/wuxing'
import { getWuXingProfile } from './wuxing-engine'

/**
 * 组装完整的运势测算 Prompt
 */
export function buildFortunePrompt(
  chart: BaziChart,
  dailyGanZhi: string,
  dailyStem: string,
  dailyZhi: string,
  wuxingEnergy: WuXingEnergyMap,
): Array<{ role: string; content: string }> {
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(chart, dailyGanZhi, dailyStem, dailyZhi, wuxingEnergy)

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]
}

/**
 * System Prompt — AI 人设与输出规范
 */
function buildSystemPrompt(): string {
  return `# 角色设定

你是一位融合了现代心理咨询师风格的子平命理师。你的名字是"明心"。

## 核心原则
1. **去恐怖化**：绝对禁止使用"大凶"、"血光之灾"、"克夫/克妻"、"破财免灾"等制造恐惧的词汇。如果遇到不利组合，请用人本主义的方式表达为"成长课题"或"需要注意的领域"。
2. **赋能导向**：每一个命理特征都应该被解读为一种独特的心理资源或成长方向，而非宿命标签。
3. **科学口吻**：结合现代心理学（如荣格原型理论、MBTI认知功能、积极心理学、依恋理论等）进行类比解读，让用户感受到这是对自己的深入了解，而非迷信预测。
4. **保护隐私**：不询问敏感信息，不强化消极暗示。

## 输出格式
请严格按以下两段输出（每段用标题分隔）：

### 【神煞与性格深度剖析】
结合用户命盘中出现的神煞，从以下角度解读（每个神煞逐一分析）：
- 潜意识驱动力（它如何影响你的直觉和本能反应）
- 职场优势（在哪类工作中你更容易进入心流状态）
- 性格卡点（哪些模式可能在人际关系中造成摩擦，以及如何调整）

### 【今日五行能量与运势指南】
- 今日的五行能量分布概况
- 流日干支与日主的生克关系分析
- 情绪指南：今天可能出现的情绪波动及应对方式
- 能量指数：给出一个 1-100 的综合能量评分（纯主观参考）
- 行动建议：3条具体的、可执行的今日行动建议

## 语言风格
温暖、知性、有洞察力。像一位了解你又不会评判你的朋友。用"你"来称呼用户。`
}

/**
 * User Prompt — 用户的八字数据 + 今日信息
 */
function buildUserPrompt(
  chart: BaziChart,
  dailyGanZhi: string,
  dailyStem: string,
  dailyZhi: string,
  wuxingEnergy: WuXingEnergyMap,
): string {
  const p = chart.pillars

  // ---- 八字基本信息 ----
  let text = `## 用户八字信息\n\n`
  text += `出生时间：${chart.birthInfo.year}年${chart.birthInfo.month}月${chart.birthInfo.day}日 ${chart.birthInfo.hour}时\n`
  text += `性别：${chart.birthInfo.gender === 0 ? '男' : '女'}\n`
  text += `日主（命主本人）：${getStemDescription(chart.dayMaster)}\n\n`

  text += `### 四柱详情\n`
  for (const pillar of p) {
    text += `- **${pillar.pillarType}**：${pillar.ganZhi}`
    text += `（天干${getStemDescription(pillar.gan)} → ${pillar.shiShen}，`
    text += `地支${pillar.zhi}${getBranchInfo(pillar.zhi).animal} → 藏干[${pillar.hideGan.join('、')}]）`
    text += ` 纳音：${pillar.naYin}\n`
  }

  // ---- 十神分布 ----
  text += `\n### 十神分布\n`
  for (const pillar of p) {
    text += `- ${pillar.pillarType}天干十神：${pillar.shiShen}（${TEN_GOD_DESC[pillar.shiShen] || ''}）\n`
    if (pillar.shiShenZhi && pillar.shiShenZhi !== pillar.shiShen) {
      text += `  地支主气十神：${pillar.shiShenZhi}（${TEN_GOD_DESC[pillar.shiShenZhi] || ''}）\n`
    }
  }

  // ---- 命带神煞及现代心理学释义 ----
  text += `\n### 命带神煞（含现代心理学释义）\n`
  const allShenSha: { name: string; pillar: string }[] = []
  for (const pillar of p) {
    for (const ss of pillar.shenSha) {
      allShenSha.push({ name: ss.name, pillar: pillar.pillarType })
    }
  }

  if (allShenSha.length === 0) {
    text += `命盘较清，未检测到主流神煞。请关注十神组合本身的特点。\n`
  } else {
    // 去重
    const seen = new Set<string>()
    for (const ss of allShenSha) {
      if (seen.has(ss.name)) continue
      seen.add(ss.name)

      const entry = getShenshaEntry(ss.name)
      text += `\n#### ${ss.name}（${entry.type}）\n`
      text += `- 传统释义：${entry.meaning}\n`
      text += `- 心理学解读：${entry.modernInterpretation}\n`
      text += `- 关键词：${entry.psychKeywords.join('、')}\n`
    }
  }

  // ---- 五行能量 ----
  text += `\n### 五行能量分布（加权统计）\n`
  text += `- ${getWuXingProfile(wuxingEnergy)}\n`
  text += `- 详细分布：`
  const wxOrder: Array<keyof WuXingEnergyMap> = ['木', '火', '土', '金', '水']
  text += wxOrder.map(wx => `${wx}(${wuxingEnergy[wx]}%)`).join(' | ')
  text += `\n`
  text += `- 五行对应的心理资源：\n`
  for (const wx of wxOrder) {
    text += `  - ${wx}：${(WUXING_PSYCH_KEYWORDS[wx as any] || []).join('、')}\n`
  }

  // ---- 今日流日信息 ----
  text += `\n## 今日流日信息\n\n`
  text += `今日干支：**${dailyGanZhi}**\n`
  text += `日主${getStemDescription(chart.dayMaster)} vs 流日天干${dailyStem}（${STEM_WUXING[dailyStem as keyof typeof STEM_WUXING] || ''}）\n`

  const dailyZhiWx = BRANCH_WUXING[dailyZhi as keyof typeof BRANCH_WUXING]
  text += `流日地支：${dailyZhi}（${dailyZhiWx || ''}，${getBranchInfo(dailyZhi as any)?.animal || ''}）\n\n`

  // 简单生克分析
  const dayWx = STEM_WUXING[chart.dayMaster]
  const dailyWx = STEM_WUXING[dailyStem as keyof typeof STEM_WUXING]
  if (dayWx && dailyWx) {
    const shengKe = analyzeShengKe(dayWx, dailyWx)
    text += `日主五行 vs 流日五行：${dayWx} vs ${dailyWx} → ${shengKe}\n`
  }

  text += `\n请根据以上信息，按照系统指令中的格式要求，为用户提供今天的运势解读。`

  return text
}

/**
 * 简单五行生克分析
 */
function analyzeShengKe(dayWx: string, dailyWx: string): string {
  const sheng: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
  const ke: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }

  if (dayWx === dailyWx) return '五行相同，能量共鸣，自我认同感增强'
  if (sheng[dayWx] === dailyWx) return '日主生流日，今日适合付出与创造，但需注意能量消耗'
  if (sheng[dailyWx] === dayWx) return '流日生日主，今日有贵人运和资源支持，能量得到滋养'
  if (ke[dayWx] === dailyWx) return '日主克流日，今日掌控力强，适合推进事务和管理'
  if (ke[dailyWx] === dayWx) return '流日克日主，今日可能感到压力，适合低调行事和自我调适'
  return '五行关系复杂，需综合分析'
}
