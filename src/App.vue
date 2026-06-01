<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBazi } from '@/composables/useBazi'
import { useFortune } from '@/composables/useFortune'

import HexagramBg from '@/components/shared/HexagramBg.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppTabs from '@/components/layout/AppTabs.vue'
import BirthForm from '@/components/bazi/BirthForm.vue'
import PillarGrid from '@/components/bazi/PillarGrid.vue'
import ShenShaBentoGrid from '@/components/bazi/ShenShaBentoGrid.vue'
import ShenShaChart from '@/components/bazi/ShenShaChart.vue'
import DaYunTimeline from '@/components/bazi/DaYunTimeline.vue'
import WuXingRadar from '@/components/fortune/WuXingRadar.vue'
import FortuneDashboard from '@/components/fortune/FortuneDashboard.vue'
import FortuneButton from '@/components/fortune/FortuneButton.vue'
import FortuneReport from '@/components/fortune/FortuneReport.vue'
import LiuyaoPan from '@/components/liuyao/LiuyaoPan.vue'
import SearchLostItem from '@/pages/SearchLostItem.vue'

const activeTab = ref<'bazi' | 'fortune' | 'liuyao' | 'search'>('bazi')

const { birthInfo, baziData: baziChart, baziError, baziComputed, yunData, wuxingData, updateBirthInfo } = useBazi()
const { result: fortuneResult, computed: fortuneComputed, error: fortuneError, calculate: calcFortune } = useFortune()

const fortuneScore = computed(() => (fortuneResult as any)?.fortune?.energy ?? 50)
const scoreLabel = computed(() => (fortuneResult as any)?.fortune?.theme ?? '')

function handleCalculateFortune(): void {
  if (!baziChart.value) return
  calcFortune(baziChart.value, wuxingData.value)
}
</script>

<template>
  <div class="star-bg min-h-screen flex flex-col relative">
    <!-- 六芒星背景 -->
    <HexagramBg />

    <AppHeader />
    <AppTabs v-model:active-tab="activeTab" />

    <main class="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full space-y-5 md:space-y-6 relative z-10">
      <!-- ===== Tab 1: 我的八字盘面 ===== -->
      <div v-if="activeTab === 'bazi'">
        <BirthForm :birth-info="birthInfo" @update:birth-info="(info: any) => { for (const key of Object.keys(info) as any[]) updateBirthInfo(key, info[key]) }" />
        <div v-if="baziError" class="card-cosmic p-4 text-center mt-4"><p class="text-cosmic-danger text-sm">{{ baziError }}</p></div>
        <div v-if="baziComputed && baziChart" class="space-y-5 mt-4">
          <div class="text-center">
            <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
              <span class="text-sm text-slate-400">日主</span>
              <span class="text-xl font-bold text-purple-300">{{ baziChart.dayMaster }}</span>
              <span class="text-xs text-slate-500">(命主本人)</span>
            </span>
          </div>
          <PillarGrid :pillars="baziChart.pillars" />
          <!-- ★ 稀有神煞 + 六维图谱 ★ -->
          <ShenShaChart :active-shensha="baziChart.pillars.flatMap((p: any) => p.shenSha.map((s: any) => ({ ...s, rarity: s.rarity || '10%' })))" />
          <!-- ★ 神煞Bento Grid ★ -->
          <ShenShaBentoGrid :all-shen-sha="baziChart.pillars.reduce((acc: any, p: any, i: number) => { acc[i] = p.shenSha; return acc }, {})" />
          <div class="flex justify-center gap-4 text-xs text-slate-500">
            <span>胎元：{{ baziChart.taiYuan }}</span><span>命宫：{{ baziChart.mingGong }}</span><span>身宫：{{ baziChart.shenGong }}</span>
          </div>
          <DaYunTimeline :da-yun-result="yunData" />
        </div>
        <div v-if="!baziComputed && !baziError" class="backdrop-blur-lg bg-slate-900/40 border border-purple-500/20 rounded-2xl p-8 text-center mt-4">
          <span class="text-5xl block mb-4">☯</span>
          <p class="text-slate-400 text-lg">请选择出生信息，系统将自动排盘</p>
        </div>
      </div>

      <!-- ===== Tab 2: 今日运势指南 ===== -->
      <div v-if="activeTab === 'fortune'">
        <div v-if="!baziComputed || !baziChart" class="backdrop-blur-lg bg-slate-900/40 border border-purple-500/20 rounded-2xl p-8 text-center">
          <span class="text-5xl block mb-4">🔮</span>
          <p class="text-slate-400 text-lg">请先在「我的八字盘面」中完成排盘</p>
          <button @click="activeTab = 'bazi'" class="btn-cosmic-outline mt-4 text-sm">📊 前往排盘</button>
        </div>
        <div v-else class="space-y-5">
          <!-- ★ fortune仪表盘 ★ -->
          <template v-if="fortuneComputed && fortuneResult">
            <FortuneDashboard :fortune="fortuneResult.fortune" :today-ten-god="fortuneResult.todayTenGod" :dim-scores="fortuneResult.dimScores" :dim-explanations="fortuneResult.dimExplanations" />
          </template>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="backdrop-blur-lg bg-slate-900/40 border border-purple-500/20 rounded-2xl p-4">
              <h3 class="text-sm font-semibold text-purple-300 mb-2 text-center">🌀 五行能量分布</h3>
              <WuXingRadar :wuxing-data="wuxingData" height="280px" />
            </div>
            <div class="backdrop-blur-lg bg-slate-900/40 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-center">
              <p class="text-slate-500 text-sm">点击下方按钮测算今日运势</p>
            </div>
          </div>
          <FortuneButton :loading="false" :disabled="false" @calculate="handleCalculateFortune" />
          <FortuneReport v-if="fortuneComputed && fortuneResult" :result="fortuneResult" />
          <div v-if="fortuneError" class="card-cosmic p-4 text-center"><p class="text-cosmic-danger text-sm">{{ fortuneError }}</p></div>
        </div>
      </div>

      <!-- ===== Tab 3: 六爻占卜 ===== -->
      <div v-if="activeTab === 'liuyao'">
        <LiuyaoPan />
      </div>

      <!-- ===== Tab 4: 六爻寻物 ===== -->
      <div v-if="activeTab === 'search'">
        <SearchLostItem />
      </div>
    </main>

    <footer class="relative z-10 text-center py-4 text-slate-500 text-xs border-t border-purple-500/10">
      <p>爻知方寸 · 纯本地计算 · 数据不上传 · 完全离线可用</p>
      <p class="mt-1 opacity-60">八字排盘与运势测算仅供娱乐参考 · 相信自己的人生由自己掌控 ✨</p>
    </footer>
  </div>
</template>
