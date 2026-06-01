<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { LiuyaoPan, YaoLine } from '@/utils/liuyao-engine'
import { calcLiuyao, shakeSixTimes } from '@/utils/liuyao-engine'
import { Icon } from '@iconify/vue'
import { GUACI_64 } from '@/constants/liuyao-dict'
import { GUA_JIXIONG } from '@/constants/liuyao-guaci'
import ExpandableInterpretation from '@/components/shared/ExpandableInterpretation.vue'

// ===== 状态 =====
const mode = ref<'quick' | 'manual'>('quick')
const pan = ref<LiuyaoPan | null>(null)
const manualStep = ref(0)
const manualCoins = ref<number[][]>([[], [], [], [], [], []])
const currentDisplay = ref<number[]>([0, 0, 0])  // ★ 当前展示的3枚铜钱
const shaking = ref(false)
const questionType = ref('综合')

// ★ 事业子表单
const careerStatus = ref('待业求职')
const careerIndustry = ref('体制内公务员')
// ★ 感情子表单
const marriageGoal = ref('单身求正缘')
const marriageGender = ref('男')

const questionTypes = [
  '综合', '事业求职', '感情缘分', '财运', '学业', '健康',
]

function doQuickGua(): void {
  pan.value = calcLiuyao(
    '甲', questionType.value, 'indoor', new Date().toISOString().slice(0, 10),
    marriageGender.value, marriageGoal.value, careerStatus.value,
  )
}

function shakeManual(): void {
  if (manualStep.value >= 6) return
  shaking.value = true
  // ★ 先清空当前显示为待机态（三个空心灰色），再延迟出结果
  currentDisplay.value = [0, 0, 0]
  setTimeout(() => {
    const s = shakeSixTimes()[manualStep.value]
    manualCoins.value = [...manualCoins.value]
    manualCoins.value[manualStep.value] = s
    currentDisplay.value = s
    manualStep.value++
    shaking.value = false
    // ★ 6次摇满自动排盘
    if (manualStep.value >= 6) {
      const allCoins = manualCoins.value as number[][]
      pan.value = calcLiuyao(
        '甲', questionType.value, 'indoor', new Date().toISOString().slice(0, 10),
        marriageGender.value, marriageGoal.value, careerStatus.value,
      )
    }
  }, 500)
}

function resetManual(): void {
  manualStep.value = 0
  manualCoins.value = [[], [], [], [], [], []]
  pan.value = null
}

/** 铜钱圆点：coin=2 → ○ 空心(阴)，coin=3 → ● 实心(阳) */
function coinSvg(coin: number): string {
  const isHead = coin === 3
  const brandColor = '#6c5ce7'
  const fill = isHead ? brandColor : 'none'
  const stroke = isHead ? brandColor : 'rgba(108,92,231,0.35)'
  const opacity = isHead ? '1' : '0.8'
  const glow = isHead ? `filter:drop-shadow(0 0 10px ${brandColor}99)` : ''
  const inner = isHead
    ? `<circle cx="22" cy="22" r="8" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.2" opacity="0.4"/>`
    : `<circle cx="22" cy="22" r="8" fill="none" stroke="rgba(108,92,231,0.15)" stroke-width="1" opacity="0.3"/>`
  return `<svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" style="${glow}">
    <circle cx="22" cy="22" r="16" fill="${fill}" stroke="${stroke}" stroke-width="2" opacity="${opacity}"/>
    ${inner}
    <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(108,92,231,0.08)" stroke-width="1" opacity="0.5"/>
  </svg>`
}
</script>

<template>
  <div class="space-y-5">
    <!-- 模式选择 -->
    <div class="flex gap-3 justify-center">
      <button @click="mode='quick'" :class="mode==='quick'?'btn-cosmic':'btn-cosmic-outline'" class="text-sm px-4 py-2">⚡ 一键成卦</button>
      <button @click="mode='manual'" :class="mode==='manual'?'btn-cosmic':'btn-cosmic-outline'" class="text-sm px-4 py-2">🎲 手动摇卦</button>
    </div>

    <!-- 问事类型 -->
    <div class="flex gap-2 justify-center flex-wrap">
      <button v-for="qt in questionTypes" :key="qt" @click="questionType=qt"
        :class="questionType===qt?'bg-purple-500/20 border-purple-400/40 text-purple-300':'bg-slate-800/50 border-slate-700/30 text-slate-400'"
        class="px-4 py-1.5 rounded-full text-xs border transition-all">{{ qt }}</button>
    </div>

    <!-- ★ 事业求职子表单 -->
    <div v-if="questionType === '事业求职'" class="p-3 rounded-xl bg-slate-900/40 border border-sky-500/20 space-y-2">
      <h4 class="text-xs font-medium text-sky-400">💼 职场现状</h4>
      <select v-model="careerStatus" class="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
        <option>待业求职</option>
        <option>在职求晋升</option>
        <option>想裸辞跳槽</option>
      </select>
      <h4 class="text-xs font-medium text-sky-400 mt-2">🏢 期望行业</h4>
      <select v-model="careerIndustry" class="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
        <option>体制内公务员</option>
        <option>互联网技术</option>
        <option>自由创业</option>
        <option>其他</option>
      </select>
      <p class="text-[10px] text-slate-500">用神：<span class="text-sky-400">官鬼爻（事业星）</span></p>
    </div>

    <!-- ★ 感情缘分子表单 -->
    <div v-if="questionType === '感情缘分'" class="p-3 rounded-xl bg-slate-900/40 border border-pink-500/20 space-y-2">
      <h4 class="text-xs font-medium text-pink-400">💕 情感现状</h4>
      <select v-model="marriageGoal" class="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
        <option>单身求正缘</option>
        <option>测现任是否正缘</option>
        <option>前任能否复合</option>
      </select>
      <h4 class="text-xs font-medium text-pink-400 mt-2">👤 您的性别</h4>
      <div class="flex gap-2">
        <button v-for="g in ['男','女']" :key="g" @click="marriageGender=g"
          :class="marriageGender===g?'bg-pink-500/20 border-pink-400/40 text-pink-300':'bg-slate-800 border-slate-700 text-slate-400'"
          class="px-4 py-1 rounded-full text-xs border">{{ g }}</button>
      </div>
      <p class="text-[10px] text-slate-500">用神：<span class="text-pink-400">{{ marriageGender === '男' ? '妻财爻（男测感情）' : '官鬼爻（女测感情）' }}</span></p>
    </div>

    <!-- 一键成卦 -->
    <div v-if="mode==='quick'" class="text-center">
      <button @click="doQuickGua" class="btn-cosmic text-lg px-8 py-3 rounded-xl">🔮 起卦</button>
    </div>

    <!-- 手动摇卦 -->
    <div v-if="mode==='manual'" class="text-center space-y-3">
      <div class="text-sm text-slate-400">第 {{ manualStep >= 6 ? 6 : manualStep + 1 }} / 6 爻</div>
      <div class="flex justify-center gap-4">
        <span v-for="(c, i) in currentDisplay" :key="i"
          class="transition-all duration-300 inline-block" :class="shaking ? 'animate-coin-shake' : ''"
          v-html="coinSvg(c)" />
      </div>
      <div>
        <button v-if="manualStep < 6" @click="shakeManual" :disabled="shaking" class="btn-cosmic px-6 py-2 inline-flex items-center gap-1"><Icon icon="mdi:hand-back-right" />摇</button>
        <button v-if="manualStep >= 6" @click="resetManual" class="btn-cosmic-outline px-4 py-2 text-sm mr-2 inline-flex items-center gap-1"><Icon icon="mdi:refresh" />重新</button>
      </div>
    </div>

    <!-- 排盘结果 -->
    <div v-if="pan" class="space-y-4 animate-fadeInUp">
      <!-- 卦象标题 -->
      <div class="text-center p-5 rounded-2xl bg-slate-900/40 border border-purple-500/20 backdrop-blur-lg">
        <div class="text-2xl mb-2">{{ pan.benGua.name }}</div>
        <div class="text-4xl font-bold mb-1">{{ BA_GUA_SYMBOL[pan.benGua.upper] || '' }}{{ BA_GUA_SYMBOL[pan.benGua.lower] || '' }}</div>
        <div class="text-sm" :class="GUA_JIXIONG[pan.benGua.name]?.level==='大吉'||GUA_JIXIONG[pan.benGua.name]?.level==='吉'?'text-yellow-400':GUA_JIXIONG[pan.benGua.name]?.level==='凶'?'text-red-400':'text-slate-400'">
          {{ GUA_JIXIONG[pan.benGua.name]?.summary || '' }}
        </div>
        <div v-if="pan.bianGua" class="mt-2 text-xs text-purple-400">
          变卦：{{ pan.bianGua.name }} {{ BA_GUA_SYMBOL[pan.bianGua.upper]||'' }}{{ BA_GUA_SYMBOL[pan.bianGua.lower]||'' }}
        </div>
        <div class="text-xs text-slate-500 mt-1">动爻：{{ pan.dongYaoCount }}个 | 世爻：第{{ pan.shiYao }}爻 | 用神：{{ pan.yongShen }} <span :class="pan.yongShenStrength==='旺相'?'text-green-400':pan.yongShenStrength==='休囚'?'text-red-400':'text-slate-400'">({{ pan.yongShenStrength }})</span> | 用神分：{{ pan.yongShenScore }} | 六神：{{ pan.liushouScore >= 0 ? '+' : '' }}{{ pan.liushouScore }}</div>
      </div>

      <!-- 六爻排列 -->
      <div class="p-4 rounded-2xl bg-slate-900/40 border border-purple-500/20 backdrop-blur-lg space-y-2">
        <div v-for="yao in [...pan.yaoList].reverse()" :key="yao.index"
          class="flex items-center gap-3 py-1.5 px-3 rounded-lg"
          :class="yao.index===pan.shiYao?'bg-purple-500/10 border-l-2 border-purple-400':yao.index===pan.yingYao?'bg-amber-500/5 border-l-2 border-amber-400':''">
          <span class="text-xs text-slate-500 w-8">第{{ yao.index }}爻</span>
          <span class="text-xs font-mono" :class="yao.isDong?'text-yellow-400':''">{{ yao.original }}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{{ yao.dizhi }}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800" :class="yao.liuqin==='妻财'?'text-green-400':yao.liuqin==='官鬼'?'text-red-400':yao.liuqin==='子孙'?'text-blue-400':yao.liuqin==='兄弟'?'text-yellow-400':'text-purple-400'">{{ yao.liuqin }}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800"
            :class="yao.liushou==='青龙'?'text-green-400':yao.liushou==='朱雀'?'text-red-400':yao.liushou==='白虎'?'text-gray-300':yao.liushou==='玄武'?'text-blue-400':'text-yellow-400'">{{ yao.liushou }}</span>
          <span v-if="yao.index===pan.shiYao" class="text-[10px] text-purple-400 font-bold">世</span>
          <span v-if="yao.index===pan.yingYao" class="text-[10px] text-amber-400 font-bold">应</span>
        </div>
      </div>

      <!-- ═══ 第一板块：核心推演（AI 实时） ═══ -->
      <div class="p-4 rounded-2xl border-2 backdrop-blur-lg space-y-3 relative"
        :class="pan.duanYu.level==='大吉'?'border-amber-400/50 bg-amber-500/5 shadow-[0_0_20px_rgba(251,191,36,0.12)]':pan.duanYu.level==='吉'?'border-emerald-400/50 bg-emerald-500/5 shadow-[0_0_20px_rgba(52,211,153,0.12)]':pan.duanYu.level==='凶'?'border-red-400/50 bg-red-500/5 shadow-[0_0_20px_rgba(248,113,113,0.12)]':'border-purple-400/50 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.12)]'">
        <!-- 核心标识 -->
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse" />
            <span class="text-xs font-bold text-amber-300 tracking-wider">⚖ 核心推演</span>
          </div>
          <span class="text-[9px] px-2 py-0.5 rounded-full border bg-amber-500/20 text-amber-400 border-amber-500/30 font-medium">AI 实时推演</span>
        </div>

        <!-- 断语内容 -->
        <ExpandableInterpretation
          type="result"
          title="卦理断语"
          :classicalText="pan.duanYu.classicalText"
          :modernInterpretation="pan.duanYu.modernInterpretation"
          :professionalAdvice="pan.duanYu.professionalAdvice"
        />

        <!-- 专项断语（若有） -->
        <div v-if="pan.specialAdvice" class="p-3 rounded-lg bg-sky-500/5 border border-sky-500/20 mt-2">
          <p class="text-xs text-slate-300 leading-relaxed">{{ pan.specialAdvice }}</p>
        </div>
      </div>

      <!-- ═══ 第二板块：卦辞原文（解释支撑） ═══ -->
      <ExpandableInterpretation
        type="reference"
        title="卦辞（《周易》原文）"
        :classicalText="pan.benGua.guaCi"
        :modernInterpretation="pan.benGua.baiHua"
        professionalAdvice=""
      />

      <!-- ═══ 第三板块：卦理依据 / 知识库（折叠参考资料） ═══ -->
      <ExpandableInterpretation
        type="reference"
        v-if="pan.source"
        title='卦理依据（《增删卜易》）'
        :classicalText="pan.source"
        :modernInterpretation="pan.duanYu.modernInterpretation"
        :professionalAdvice="pan.duanYu.professionalAdvice"
      />

      <!-- ★ 求职应期 -->
      <div v-if="pan.careerTiming && questionType === '事业求职'" class="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-lg">
        <h4 class="text-sm font-semibold text-emerald-400 mb-2">📅 求职应期 · 《增删卜易》</h4>
        <p class="text-xs text-slate-300 leading-relaxed">{{ pan.careerTiming }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
const BA_GUA_SYMBOL: Record<string, string> = {
  '乾':'☰','兑':'☱','离':'☲','震':'☳','巽':'☴','坎':'☵','艮':'☶','坤':'☷',
}
</script>
