/**
 * 大运排盘引擎
 *
 * 利用 lunar-javascript 的 Yun 类计算大运。
 * 起运规则：阳男阴女顺排，阴男阳女逆排
 * gender: 0=男, 1=女
 */

import { Solar } from 'lunar-javascript'
import type { BaziChart, DaYunResult, DaYunEntry } from '@/types/bazi'

/**
 * 计算大运
 */
export function computeDaYun(chart: BaziChart): DaYunResult {
  const { year, month, day, hour, gender } = chart.birthInfo

  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0)
  const lunar = solar.getLunar()
  const eightChar = lunar.getEightChar()

  // getYun(gender) — gender: 0=男 1=女
  const yunList = eightChar.getYun?.(gender) ?? eightChar.getYun?.() ?? []

  const daYunList: DaYunEntry[] = []

  let startYear = year
  let startMonth = month
  let startDay = day
  let startAge = 0

  if (yunList && Array.isArray(yunList) && yunList.length > 0) {
    // 起运信息从第一个大运推算
    const firstYun = yunList[0]
    startAge = firstYun.getStartAge?.() ?? 0
    startYear = firstYun.getStartYear?.() ?? year + startAge
    startMonth = firstYun.getStartMonth?.() ?? month
    startDay = firstYun.getStartDay?.() ?? day

    for (let i = 0; i < yunList.length; i++) {
      const yun = yunList[i]
      try {
        const ganZhi = String(yun.getGanZhi?.() ?? '')
        const sAge = yun.getStartAge?.() ?? i * 10 + startAge
        const eAge = sAge + 9

        const startYearVal = startYear + sAge - startAge
        const endYearVal = startYearVal + 9

        daYunList.push({
          index: i,
          ganZhi,
          startAge: sAge,
          endAge: eAge,
          yearRange: `${startYearVal}-${endYearVal}`,
        })
      } catch {
        // 跳过解析失败的大运
        continue
      }
    }
  }

  return {
    startYear,
    startMonth,
    startDay,
    startAge,
    daYunList,
  }
}
