<script setup lang="ts">
import { ref, computed } from 'vue'
import { calcLiuyao, shakeSixTimes, matchEnvironmentalLogic, type LiuyaoPan, type YaoLine } from '@/utils/liuyao-engine'
import { getTodayDailyPillar } from '@/utils/daily-pillar'
import ExpandableInterpretation from '@/components/shared/ExpandableInterpretation.vue'
import { GUA_JIXIONG } from '@/constants/liuyao-guaci'

// ===== 时空背景 =====
const dailyPillar = getTodayDailyPillar()
const env = {
  ganZhi: dailyPillar.ganZhi,
  lunarMonth: dailyPillar.lunarMonth,
  lunarDay: dailyPillar.lunarDay,
}

// ===== 测算目的 =====
const purpose = ref<'item' | 'person'>('item')

// ===== 寻物 =====
const lostTypes = ['数码电器', '金银首饰', '证件公文', '宠物', '钥匙', '交通工具', '服饰包包']
const selectedType = ref('数码电器')
const lostDate = ref(new Date().toISOString().slice(0, 10))
const lostScene = ref('indoor')
const envDesc = ref('')
const lostRange = ref('3天内')
const ranges = ['3天内', '一周内', '一月内', '超一个月']

// ===== 寻人 =====
const personRelation = ref('老人/小孩')
const personRelations = ['老人/小孩', '朋友/同事', '离家亲人']
const personDate = ref(new Date().toISOString().slice(0, 10))

// ===== 用神映射（按《增删卜易》） =====
const itemYongShenMap: Record<string, string> = {
  '数码电器': '子孙', '金银首饰': '妻财', '证件公文': '父母',
  '宠物': '子孙', '钥匙': '父母', '交通工具': '父母', '服饰包包': '妻财',
}
/**
 * 寻人用神映射（《增删卜易》原文）：
 *   老人/小孩 → 父母爻/子孙爻（"凡占走失，以父母或子孙为用"）
 *   朋友/同事 → 兄弟爻（"凡占朋友，以兄弟为用"）
 *   离家亲人  → 应爻（"凡占外来之人，以应爻为用"）
 */
const personYongShenMap: Record<string, string> = {
  '老人/小孩': '父母', '朋友/同事': '兄弟', '离家亲人': '应',
}

// ===== 状态 =====
const pan = ref<LiuyaoPan | null>(null)
const loading = ref(false)
const showEvidence = ref(false)

const yongShenLabel = computed(() => {
  if (purpose.value === 'item') return itemYongShenMap[selectedType.value] || '父母'
  return personYongShenMap[personRelation.value] || '父母'
})

const goldCeMessage = computed(() => {
  const m: Record<string, string> = {
    '子孙': '《黄金策》云："凡占走失、六畜、子女，以子孙为用神。子孙发动，走失易寻。"',
    '妻财': '《黄金策》云："凡占财帛、珠玉，以妻财为用神。妻财旺相，财不失。"',
    '父母': '《黄金策》云："凡占宅舍、文书、车船，以父母为用神。父母安静，物未损。"',
    '兄弟': '《增删卜易》云："凡占朋友、同事，以兄弟为用神。兄动则其人已在路上。"',
    '应':   '《增删卜易》云："凡占外来之人，以应爻为用。应爻旺相，其人已在近处。"',
  }
  return m[yongShenLabel.value] || ''
})

// ===== 寻人归期推演（基于动爻应期） =====
function calcPersonReturnTiming(yaoList: YaoLine[]): string {
  const dongYao = yaoList.filter(y => y.isDong)
  if (dongYao.length === 0) return '卦爻安静，归期未定，宜静候勿焦。'
  const dz = dongYao[0].dizhi
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
  const now = new Date()
  const todayIdx = branches.indexOf(getTodayDailyPillar().zhi)
  const targetIdx = branches.indexOf(dz)
  const daysToAdd = ((targetIdx - todayIdx + 12) % 12) || 12
  const near = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd)
  const far =  daysToAdd <= 6 ? '近期（1-2周）' : '较远（1个月左右）'
  return `动爻在${dz}位，值${dz}日应，预计${far}（${near.getMonth()+1}月${near.getDate()}日前后）。《增删卜易》云：动而值日，行人将至。`
}

// ===== 被合/逢冲/官鬼持世判定 =====
function calcPersonState(yaoList: YaoLine[]): string[] {
  const lines: string[] = []
  const dongYao = yaoList.filter(y => y.isDong)
  const shiYao = yaoList.find(y => y.index === pan.value!.shiYao)
  for (const dy of dongYao) {
    // 六合判定
    for (const [a,b] of [['子','丑'],['寅','亥'],['卯','戌'],['辰','酉'],['巳','申'],['午','未']] as [string,string][]) {
      if (dy.dizhi === a || dy.dizhi === b) lines.push('⚠ 用神被合：对方目前被事绊住或处于某种牵制中。《增删卜易》云：合则留。')
      break
    }
    // 六冲判定
    for (const [a,b] of [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']] as [string,string][]) {
      if (dy.dizhi === a || dy.dizhi === b) lines.push('📦 用神逢冲：对方正在移动中或即将归来。《增删卜易》云：冲则动。')
      break
    }
  }
  if (shiYao && shiYao.liuqin === '官鬼') lines.push('🔴 官鬼持世：对方处境不安，请注意安全。《增删卜易》云：官鬼持世，忧在心。')
  return lines
}

// ===== 卦理环境校验 =====
const envResult = ref<{ confidenceScore: number; advice: string } | null>(null)

// ===== 起卦 =====
function doGua() {
  loading.value = true
  setTimeout(() => {
    const newPan = calcLiuyao(
      '甲',
      purpose.value === 'item' ? `寻物-${selectedType.value}` : '寻物-宠物',
      lostScene.value,
      purpose.value === 'item' ? lostDate.value : personDate.value,
      '男', '单身求正缘', '待业',
    )
    pan.value = newPan

    // 环境交叉校验（寻物时）
    if (purpose.value === 'item' && newPan) {
      envResult.value = matchEnvironmentalLogic(
        newPan.yaoList,
        newPan.yongShen,
        { gong: newPan.benGua.gong, name: newPan.benGua.name },
        envDesc.value,
        lostScene.value as 'indoor' | 'office' | 'outdoor',
      )
    }

    loading.value = false
  }, 400)
}

// ===== 八卦符号表 =====
const BA_GUA_SYMBOL: Record<string, string> = {
  '乾':'☰','兑':'☱','离':'☲','震':'☳','巽':'☴','坎':'☵','艮':'☶','坤':'☷',
}
function getDirectionHint(liushou: string, gong: string): string {
  const liuShouDirection: Record<string, string> = {
    '青龙': '东方（林木、水边、公文堆）', '朱雀': '南方（电器、灯光、火源附近）',
    '勾陈': '中央（房梁、桌面、正中间）', '螣蛇': '东南（角落、暗处、柜顶）',
    '白虎': '西方（金属、铁器、工具间）', '玄武': '北方（阴暗处、水边、洗手间）',
  }
  return liuShouDirection[liushou] || '不详'
}
</script>

<template>
  <div class="w-full space-y-5">
    <!-- 时空背景 -->
    <div class="p-4 rounded-2xl bg-slate-900/40 border border-purple-500/20 backdrop-blur-lg text-xs text-slate-400 flex flex-wrap gap-4">
      <span>📅 今日干支：{{ env.ganZhi }}</span>
      <span>🌙 农历：{{ env.lunarMonth }}月{{ env.lunarDay }}</span>
    </div>

    <!-- 测算目的切换 -->
    <div class="flex gap-3 justify-center">
      <button @click="purpose='item'" :class="purpose==='item'?'btn-cosmic':'btn-cosmic-outline'" class="text-sm px-4 py-2">🔍 寻物</button>
      <button @click="purpose='person'" :class="purpose==='person'?'btn-cosmic':'btn-cosmic-outline'" class="text-sm px-4 py-2">👤 寻人</button>
    </div>

    <!-- 寻物表单 -->
    <div v-if="purpose==='item'" class="p-4 rounded-2xl bg-slate-900/40 border border-amber-500/20 space-y-3">
      <h3 class="text-sm font-semibold text-amber-400">🔍 寻物信息</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="text-[10px] text-slate-500">物品类型</label>
          <select v-model="selectedType" class="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <option v-for="t in lostTypes" :key="t">{{ t }}</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] text-slate-500">丢失日期</label>
          <input v-model="lostDate" type="date" class="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300" />
        </div>
        <div>
          <label class="text-[10px] text-slate-500">丢失时长</label>
          <select v-model="lostRange" class="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <option v-for="r in ranges" :key="r">{{ r }}</option>
          </select>
        </div>
      </div>
      <div>
        <label class="text-[10px] text-slate-500">环境描述（可选）</label>
        <input v-model="envDesc" placeholder="办公室、咖啡厅、小区公园…" class="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300" />
      </div>
      <div class="text-[10px] text-amber-500">用神：<strong>{{ yongShenLabel }}</strong>（{{ yongShenLabel === '子孙' ? '饰品/电子/宠物' : yongShenLabel === '妻财' ? '金银/钱物' : '证件/钥匙/包' }}）</div>
      <div class="text-[10px] text-purple-400 italic">{{ goldCeMessage }}</div>
    </div>

    <!-- 寻人表单 -->
    <div v-if="purpose==='person'" class="p-4 rounded-2xl bg-slate-900/40 border border-sky-500/20 space-y-3">
      <h3 class="text-sm font-semibold text-sky-400">👤 寻人信息</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="text-[10px] text-slate-500">对方身份/关系</label>
          <select v-model="personRelation" class="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <option v-for="r in personRelations" :key="r">{{ r }}</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] text-slate-500">最后联系/走失日期</label>
          <input v-model="personDate" type="date" class="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300" />
        </div>
      </div>
      <div class="text-[10px] text-sky-400">用神：<strong>{{ yongShenLabel }}</strong>（{{ yongShenLabel === '父母' ? '老人/小孩' : yongShenLabel === '兄弟' ? '朋友/同事' : '离家亲人→应爻' }}）</div>
      <div class="text-[10px] text-sky-400 italic">{{ goldCeMessage }}</div>
    </div>

    <!-- 起卦 -->
    <div class="text-center">
      <button @click="doGua" :disabled="loading" class="btn-cosmic text-lg px-8 py-3 rounded-xl">
        {{ loading ? '🔮 推演中...' : '☰ 起卦' }}
      </button>
    </div>

    <!-- 结果 -->
    <div v-if="pan" class="space-y-4">

      <!-- ═══ 模块 A：卦象独立卡片（与模块B同宽、同边框） ═══ -->
      <div class="result-card-highlight text-center"
        :class="pan.duanYu.level==='大吉'||pan.duanYu.level==='吉'?'border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.12)]':pan.duanYu.level==='凶'?'border-red-400/50 shadow-[0_0_20px_rgba(248,113,113,0.12)]':'border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.12)]'">
        <div class="text-3xl mb-2">{{ BA_GUA_SYMBOL[pan.benGua.upper] || '' }}{{ BA_GUA_SYMBOL[pan.benGua.lower] || '' }}</div>
        <div class="text-xl font-bold text-purple-200 mb-1">{{ pan.benGua.name }}</div>
        <div class="text-sm" :class="GUA_JIXIONG[pan.benGua.name]?.level==='大吉'||GUA_JIXIONG[pan.benGua.name]?.level==='吉'?'text-yellow-400':'text-slate-400'">
          {{ GUA_JIXIONG[pan.benGua.name]?.summary || '' }}
        </div>
        <div v-if="pan.bianGua" class="mt-1 text-xs text-purple-400">变卦：{{ pan.bianGua.name }}</div>
        <div class="mt-3 flex justify-center gap-4 text-[10px] text-slate-500">
          <span>动爻：{{ pan.dongYaoCount }}个</span>
          <span>用神：{{ pan.yongShen }}（<span :class="pan.yongShenStrength==='旺相'?'text-green-400':pan.yongShenStrength==='休囚'?'text-red-400':'text-amber-400'">{{ pan.yongShenStrength }}</span>）</span>
          <span>分：{{ pan.yongShenScore }}</span>
        </div>
      </div>

      <!-- ═══ 模块 B：寻物推演卡片（同上边框宽、左右对齐） ═══ -->
      <div class="result-card-highlight"
        :class="pan.duanYu.level==='大吉'||pan.duanYu.level==='吉'?'border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.12)]':pan.duanYu.level==='凶'?'border-red-400/50 shadow-[0_0_20px_rgba(248,113,113,0.12)]':'border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.12)]'">
        <div class="flex items-center gap-2 mb-3">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
          <span class="text-xs font-bold text-amber-300">📌 寻物推演</span>
        </div>

        <div v-if="purpose==='item'" class="space-y-1.5">
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-500">方向：</span>
            <span class="text-slate-200 font-medium">{{ getDirectionHint(pan!.yaoList.find(y => y.liuqin === pan!.yongShen)?.liushou || '', pan!.benGua.gong) }}</span>
          </div>
          <div v-if="envResult" class="flex items-center gap-2 text-xs">
            <span class="text-slate-500">环境匹配：</span>
            <span class="text-slate-200">{{ envResult.confidenceScore >= 60 ? '✅ 较高' : envResult.confidenceScore >= 30 ? '⚠ 一般' : '❓ 较低' }}</span>
            <span class="text-[10px] text-slate-500">({{ envResult.confidenceScore }}%)</span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-500">难度：</span>
            <span :class="pan.duanYu.level==='大吉'||pan.duanYu.level==='吉'?'text-emerald-400':'text-amber-400'">{{ pan.duanYu.level==='大吉'||pan.duanYu.level==='吉' ? '较易找到' : '有一定难度' }}</span>
          </div>
          <div v-if="envResult" class="mt-2 p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <p class="text-xs text-slate-300 leading-relaxed">{{ envResult.advice }}</p>
          </div>
        </div>

        <div v-if="purpose==='person'" class="space-y-1.5">
          <div class="text-xs text-sky-300 leading-relaxed">{{ calcPersonReturnTiming(pan!.yaoList) }}</div>
          <div v-for="(msg, i) in calcPersonState(pan!.yaoList)" :key="i" class="text-xs text-slate-300 leading-relaxed">{{ msg }}</div>
        </div>
      </div>

      <!-- ═══ 第三层：推演依据 ═══ -->
      <div class="result-card">
        <div
          @click="showEvidence = !showEvidence"
          class="flex items-center justify-between cursor-pointer select-none hover:opacity-80"
        >
          <span class="text-xs font-medium text-slate-400">🔬 推演依据（卦理 + 规则）</span>
          <span class="text-[10px] text-slate-500 transition-transform" :class="showEvidence ? 'rotate-180' : ''">▼</span>
        </div>
        <div
          class="overflow-hidden transition-all duration-400 ease-in-out"
          :style="{ maxHeight: showEvidence ? '1200px' : '0px', opacity: showEvidence ? 1 : 0 }"
        >
          <div class="mt-3 pt-3 space-y-3 border-t border-slate-700/30">
            <ExpandableInterpretation type="result" title="卦理断语" :classicalText="pan.duanYu.classicalText" :modernInterpretation="pan.duanYu.modernInterpretation" :professionalAdvice="pan.duanYu.professionalAdvice" />
            <div v-if="pan.specialAdvice" class="p-3 rounded-lg bg-sky-500/5 border border-sky-500/20">
              <p class="text-xs text-slate-300 leading-relaxed">{{ pan.specialAdvice }}</p>
            </div>
            <ExpandableInterpretation type="reference" title="卦辞（《周易》原文）" :classicalText="pan.benGua.guaCi" :modernInterpretation="pan.benGua.baiHua" professionalAdvice="" />
            <ExpandableInterpretation type="reference" v-if="pan.source" title="卦理依据（《增删卜易》）" :classicalText="pan.source" :modernInterpretation="pan.duanYu.modernInterpretation" :professionalAdvice="pan.duanYu.professionalAdvice" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
