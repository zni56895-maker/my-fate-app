<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { WuXingElement } from '@/types/bazi'
import { WUXING_COLORS, WUXING_LABELS } from '@/constants/wuxing'

const props = defineProps<{
  wuxingData: Record<WuXingElement, number>
  height?: string
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function initChart(): void {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value, undefined, { renderer: 'canvas' })
  }

  const indicators = (Object.keys(WUXING_LABELS) as WuXingElement[]).map(wx => ({
    name: wx,
    max: 100,
    color: WUXING_COLORS[wx],
  }))

  const dataValues = (Object.keys(WUXING_LABELS) as WuXingElement[]).map(
    wx => props.wuxingData[wx] ?? 0,
  )

  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#12122a',
      borderColor: '#2a2a5a',
      textStyle: { color: '#e0e0f0', fontSize: 13 },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#8080b0', fontSize: 11 },
      data: ['命盘五行能量'],
    },
    radar: {
      center: ['50%', '45%'],
      radius: '65%',
      indicator: indicators,
      axisName: {
        color: '#8080b0',
        fontSize: 13,
        fontWeight: 'bold',
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(108, 92, 231, 0.02)', 'rgba(108, 92, 231, 0.02)'],
        },
      },
      splitLine: {
        lineStyle: { color: '#2a2a5a' },
      },
      axisLine: {
        lineStyle: { color: '#2a2a5a' },
      },
    },
    series: [
      {
        type: 'radar',
        name: '命盘五行能量',
        data: [{ value: dataValues, name: '五行能量' }],
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: {
          color: '#6c5ce7',
          width: 2,
        },
        areaStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: 'rgba(108, 92, 231, 0.4)' },
            { offset: 1, color: 'rgba(108, 92, 231, 0.05)' },
          ]),
        },
        itemStyle: {
          color: '#a78bfa',
        },
      },
    ],
  })
}

function resizeChart(): void {
  chart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
  chart = null
})

watch(() => props.wuxingData, () => {
  if (chart) {
    initChart()
  }
}, { deep: true })
</script>

<template>
  <div
    ref="chartRef"
    :style="{ height: height || '300px', width: '100%' }"
    class="w-full"
  />
</template>
