/**
 * 今日流日干支计算
 *
 * 获取当天的公历日期，转换为农历日柱干支、月、日信息
 */

import { Solar } from 'lunar-javascript'
import type { DailyPillar } from '@/types/fortune'
import type { HeavenlyStem, EarthlyBranch } from '@/types/bazi'

/**
 * 获取今天的流日干支
 */
export function getTodayDailyPillar(): DailyPillar {
  const now = new Date()
  const solar = Solar.fromYmd(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  )
  const lunar = solar.getLunar()
  const eightChar = lunar.getEightChar()

  const gan = eightChar.getDayGan?.() as HeavenlyStem ?? '甲'
  const zhi = eightChar.getDayZhi?.() as EarthlyBranch ?? '子'

  return {
    gan,
    zhi,
    ganZhi: `${gan}${zhi}`,
    lunarMonth: lunar.getMonthInChinese?.() ?? '',
    lunarDay: lunar.getDayInChinese?.() ?? '',
  }
}

/**
 * 获取指定日期的流日干支
 */
export function getDailyPillar(date: Date): DailyPillar {
  const solar = Solar.fromYmd(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  )
  const lunar = solar.getLunar()
  const eightChar = lunar.getEightChar()

  const gan = eightChar.getDayGan?.() as HeavenlyStem ?? '甲'
  const zhi = eightChar.getDayZhi?.() as EarthlyBranch ?? '子'

  return {
    gan,
    zhi,
    ganZhi: `${gan}${zhi}`,
    lunarMonth: lunar.getMonthInChinese?.() ?? '',
    lunarDay: lunar.getDayInChinese?.() ?? '',
  }
}
