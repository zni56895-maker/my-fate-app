/**
 * useFortune — 今日运势测算状态
 *
 * 管理 AI 流式解读的完整生命周期：
 * 检查配置 → 计算流日 → 组装 Prompt → 流式请求 → 累积文本
 */

import { reactive, toRefs } from 'vue'
import type { FortuneState } from '@/types/fortune'
import type { APIConfig } from '@/types/config'
import { getTodayDailyPillar } from '@/utils/daily-pillar'
import { buildFortunePrompt } from '@/utils/ai-prompt'
import { streamAIResponse } from '@/utils/ai-stream'
import type { BaziChart } from '@/types/bazi'
import type { WuXingEnergyMap } from '@/types/fortune'

// ===== 全局状态 =====

const state = reactive<FortuneState>({
  isLoading: false,
  isStreaming: false,
  streamedText: '',
  error: null,
  fortuneScore: 50,
  scoreLabel: '',
  dailyGanZhi: '',
  dailyWuXing: { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 },
})

let abortController: AbortController | null = null

// ===== Composable =====

export function useFortune() {
  /**
   * 开始运势测算
   */
  async function calculate(
    chart: BaziChart,
    wuxingEnergy: WuXingEnergyMap,
    apiConfig: APIConfig,
  ): Promise<void> {
    // 1. 重置状态
    state.isLoading = true
    state.isStreaming = true
    state.streamedText = ''
    state.error = null
    state.fortuneScore = 50
    state.scoreLabel = ''

    // 2. 检查 API 配置
    if (!apiConfig.apiKey || !apiConfig.apiKey.trim()) {
      state.error = '请先在右上角配置中心填写 API Key'
      state.isLoading = false
      state.isStreaming = false
      return
    }

    // 3. 获取今日流日
    const daily = getTodayDailyPillar()
    state.dailyGanZhi = daily.ganZhi

    // 4. 组装 Prompt
    const messages = buildFortunePrompt(
      chart,
      daily.ganZhi,
      daily.gan,
      daily.zhi,
      wuxingEnergy,
    )

    // 5. 创建 AbortController（用于取消请求）
    abortController = new AbortController()

    // 6. 流式请求
    try {
      for await (const chunk of streamAIResponse(apiConfig, messages)) {
        if (chunk.error) {
          state.error = chunk.error
          state.isLoading = false
          state.isStreaming = false
          return
        }

        if (chunk.done) {
          state.isLoading = false
          state.isStreaming = false
          break
        }

        if (chunk.content) {
          state.streamedText += chunk.content
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        state.error = null // 用户主动取消
      } else {
        state.error = err?.message || '未知错误'
      }
      state.isLoading = false
      state.isStreaming = false
      return
    }

    // 7. 完成后提取评分（从流式文本中尝试提取能量指数）
    extractScore()
    state.isLoading = false
    state.isStreaming = false
  }

  /**
   * 取消正在进行的请求
   */
  function cancel(): void {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    state.isLoading = false
    state.isStreaming = false
  }

  /**
   * 从流式文本中提取运势评分
   */
  function extractScore(): void {
    const text = state.streamedText
    // 尝试匹配 "能量指数" 后面的数字
    const scoreRegex = /能量指数[：:]\s*(\d{1,3})/i
    const match = text.match(scoreRegex)
    if (match) {
      const score = parseInt(match[1], 10)
      state.fortuneScore = Math.max(1, Math.min(100, score))
      state.scoreLabel = score >= 80 ? '大吉' : score >= 60 ? '吉' : score >= 40 ? '平' : score >= 20 ? '注意' : '调整'
    } else {
      // 随机一个温和的默认值
      state.fortuneScore = 50 + Math.floor(Math.random() * 30)
      state.scoreLabel = '参考'
    }
  }

  /** 清除运势缓存 */
  function clearFortune(): void {
    state.streamedText = ''
    state.error = null
    state.fortuneScore = 50
    state.scoreLabel = ''
    state.dailyGanZhi = ''
  }

  return {
    ...toRefs(state),
    calculate,
    cancel,
    clearFortune,
  }
}
