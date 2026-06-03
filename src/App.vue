<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useBaziStore } from '@/stores/useBaziStore'
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

const baziStore = useBaziStore()
const { baziData: baziChart, baziError, baziComputed, yunData, wuxingData } = storeToRefs(baziStore)
const { result: fortuneResult, computed: fortuneComputed, error: fortuneError, calculate: calcFortune } = useFortune()

onMounted(() => {
  baziStore.init()
})

const fortuneScore = computed(() => (fortuneResult as any)?.fortune?.energy ?? 50)
const scoreLabel = computed(() => (fortuneResult as any)?.fortune?.theme ?? '')
const activeShensha = computed(() =>
  baziChart.value?.pillars.flatMap((p: any) =>
    p.shenSha.map((s: any) => ({ ...s, rarity: s.rarity || '10%' })),
  ) || [],
)
const allShenSha = computed(() => {
  if (!baziChart.value) return {}
  return baziChart.value.pillars.reduce((acc: any, p: any, i: number) => {
    acc[i] = p.shenSha
    return acc
  }, {})
})

function handleCalculateFortune(): void {
  if (!baziChart.value) return
  calcFortune(baziChart.value, wuxingData.value)
}
</script>

<template>
  <div class="star-bg min-h-screen flex flex-col relative" style="background: radial-gradient(ellipse at center, #0f172a 0%, #000000 100%);">
    <!-- 六芒星背景 -->
    <HexagramBg />

    <AppHeader />
    <AppTabs v-model:active-tab="activeTab" />

    <main class="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full space-y-5 md:space-y-6 relative z-10">
      <!-- ===== Tab 1: 我的八字盘面 ===== -->
      <div v-if="activeTab === 'bazi'">
        <BirthForm />
        <div v-if="baziError" class="card-cosmic p-4 text-center mt-4"><p class="text-cosmic-danger text-sm">{{ baziError }}</p></div>
        <div v-if="baziComputed && baziChart" class="space-y-5 mt-4">
          <div class="text-center">
            <span class="inline-flex items-center gap-2 px-5 py-2 rounded-xl backdrop-blur-md transition-all duration-300"
              :style="{ background: 'rgba(18,18,42,0.85)', border: '0.5px solid rgba(129,140,248,0.2)', boxShadow: '0 0 20px rgba(129,140,248,0.06)' }">
              <span class="text-xs font-extralight tracking-widest" style="color:#818cf8">日主</span>
              <span class="text-xl font-extralight tracking-widest" style="background:linear-gradient(135deg,#818cf8,#2dd4bf);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">{{ baziChart.dayMaster }}</span>
              <span class="text-xs font-extralight tracking-wider" style="color:rgba(129,140,248,0.35)">(命主本人)</span>
            </span>
          </div>
          <PillarGrid :pillars="baziChart.pillars" />
          <!-- ★ 稀有神煞 + 六维图谱 ★ -->
          <ShenShaChart :active-shensha="activeShensha" />
          <!-- ★ 神煞Bento Grid ★ -->
          <ShenShaBentoGrid :all-shen-sha="allShenSha" />
          <div class="flex justify-center gap-4 text-xs text-slate-500">
            <span>胎元：{{ baziChart.taiYuan }}</span><span>命宫：{{ baziChart.mingGong }}</span><span>身宫：{{ baziChart.shenGong }}</span>
          </div>
          <DaYunTimeline :da-yun-result="yunData" />
        </div>
        <div v-if="!baziComputed && !baziError" class="backdrop-blur-sm p-8 text-center mt-4" :style="{background:'rgba(255,255,255,0.015)',border:'0.5px solid rgba(255,255,255,0.06)'}">
          <p class="text-white/30 font-light tracking-wider">请选择出生信息，系统将自动排盘</p>
        </div>
      </div>

      <!-- ===== Tab 2: 今日运势指南 ===== -->
      <div v-if="activeTab === 'fortune'">
        <div v-if="!baziComputed || !baziChart" class="backdrop-blur-sm p-8 text-center" :style="{background:'rgba(255,255,255,0.015)',border:'0.5px solid rgba(255,255,255,0.06)'}">
          <p class="text-white/30 font-light tracking-wider">请先在「我的八字盘面」中完成排盘</p>
          <button @click="activeTab = 'bazi'" class="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors outline-none tracking-wider">前往排盘</button>
        </div>
        <div v-else class="space-y-5">
          <!-- ★ fortune仪表盘 ★ -->
          <template v-if="fortuneComputed && fortuneResult">
            <FortuneDashboard :fortune="fortuneResult.fortune" :today-ten-god="fortuneResult.todayTenGod" :dim-scores="fortuneResult.dimScores" :dim-explanations="fortuneResult.dimExplanations" />
          </template>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="backdrop-blur-lg bg-slate-900/40 border border-purple-500/20 rounded-2xl p-4">
              <h3 class="text-sm font-semibold text-purple-300 mb-2 text-center"><svg viewBox="0 0 16 16" class="w-4 h-4 inline text-white/30 align-middle mr-1" fill="none" stroke="currentColor" stroke-width="1"><circle cx="8" cy="8" r="5"/><path d="M8 3v2M8 11v2M3 8h2M11 8h2"/></svg> 五行能量分布</h3>
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

    <footer class="relative z-10 text-center py-4 text-white/20 text-xs" style="border-top:0.5px solid rgba(255,255,255,0.04)">
      <p class="font-extralight tracking-wider">爻知方寸 · 纯本地计算 · 数据不上传 · 完全离线可用</p>
      <p class="mt-1 opacity-40 font-extralight text-[10px] tracking-wider">八字排盘与运势测算仅供娱乐参考 · 相信自己的人生由自己掌控</p>
    </footer>
  </div>
</template>
