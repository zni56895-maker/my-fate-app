<script setup lang="ts">
import { ref } from 'vue'
import { useConfig } from '@/composables/useConfig'
import { useBazi } from '@/composables/useBazi'
import { useFortune } from '@/composables/useFortune'

import AppHeader from '@/components/layout/AppHeader.vue'
import AppTabs from '@/components/layout/AppTabs.vue'
import BirthForm from '@/components/bazi/BirthForm.vue'
import PillarGrid from '@/components/bazi/PillarGrid.vue'
import DaYunTimeline from '@/components/bazi/DaYunTimeline.vue'
import WuXingRadar from '@/components/fortune/WuXingRadar.vue'
import FortuneGauge from '@/components/fortune/FortuneGauge.vue'
import FortuneButton from '@/components/fortune/FortuneButton.vue'
import AiStreamOutput from '@/components/fortune/AiStreamOutput.vue'
import ConfigModal from '@/components/config/ConfigModal.vue'

// ===== 全局状态 =====
const activeTab = ref<'bazi' | 'fortune'>('bazi')

const {
  apiConfig,
  configModalOpen,
  saveApiConfig,
  isApiConfigured,
  openConfigModal,
  closeConfigModal,
} = useConfig()

const {
  birthInfo,
  baziData: baziChart,
  baziError,
  baziComputed,
  yunData,
  wuxingData,
  updateBirthInfo,
} = useBazi()

const {
  isLoading: fortuneLoading,
  isStreaming: fortuneStreaming,
  streamedText,
  error: fortuneError,
  fortuneScore,
  scoreLabel,
  calculate: calcFortune,
} = useFortune()

// ===== 事件处理 =====
function handleCalculateFortune(): void {
  if (!baziChart) return
  if (!isApiConfigured()) {
    openConfigModal()
    return
  }
  calcFortune(baziChart, wuxingData, apiConfig)
}
</script>

<template>
  <div class="star-bg min-h-screen flex flex-col">
    <!-- 头部 -->
    <AppHeader @open-config="openConfigModal" />

    <!-- Tab 切换 -->
    <AppTabs v-model:active-tab="activeTab" />

    <!-- 内容区 -->
    <main class="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full space-y-5 md:space-y-6">
      <!-- ===== Tab 1: 我的八字盘面 ===== -->
      <div v-if="activeTab === 'bazi'">
        <!-- 出生信息表单 -->
        <BirthForm
          :birth-info="birthInfo"
          @update:birth-info="(info) => {
            for (const key of Object.keys(info) as Array<keyof typeof info>) {
              updateBirthInfo(key, info[key])
            }
          }"
        />

        <!-- 错误提示 -->
        <div v-if="baziError" class="card-cosmic p-4 text-center">
          <p class="text-cosmic-danger text-sm">{{ baziError }}</p>
        </div>

        <!-- 四柱网格 -->
        <div v-if="baziComputed && baziChart" class="space-y-5">
          <!-- 日主标识 -->
          <div class="text-center">
            <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cosmic-accent/10 border border-cosmic-accent/30">
              <span class="text-sm text-cosmic-muted">日主</span>
              <span class="text-xl font-bold text-cosmic-accent-light">{{ baziChart.dayMaster }}</span>
              <span class="text-xs text-cosmic-muted">(命主本人)</span>
            </span>
          </div>

          <!-- 四柱卡片 -->
          <PillarGrid :pillars="baziChart.pillars" />

          <!-- 胎元/命宫/身宫 -->
          <div class="flex justify-center gap-4 text-xs text-cosmic-muted">
            <span>胎元：{{ baziChart.taiYuan }}</span>
            <span>命宫：{{ baziChart.mingGong }}</span>
            <span>身宫：{{ baziChart.shenGong }}</span>
          </div>

          <!-- 大运时间线 -->
          <DaYunTimeline :da-yun-result="yunData" />
        </div>

        <!-- 未加载状态 -->
        <div v-if="!baziComputed && !baziError" class="card-cosmic p-8 text-center animate-fadeInUp">
          <span class="text-5xl block mb-4">☯</span>
          <p class="text-cosmic-muted text-lg">请选择出生信息，系统将自动排盘</p>
          <p class="text-cosmic-muted text-sm mt-2">支持 1900-{{ new Date().getFullYear() }} 年之间的公历日期</p>
        </div>
      </div>

      <!-- ===== Tab 2: 今日运势指南 ===== -->
      <div v-if="activeTab === 'fortune'">
        <!-- 没有八字数据时提示 -->
        <div v-if="!baziComputed || !baziChart" class="card-cosmic p-8 text-center animate-fadeInUp">
          <span class="text-5xl block mb-4">🔮</span>
          <p class="text-cosmic-muted text-lg">请先在「我的八字盘面」中完成排盘</p>
          <button
            @click="activeTab = 'bazi'"
            class="btn-cosmic-outline mt-4 text-sm"
          >
            📊 前往排盘
          </button>
        </div>

        <div v-else class="space-y-5">
          <!-- 五行雷达 + 运势仪表盘：桌面端并排，移动端堆叠 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="card-cosmic p-4">
              <h3 class="text-sm font-semibold text-cosmic-accent-light mb-2 text-center">
                🌀 五行能量分布
              </h3>
              <WuXingRadar :wuxing-data="wuxingData" height="280px" />
            </div>
            <div class="card-cosmic p-4">
              <h3 class="text-sm font-semibold text-cosmic-accent-light mb-2 text-center">
                📊 今日运势评分
              </h3>
              <FortuneGauge
                :score="fortuneScore"
                :label="scoreLabel || '参考'"
                height="280px"
              />
            </div>
          </div>

          <!-- 测算按钮 -->
          <FortuneButton
            :loading="fortuneLoading"
            :disabled="!baziComputed"
            @calculate="handleCalculateFortune"
          />

          <!-- AI 流式输出 -->
          <AiStreamOutput
            :text="streamedText"
            :is-streaming="fortuneStreaming"
            :error="fortuneError"
          />
        </div>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="text-center py-4 text-cosmic-muted text-xs border-t border-cosmic-border">
      <p>命理玄学 · 纯本地计算，数据不上传 · AI 解读由您配置的大模型提供</p>
      <p class="mt-1 opacity-60">八字排盘结果仅供娱乐参考，请理性看待，相信自己的人生由自己掌控 ✨</p>
    </footer>

    <!-- 配置弹窗 -->
    <ConfigModal
      :visible="configModalOpen"
      :api-config="apiConfig"
      @close="closeConfigModal"
      @save="saveApiConfig"
    />
  </div>
</template>
