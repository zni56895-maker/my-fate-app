<script setup lang="ts">
import { computed, ref } from 'vue'
import { calcInteractEffects, calcTransformEffects } from '@/utils/classicRules'

const CECE_WHITELIST = new Set([
  "天乙贵人","天德贵人","文昌贵人","月德贵人",
  "驿马","将星","金舆","禄神","词馆","学堂","国印","太极贵人",
  "天德合","月德合","德秀贵人","天医","五行正印","红鸾","天喜","三奇贵人",
  "福星贵人","十灵日","天赦日","拱禄","六秀日","桃花","华盖","劫煞",
  "亡神","魁罡","金神","羊刃","灾煞","孤辰","寡宿","红艳",
  "流霞","元辰","六厄","空亡","阴差阳错","天罗地网","勾绞","十恶大败",
  "童子","孤鸾","飞刃","血刃","八专","九丑","四废日","天转",
  "地转","丧门","吊客","披麻",
  "国印贵人","金舆贵人","天医贵人","天赦","魁罡贵人","红艳煞","流霞煞",
  "勾绞煞","披麻煞","阴阳差错","四废",
])
const NAME_MAP: Record<string, string> = {
  '国印贵人':'国印','金舆贵人':'金舆','天医贵人':'天医','天赦':'天赦日',
  '咸池桃花':'桃花','红艳煞':'红艳','魁罡贵人':'魁罡','流霞煞':'流霞',
  '勾绞煞':'勾绞','披麻煞':'披麻','阴阳差错':'阴差阳错','四废':'四废日',
}
interface ShenShaItem { name: string; type?: string; desc?: string; rarity?: string; tag?: string; meaning?: string; pillar?: number; jiXiong?: string }
const props = defineProps<{ activeShensha: ShenShaItem[] }>()
const TOP_TIER = new Set([
  '天乙贵人','天德贵人','月德贵人','天德合','月德合','太极贵人','三奇贵人',
  '天赦','天赦日','天医','天医贵人','文昌贵人','十灵日','福星贵人',
  '禄神','金舆','金舆贵人','国印','国印贵人','五行正印','天官贵人',
  '将星','金神','红鸾','天喜','天作之合','魁罡','魁罡贵人','华盖','德秀贵人',
])
const SHENSHA_POWER: Record<string, number> = {
  '三奇贵人':100,'天赦':98,'天赦日':98,'天德合':95,'天乙贵人':90,'天德贵人':85,
  '月德合':82,'月德贵人':80,'太极贵人':78,'福星贵人':76,'十灵日':74,'天医':72,
  '天医贵人':72,'金神':70,'文昌贵人':68,'禄神':66,'五行正印':64,'金舆':62,
  '金舆贵人':62,'国印':60,'国印贵人':60,'天官贵人':58,'将星':56,'德秀贵人':54,
  '华盖':52,'红鸾':50,'天喜':48,'天作之合':46,'魁罡':44,'魁罡贵人':44,
}
const displayShensha = computed(() => {
  const seen = new Set<string>()
  return props.activeShensha.filter(s => { const n = s.name.replace('🔥',''); if (!TOP_TIER.has(n)||seen.has(n)) return false; seen.add(n); return true }).sort((a,b)=>(SHENSHA_POWER[b.name]||0)-(SHENSHA_POWER[a.name]||0)).slice(0,3)
})
const showAll = ref(false)
const talentColor: Record<string, string> = {
  '天乙贵人':'text-shensha-nobility','天德贵人':'text-shensha-nobility','月德贵人':'text-shensha-nobility',
  '天德合':'text-shensha-nobility','月德合':'text-shensha-nobility','太极贵人':'text-shensha-wisdom',
  '三奇贵人':'text-shensha-nobility','天赦':'text-shensha-nobility','天赦日':'text-shensha-nobility',
  '天医':'text-shensha-talent','文昌贵人':'text-shensha-talent','十灵日':'text-shensha-wisdom',
  '福星贵人':'text-shensha-achievement','禄神':'text-shensha-achievement','金舆贵人':'text-shensha-achievement',
  '国印贵人':'text-shensha-nobility','五行正印':'text-shensha-nobility','天官贵人':'text-shensha-nobility',
  '将星':'text-shensha-achievement','金神':'text-shensha-achievement','红鸾':'text-shensha-emotion',
  '天喜':'text-shensha-emotion','天作之合':'text-shensha-emotion','魁罡':'text-shensha-trial',
  '魁罡贵人':'text-shensha-trial','华盖':'text-shensha-wisdom','德秀贵人':'text-shensha-wisdom',
}

/** shensha token → nebula hex for gradient borders */
const shenshaToNebula: Record<string, string> = {
  nobility: '#fbbf24', talent: '#38bdf8', emotion: '#f472b6',
  wisdom: '#34d399', achievement: '#f59e0b', trial: '#a78bfa',
}
/** Extract the hex from a token class like "text-shensha-nobility" */
function shenshaHex(tclass: string): string {
  const key = tclass.replace('text-shensha-', '')
  return shenshaToNebula[key] || '#fbbf24'
}
function getBrief(name: string): string {
  const m: Record<string,string> = {
    '天乙贵人':'遇难成祥，关键时刻总有援手','天德贵人':'上天庇佑，吉星护体','月德贵人':'温柔有力量',
    '天德合':'贵人运加倍','月德合':'人际和谐度翻倍','太极贵人':'慧根深种，洞察天机',
    '三奇贵人':'绝世才华','天赦':'逢凶化吉','天医':'疗愈者之星','文昌贵人':'文曲下凡',
    '十灵日':'清灵之气','福星贵人':'福星高照','禄神':'禄位高悬','金舆贵人':'富贵双全',
    '国印贵人':'印信在手','将星':'将星坐镇',
  }
  return m[name]||'核心命格神煞'
}
const hoveredDim = ref<string|null>(null)
function matchUnique(items: ShenShaItem[], keywords: string[]): ShenShaItem[] {
  const seen = new Set<string>(); const out: ShenShaItem[] = []
  for (const s of items) { const n = NAME_MAP[s.name.replace('🔥','')]||s.name.replace('🔥',''); if (!CECE_WHITELIST.has(n)||seen.has(n)) continue; if (keywords.some(k=>n===k)) { seen.add(n); out.push(s) } }
  return out
}
const dimScores = computed(() => {
  const items = props.activeShensha
  const gc=matchUnique(items,['天乙贵人','天德贵人','月德贵人','天赦日']); const gs=matchUnique(items,['天德合','月德合','太极贵人','福星贵人','德秀贵人','三奇贵人']); const gm=[...gc,...gs]; const gScore=Math.min(99,40+gc.length*25+gs.length*15)
  const cc=matchUnique(items,['文昌贵人','词馆','学堂']); const cs=matchUnique(items,['国印','五行正印','天医']); const cm=[...cc,...cs]; const cScore=Math.min(99,40+cc.length*25+cs.length*15)
  const ec=matchUnique(items,['红艳','红鸾','天喜']); const es=matchUnique(items,['桃花']); const em=[...ec,...es]; const eScore=Math.min(99,40+ec.length*25+es.length*15)
  const hc=matchUnique(items,['十灵日']); const hs=matchUnique(items,['华盖','太极贵人']); const hm=[...hc,...hs]; const hScore=Math.min(99,40+hc.length*30+hs.length*15)
  const ac=matchUnique(items,['禄神','金舆','金神','拱禄']); const as_=matchUnique(items,['将星','国印','驿马']); const am=[...ac,...as_]; const aScore=Math.min(99,40+ac.length*25+as_.length*15)
  const kc=matchUnique(items,['魁罡','十恶大败','天罗地网','四废日']); const ks=matchUnique(items,['劫煞','亡神','羊刃','灾煞','孤辰','寡宿','流霞','元辰','六厄','空亡','阴差阳错','勾绞','童子','孤鸾','飞刃','血刃','八专','九丑','天转','地转','丧门','吊客','披麻']); const km=[...kc,...ks]; const kScore=Math.min(99,20+kc.length*25+ks.length*15)
  const allHitNames=new Set(items.map(s=>s.name.replace('🔥',''))); const ie=calcInteractEffects(allHitNames); const tr=calcTransformEffects(allHitNames)
  function adj(b:number,d:string){return Math.min(99,Math.max(10,b+(ie[d]||0)+(tr.effects[d]||0)))}
  return [
    {name:'贵人',icon:'crown',score:adj(gScore,'贵人'),matched:gm,barGradient:'from-amber-500 to-yellow-400',colorClass:'text-amber-400'},
    {name:'才华',icon:'sparkle',score:adj(cScore,'才华'),matched:cm,barGradient:'from-sky-500 to-blue-400',colorClass:'text-sky-400'},
    {name:'情感',icon:'heart',score:adj(eScore,'情感'),matched:em,barGradient:'from-pink-500 to-rose-400',colorClass:'text-pink-400'},
    {name:'慧根',icon:'brain',score:adj(hScore,'慧根'),matched:hm,barGradient:'from-emerald-500 to-teal-400',colorClass:'text-emerald-400'},
    {name:'成就',icon:'target',score:adj(aScore,'成就'),matched:am,barGradient:'from-yellow-600 to-amber-500',colorClass:'text-yellow-500'},
    {name:'考验',icon:'bolt',score:adj(kScore,'考验'),matched:km,barGradient:'from-purple-600 to-indigo-500',colorClass:'text-purple-400'},
  ]
})
function getComment(name:string,score:number):string {
  const h:Record<string,string>={'贵人':'善良叠加好运','才华':'书卷气是最好的社交名片','情感':'满级情感外挂','慧根':'才华横溢','成就':'顶级玩家','考验':'千锤百炼'}
  const m:Record<string,string>={'贵人':'人缘颇佳','才华':'思维敏捷','情感':'情感细腻','慧根':'第六感敏锐','成就':'目标执行力极强','考验':'逆流而上'}
  const l:Record<string,string>={'贵人':'独立自强','才华':'一步一个脚印','情感':'深情而克制','慧根':'大智若愚','成就':'厚积薄发','考验':'轻舟已过万重山'}
  if(score>=85) return h[name]; if(score>=55) return m[name]; return l[name]
}
const dimSvg: Record<string,string> = {
  crown:'<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><path d="M2 11h10L11 5l-4 2.5L7 3 7 7.5 3 5Z"/><circle cx="7" cy="3" r="0.8"/></svg>',
  sparkle:'<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><path d="M7 1v3M7 10v3M1 7h3M10 7h3"/><path d="M3.5 3.5l2 2M8.5 8.5l2 2M3.5 10.5l2-2M8.5 5.5l2-2"/></svg>',
  heart:'<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><path d="M7 12.5S1.5 9 1.5 5.5a3.5 3.5 0 0 1 5.5-2.7 3.5 3.5 0 0 1 5.5 2.7C12.5 9 7 12.5 7 12.5Z"/></svg>',
  brain:'<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><circle cx="7" cy="7" r="4.5"/><path d="M7 2.5v9M2.5 7h9"/><circle cx="7" cy="7" r="1.5"/></svg>',
  target:'<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><circle cx="7" cy="7" r="5.5"/><circle cx="7" cy="7" r="2.5"/><circle cx="7" cy="7" r="0.8"/></svg>',
  bolt:'<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><polygon points="7,1 4,6 6,6 5,13 10,7 8,7 9.5,1"/></svg>',
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 第一幕 · 天枢 -->
    <div v-if="displayShensha.length > 0" class="flex flex-col gap-3">
      <h3 class="text-xs font-light tracking-widest text-purple-300/60">天枢 · 核心天赋</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div v-for="(item, idx) in displayShensha" :key="item.name"
          class="rounded-sm transition-all duration-500 group"
          :style="{ animation: `rise 0.5s cubic-bezier(0.16,1,0.3,1) ${idx*120}ms both` }">
          <div class="flex items-start gap-2.5 px-4 py-3 rounded-sm bg-purple-900/20 backdrop-blur-md transition-all duration-500 group-hover:bg-purple-900/30" :style="{ border: '1px solid rgba(168,85,247,.5)', boxShadow: '0 0 12px rgba(168,85,247,.2), 0 4px 20px rgba(0,0,0,.3)' }">
            <svg viewBox="0 0 12 12" class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="1" style="color:#c4b5fd;filter:drop-shadow(0 0 4px rgba(168,85,247,.4))"><polygon points="6,1 7.5,4 10.5,4.5 8.5,6.5 9,9.5 6,8 3,9.5 3.5,6.5 1.5,4.5 4.5,4"/></svg>
            <div>
              <div class="text-sm font-medium tracking-wider text-purple-200 transition-all duration-300 group-hover:text-purple-100">{{ item.name }}</div>
              <div class="text-xs text-purple-300/60 mt-0.5 tracking-wide">{{ getBrief(item.name) }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center">
        <button @click="showAll=!showAll" class="text-[10px] text-white/25 hover:text-white/50 transition-colors duration-300 outline-none cursor-pointer tracking-wider">{{ showAll?'− 收起':'+ 全部神煞' }}</button>
      </div>
      <div v-if="showAll" class="flex flex-wrap gap-1.5 px-3 py-2 rounded-sm backdrop-blur-sm transition-all duration-300" :style="{background:'rgba(255,255,255,0.02)',border:'0.5px solid rgba(255,255,255,0.06)'}">
        <span v-for="s in props.activeShensha.filter((s,i,a)=>a.findIndex(x=>x.name===s.name)===i)" :key="s.name" class="text-[10px] text-white/30 lowercase tracking-wide">{{ s.name.replace('🔥','') }}</span>
      </div>
    </div>
    <!-- 第二幕 · 光谱 -->
    <div class="flex flex-col gap-6 px-3 py-5 rounded-sm backdrop-blur-sm" :style="{background:'rgba(255,255,255,0.02)',border:'0.5px solid rgba(255,255,255,0.06)'}">
      <div v-for="dim in dimScores" :key="dim.name" class="flex flex-col gap-1.5 group cursor-default" @mouseenter="hoveredDim=dim.name" @mouseleave="hoveredDim=null">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="inline-block w-3.5 h-3.5 transition-all duration-300" :class="dim.colorClass" :style="{filter:hoveredDim===dim.name?'drop-shadow(0 0 4px currentColor)':'none'}" v-html="dimSvg[dim.icon]" />
            <span class="text-sm font-semibold tracking-wider transition-all duration-300 mb-1" :class="hoveredDim===dim.name?'text-white':'text-white/70'">{{ dim.name }}</span>
            <span class="text-sm font-light font-mono tracking-wider transition-all duration-500 text-white" :style="{filter:'drop-shadow(0 0 3px currentColor)'}">{{ dim.score }}</span>
          </div>
          <div class="text-xs text-gray-300 max-w-[55%] truncate text-right group-hover:text-white/60 transition-colors duration-300 tracking-wide">{{ getComment(dim.name,dim.score) }}</div>
        </div>
        <!-- 10px 饱满能量条 + 末端辉光 -->
        <div class="w-full h-2.5 rounded-sm overflow-hidden relative" :style="{background:'#0f172a'}">
          <div class="h-full rounded-sm bg-gradient-to-r transition-all duration-1000 ease-stretch" :class="dim.barGradient" :style="{width:dim.score+'%',boxShadow:'0 0 8px currentColor,0 0 4px currentColor'}" />
        </div>
        <!-- 神煞标签群 (始终可见) -->
        <div v-if="dim.matched.length>0" class="flex flex-wrap gap-1.5 pt-1">
          <span v-for="s in dim.matched" :key="s.name" class="text-[11px] lowercase tracking-wide px-2.5 py-0.5 rounded-sm transition-all duration-300" :style="{background:'rgba(15,23,42,0.5)',border:'0.5px solid rgba(255,255,255,0.06)'}" :class="dim.colorClass+'/70'">{{ s.name }}</span>
        </div>
        <div v-else class="text-[10px] text-white/10 italic pt-1">—</div>
      </div>
    </div>
  </div>
</template>
