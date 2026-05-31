<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = withDefaults(defineProps<{
  score: number
  label: string
  height?: string
}>(), {
  score: 50,
  label: '参考',
})

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function getColor(score: number): string {
  if (score >= 80) return '#f0c040'   // gold
  if (score >= 60) return '#4ecdc4'   // teal
  if (score >= 40) return '#6c5ce7'   // purple
  return '#e04040'                     // red
}

function initChart(): void {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value, undefined, { renderer: 'canvas' })
  }

  const color = getColor(props.score)

  chart.setOption({
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        center: ['50%', '60%'],
        radius: '90%',
        min: 0,
        max: 100,
        splitNumber: 10,
        axisLine: {
          show: true,
          lineStyle: {
            width: 20,
            color: [
              [0.3, '#e04040'],
              [0.5, '#6c5ce7'],
              [0.7, '#4ecdc4'],
              [0.85, '#a78bfa'],
              [1, '#f0c040'],
            ],
          },
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '60%',
          width: 8,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: 'auto',
          },
        },
        axisTick: {
          length: 10,
          lineStyle: { color: 'auto', width: 1.5 },
        },
        splitLine: {
          length: 18,
          lineStyle: { color: 'auto', width: 3 },
        },
        axisLabel: {
          color: '#8080b0',
          fontSize: 10,
          distance: 20,
          formatter: (v: number) => `${v}`,
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 18,
          itemStyle: {
            borderWidth: 2,
            borderColor: color,
          },
        },
        title: {
          show: true,
          offsetCenter: [0, '75%'],
          color: '#e0e0f0',
          fontSize: 14,
          fontWeight: 'bold',
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}',
          color: color,
          fontSize: 28,
          fontWeight: 'bold',
          offsetCenter: [0, '45%'],
        },
        data: [{ value: props.score, name: props.label || '今日运势' }],
      },
    ],
  })
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  chart?.dispose()
  chart = null
})

watch(() => props.score, () => {
  if (chart) initChart()
})
</script>

<template>
  <div
    ref="chartRef"
    :style="{ height: height || '250px', width: '100%' }"
    class="w-full"
  />
</template>
