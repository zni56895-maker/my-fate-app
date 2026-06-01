<script setup lang="ts">
import { computed, ref } from 'vue'
import { calcInteractEffects, calcTransformEffects } from '@/utils/classicRules'

// ===== 测测 App 官方启用的 56 个标准神煞白名单 =====
const CECE_WHITELIST = new Set([
  "天乙贵人","天德贵人","文昌贵人","月德贵人",
  "驿马","将星","金舆","禄神",
  "词馆","学堂","国印","太极贵人",
  "天德合","月德合","德秀贵人","天医",
  "五行正印","红鸾","天喜","三奇贵人",
  "福星贵人","十灵日","天赦日","拱禄",
  "六秀日","桃花","华盖","劫煞",
  "亡神","魁罡","金神","羊刃",
  "灾煞","孤辰","寡宿","红艳",
  "流霞","元辰","六厄","空亡",
  "阴差阳错","天罗地网","勾绞","十恶大败",
  "童子","孤鸾","飞刃","血刃",
  "八专","九丑","四废日","天转",
  "地转","丧门","吊客","披麻",
  // 引擎别名兼容
  "国印贵人","金舆贵人","天医贵人","天赦","魁罡贵人","红艳煞","流霞煞",
  "勾绞煞","披麻煞","阴阳差错","四废",
])

// 引擎旧名 → 白名单标准名
const NAME_MAP: Record<string, string> = {
  '国印贵人':'国印','金舆贵人':'金舆','天医贵人':'天医','天赦':'天赦日',
  '咸池桃花':'桃花','红艳煞':'红艳','魁罡贵人':'魁罡','流霞煞':'流霞',
  '勾绞煞':'勾绞','披麻煞':'披麻','阴阳差错':'阴差阳错','四废':'四废日',
}

interface ShenShaItem {
  name: string; type?: string; desc?: string; rarity?: string; tag?: string; meaning?: string
  pillar?: number; jiXiong?: string
}

const props = defineProps<{ activeShensha: ShenShaItem[] }>()

// ===== 顶级贵人白名单（仅展示最核心的神煞） =====
const TOP_TIER = new Set([
  '天乙贵人','天德贵人','月德贵人','天德合','月德合','太极贵人','三奇贵人',
  '天赦','天赦日','天医','天医贵人','文昌贵人','十灵日','福星贵人',
  '禄神','金舆','金舆贵人','国印','国印贵人','五行正印','天官贵人',
  '将星','金神','红鸾','天喜','天作之合','魁罡','魁罡贵人',
  '华盖','德秀贵人',
])

/** 神煞能量权重（用于排序） */
const SHENSHA_POWER: Record<string, number> = {
  '三奇贵人': 100, '天赦': 98, '天赦日': 98, '天德合': 95, '天乙贵人': 90,
  '天德贵人': 85, '月德合': 82, '月德贵人': 80, '太极贵人': 78, '福星贵人': 76,
  '十灵日': 74, '天医': 72, '天医贵人': 72, '金神': 70, '文昌贵人': 68,
  '禄神': 66, '五行正印': 64, '金舆': 62, '金舆贵人': 62, '国印': 60,
  '国印贵人': 60, '天官贵人': 58, '将星': 56, '德秀贵人': 54, '华盖': 52,
  '红鸾': 50, '天喜': 48, '天作之合': 46, '魁罡': 44, '魁罡贵人': 44,
}

// ===== 展示数据：过滤 → 排序 → 截取前3 =====
const displayShensha = computed(() => {
  const seen = new Set<string>()
  return props.activeShensha
    .filter(s => {
      const name = s.name.replace('🔥', '')
      if (!TOP_TIER.has(name)) return false
      if (seen.has(name)) return false
      seen.add(name)
      return true
    })
    .sort((a, b) => (SHENSHA_POWER[b.name] || 0) - (SHENSHA_POWER[a.name] || 0))
    .slice(0, 3)
})

const showAll = ref(false)

/** 神煞简评 */
function getBrief(name: string): string {
  const m: Record<string, string> = {
    '天乙贵人':'遇难成祥，关键时刻总有援手',
    '天德贵人':'上天庇佑，吉星护体',
    '月德贵人':'温柔有力量，人际关系和顺',
    '天德合':'贵人运加倍，福运叠加',
    '月德合':'人际和谐度翻倍',
    '太极贵人':'慧根深种，洞察天机',
    '三奇贵人':'绝世才华，天赋异禀',
    '天赦':'逢凶化吉，万厄不侵',
    '天医':'疗愈者之星，救助他人天赋',
    '文昌贵人':'文曲下凡，学贯中西',
    '十灵日':'清灵之气，卓尔不群',
    '福星贵人':'福星高照，岁月静好',
    '禄神':'禄位高悬，衣食无忧',
    '金舆贵人':'富贵双全，价值眼光独到',
    '国印贵人':'印信在手，权柄在握',
    '将星':'将星坐镇，统领群英',
  }
  return m[name] || '核心命格神煞'
}

// ===== 稀有神煞（< 5%）先去重 =====
const rareShensha = computed(() => {
  const seen = new Set<string>()
  return props.activeShensha.filter(s => {
    const r = parseFloat((s.rarity || '100%').replace('%', ''))
    if (r >= 5) return false
    if (seen.has(s.name)) return false
    seen.add(s.name)
    return true
  })
})

// ===== 去重匹配（白名单 + 去重） =====
function matchUnique(items: ShenShaItem[], keywords: string[]): ShenShaItem[] {
  const seen = new Set<string>()
  const out: ShenShaItem[] = []
  for (const s of items) {
    const clean = s.name.replace('🔥', '')
    const name = NAME_MAP[clean] || clean
    if (!CECE_WHITELIST.has(name)) continue
    if (seen.has(name)) continue
    if (keywords.some(k => name === k)) { seen.add(name); out.push(s) }
  }
  return out
}

// ===== 六维评分（基础40，命中+15，上限99；考验基础20） =====
const dimScores = computed(() => {
  const items = props.activeShensha

  const gc = matchUnique(items, ['天乙贵人','天德贵人','月德贵人','天赦日'])
  const gs = matchUnique(items, ['天德合','月德合','太极贵人','福星贵人','德秀贵人','三奇贵人'])
  const gm = [...gc, ...gs]; const gScore = Math.min(99, 40 + gc.length*25 + gs.length*15)

  const cc = matchUnique(items, ['文昌贵人','词馆','学堂'])
  const cs = matchUnique(items, ['国印','五行正印','天医'])
  const cm = [...cc, ...cs]; const cScore = Math.min(99, 40 + cc.length*25 + cs.length*15)

  const ec = matchUnique(items, ['红艳','红鸾','天喜'])
  const es = matchUnique(items, ['桃花'])
  const em = [...ec, ...es]; const eScore = Math.min(99, 40 + ec.length*25 + es.length*15)

  const hc = matchUnique(items, ['十灵日'])
  const hs = matchUnique(items, ['华盖','太极贵人'])
  const hm = [...hc, ...hs]; const hScore = Math.min(99, 40 + hc.length*30 + hs.length*15)

  const ac = matchUnique(items, ['禄神','金舆','金神','拱禄'])
  const as_ = matchUnique(items, ['将星','国印','驿马'])
  const am = [...ac, ...as_]; const aScore = Math.min(99, 40 + ac.length*25 + as_.length*15)

  const kc = matchUnique(items, ['魁罡','十恶大败','天罗地网','四废日'])
  const ks = matchUnique(items, [
    '劫煞','亡神','羊刃','灾煞','孤辰','寡宿','流霞','元辰','六厄','空亡',
    '阴差阳错','勾绞','童子','孤鸾','飞刃','血刃',
    '八专','九丑','天转','地转','丧门','吊客','披麻',
  ])
  const km = [...kc, ...ks]; const kScore = Math.min(99, 20 + kc.length*25 + ks.length*15)

  // 古籍加权
  const allHitNames = new Set(items.map(s => s.name.replace('🔥','')))
  const ie = calcInteractEffects(allHitNames)
  const tr = calcTransformEffects(allHitNames)
  function adj(base: number, dim: string): number {
    let v = base + (ie[dim]||0) + (tr.effects[dim]||0)
    return Math.min(99, Math.max(10, v))
  }

  return [
    { name:'贵人',icon:'👑',score:adj(gScore,'贵人'),matched:gm,barGradient:'from-amber-500 to-yellow-400',colorClass:'text-amber-400',tagClass:'border-amber-500/30 text-amber-300/90' },
    { name:'才华',icon:'💡',score:adj(cScore,'才华'),matched:cm,barGradient:'from-sky-500 to-blue-400',colorClass:'text-sky-400',tagClass:'border-sky-500/30 text-sky-300/90' },
    { name:'情感',icon:'🌸',score:adj(eScore,'情感'),matched:em,barGradient:'from-pink-500 to-rose-400',colorClass:'text-pink-400',tagClass:'border-pink-500/30 text-pink-300/90' },
    { name:'慧根',icon:'🧠',score:adj(hScore,'慧根'),matched:hm,barGradient:'from-emerald-500 to-teal-400',colorClass:'text-emerald-400',tagClass:'border-emerald-500/30 text-emerald-300/90' },
    { name:'成就',icon:'🪙',score:adj(aScore,'成就'),matched:am,barGradient:'from-yellow-600 to-amber-500',colorClass:'text-yellow-500',tagClass:'border-yellow-500/30 text-yellow-400/90' },
    { name:'考验',icon:'⚡',score:adj(kScore,'考验'),matched:km,barGradient:'from-purple-600 to-indigo-500',colorClass:'text-purple-400',tagClass:'border-purple-500/30 text-purple-400/90' },
  ]
})

function getComment(name: string, score: number): string {
  const h: Record<string,string> = { '贵人':'善良叠加好运，好人有好报Plus版','才华':'书卷气，是最好的社交名片','情感':'满级情感外挂，手握缘分王炸','慧根':'才华横溢，灵魂有光的智者','成就':'顶级玩家，财富地位都要得','考验':'千锤百炼，愈战愈勇的狠角色' }
  const m: Record<string,string> = { '贵人':'人缘颇佳，关键时刻总有朋友搭把手','才华':'思维敏捷，对新事物能快速拆解','情感':'情感细腻，极具同理心与共情力','慧根':'第六感敏锐，天生对神秘学有共鸣','成就':'骨子里自带坚韧，目标执行力极强','考验':'逆流而上，经历磨砺终能蜕变反弹' }
  const l: Record<string,string> = { '贵人':'独立自强，你的贵人是正在努力的自己','才华':'一步一个脚印，扎实就是最好的天赋','情感':'深情而克制，属于你的缘分自有安排','慧根':'大智若愚，你比想象中更有潜力','成就':'厚积薄发，时间会给踏实的人答案','考验':'轻舟已过万重山，前路平坦且明朗' }
  if (score >= 85) return h[name]
  if (score >= 55) return m[name]
  return l[name]
}
</script>

<template>
  <div class="w-full mt-6">
    <!-- 核心天赋展示 — Grid 横向卡牌布局 -->
    <div v-if="displayShensha.length > 0">
      <h3 class="text-sm font-medium text-amber-400/80 mb-3 flex items-center gap-1"><span>✨</span> 核心命格天赋</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div v-for="item in displayShensha" :key="item.name"
          class="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-amber-500/20 backdrop-blur-md flex items-start gap-3">
          <span class="text-xl shrink-0 mt-0.5">👑</span>
          <div class="min-w-0">
            <div class="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-purple-200">{{ item.name }}</div>
            <div class="text-[10px] text-amber-400/70 mt-0.5">{{ getBrief(item.name) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 查看全部按钮 -->
    <div v-if="displayShensha.length > 0" class="text-center mt-3">
      <button @click="showAll = !showAll" class="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
        {{ showAll ? '▲ 收起' : '📖 查看全部神煞' }}
      </button>
    </div>
    <div v-if="showAll" class="mt-2 p-3 rounded-xl bg-slate-900/40 border border-slate-700/30">
      <div class="flex flex-wrap gap-1.5">
        <span v-for="s in props.activeShensha.filter((s,i,a) => a.findIndex(x => x.name===s.name)===i)" :key="s.name"
          class="text-[10px] px-2 py-0.5 rounded-full border border-slate-700/30 bg-slate-800/30 text-slate-400">
          {{ s.name.replace('🔥','') }}
        </span>
      </div>
    </div>

    <!-- 六维图谱（保持不变） -->
    <div class="p-5 rounded-2xl bg-slate-900/40 border border-purple-500/20 backdrop-blur-lg space-y-5">
      <h3 class="text-sm font-medium text-purple-300 mb-2 flex items-center gap-1"><span>📊</span> 核心神煞全息图谱</h3>
      <div v-for="dim in dimScores" :key="dim.name" class="space-y-2">
        <div class="flex justify-between items-end">
          <div class="flex items-center gap-2">
            <span class="text-base">{{ dim.icon }}</span>
            <span class="text-sm font-medium text-gray-200">{{ dim.name }}</span>
            <span class="text-base font-bold font-mono" :class="dim.colorClass">{{ dim.score }}分</span>
          </div>
          <div class="text-xs text-gray-400 max-w-[60%] truncate text-right">{{ getComment(dim.name, dim.score) }}</div>
        </div>
        <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all duration-1000 bg-gradient-to-r shadow-[0_0_8px_rgba(168,85,247,0.4)]" :class="dim.barGradient" :style="{ width: dim.score + '%' }" />
        </div>
        <div v-if="dim.matched.length > 0" class="flex flex-wrap gap-1.5 pt-1">
          <span v-for="s in dim.matched" :key="s.name" class="text-[10px] px-2 py-0.5 rounded-full border bg-slate-950/60 font-medium" :class="dim.tagClass">{{ s.name }}</span>
        </div>
        <div v-else class="text-[10px] text-gray-600 italic pl-1">暂无对应神煞激活</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer { 100% { transform: translateX(100%); } }
</style>
