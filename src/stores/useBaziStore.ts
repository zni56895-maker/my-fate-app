import { defineStore } from 'pinia'
import type { BirthInfo, BaziChart, DaYunResult, Gender } from '@/types/bazi'
import type { WuXingEnergyMap } from '@/types/fortune'
import { computeBazi } from '@/utils/bazi-engine'
import { computeDaYun } from '@/utils/yun-engine'
import { computeWuXingEnergy } from '@/utils/wuxing-engine'
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '@/utils/storage'

const DEFAULT_BIRTH: BirthInfo = {
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  gender: 0 as Gender,
}

const DEFAULT_WUXING: WuXingEnergyMap = {
  '木': 0,
  '火': 0,
  '土': 0,
  '金': 0,
  '水': 0,
}

export const useBaziStore = defineStore('bazi', {
  state: () => ({
    birthInfo: loadFromStorage<BirthInfo>(STORAGE_KEYS.BIRTH_INFO, { ...DEFAULT_BIRTH }),
    baziData: null as BaziChart | null,
    baziError: null as string | null,
    baziComputed: false,
    yunData: null as DaYunResult | null,
    wuxingData: { ...DEFAULT_WUXING } as WuXingEnergyMap,
  }),

  actions: {
    init(): void {
      const savedChart = loadFromStorage<BaziChart | null>(STORAGE_KEYS.BAZI_CHART, null)
      if (savedChart && savedChart.pillars && savedChart.pillars.length === 4) {
        this.baziData = savedChart
        this.baziError = null
        this.baziComputed = true
        this.computeDerivedData(savedChart)
      } else {
        this.recalculate()
      }
    },

    setBirthInfo(info: BirthInfo): void {
      this.$patch({ birthInfo: { ...info } })
      this.recalculate()
    },

    updateBirthInfo<K extends keyof BirthInfo>(key: K, value: BirthInfo[K]): void {
      this.$patch({
        birthInfo: { ...this.birthInfo, [key]: value },
      })
      this.recalculate()
    },

    recalculate(): void {
      try {
        const chart = computeBazi(
          this.birthInfo.year,
          this.birthInfo.month,
          this.birthInfo.day,
          this.birthInfo.hour,
          this.birthInfo.gender,
        )

        this.baziData = chart
        this.baziError = null
        this.baziComputed = true

        saveToStorage(STORAGE_KEYS.BAZI_CHART, chart)
        saveToStorage(STORAGE_KEYS.BIRTH_INFO, { ...this.birthInfo })

        this.computeDerivedData(chart)
      } catch (e: any) {
        this.baziError = e.message || '排盘计算失败，请检查输入日期'
        this.baziData = null
        this.baziComputed = false
        this.yunData = null
        this.wuxingData = { ...DEFAULT_WUXING }
      }
    },

    computeDerivedData(chart: BaziChart): void {
      try {
        this.yunData = computeDaYun(chart)
      } catch (e: any) {
        console.warn('大运计算失败：', e.message || e)
        this.yunData = null
      }

      try {
        this.wuxingData = computeWuXingEnergy(chart)
      } catch (e: any) {
        console.warn('五行能量计算失败：', e.message || e)
        this.wuxingData = { ...DEFAULT_WUXING }
      }
    },
  },
})
