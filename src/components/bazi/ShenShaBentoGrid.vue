<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ShenShaResult } from '@/types/bazi'
import { groupShenShaByFaction, SHENSHA_FACTIONS } from '@/utils/shensha-engine'

const props = defineProps<{ allShenSha: Record<number, ShenShaResult[]> }>()

const grouped = computed(() => groupShenShaByFaction(props.allShenSha))

const factionEntries = computed(() =>
  Object.entries(SHENSHA_FACTIONS).map(([key, faction]) => ({
    key,
    label: faction.label,
    color: faction.color,
    items: grouped.value[key] || [],
    emoji: { auspicious: '🌟', wealth: '💰', romance: '💕', tough: '⚡', change: '🔄' }[key] || '✨',
  })).filter(f => f.items.length > 0)
)

const totalCount = computed(() => factionEntries.value.reduce((sum, f) => sum + f.items.length, 0))

// ★ 折叠控制
const expandedMap = ref<Record<string, boolean>>({})
const allExpanded = ref(true)

function toggleGroup(key: string) {
  expandedMap.value[key] = !(expandedMap.value[key] ?? true)
}
function toggleAll() {
  allExpanded.value = !allExpanded.value
  for (const f of factionEntries.value) {
    expandedMap.value[f.key] = allExpanded.value
  }
}
</script>

<template>
  <div v-if="totalCount > 0" class="space-y-4">
    <!-- 标题 -->
    <div class="text-center mb-2">
      <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
        ✨ 命带 {{ totalCount }} 颗神煞
      </span>
      <button v-if="factionEntries.length > 0" @click="toggleAll"
        class="ml-2 text-[10px] px-2 py-1 rounded-full border border-slate-600/50 text-slate-500 hover:text-slate-300 hover:border-slate-400 transition-colors align-middle">
        {{ allExpanded ? '一键收起' : '一键展开' }}
      </button>
    </div>

    <!-- Bento Grid：移动端1列，桌面端2-3列自适应 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="faction in factionEntries"
        :key="faction.key"
        class="backdrop-blur-lg bg-slate-900/40 border rounded-2xl p-4 md:p-5 transition-all duration-300 hover:shadow-lg"
        :style="{ borderColor: faction.color + '33', boxShadow: `0 0 30px ${faction.color}08` }"
      >
        <!-- 卡片头 — 可点击切换 -->
        <div
          @click="toggleGroup(faction.key)"
          class="flex items-center gap-2 mb-3 pb-2 border-b cursor-pointer select-none"
          :style="{ borderColor: faction.color + '22' }"
        >
          <span class="text-lg">{{ faction.emoji }}</span>
          <h3 class="text-sm font-bold" :style="{ color: faction.color }">{{ faction.label }}</h3>
          <span class="ml-auto text-xs px-2 py-0.5 rounded-full" :style="{ background: faction.color + '15', color: faction.color }">{{ faction.items.length }}</span>
          <span class="text-[10px] text-slate-500 transition-transform duration-200" :class="(expandedMap[faction.key] ?? true) ? '' : '-rotate-90'">▼</span>
        </div>
        <!-- 神煞列表 — 可折叠 -->
        <div class="overflow-hidden transition-all duration-300 ease-in-out"
          :style="{ maxHeight: (expandedMap[faction.key] ?? true) ? '800px' : '0px', opacity: (expandedMap[faction.key] ?? true) ? 1 : 0 }">
          <div class="space-y-2.5">
            <div
              v-for="ss in faction.items"
              :key="ss.name"
              class="group p-2.5 rounded-xl transition-all duration-200 hover:bg-white/5"
              :style="{ borderLeft: `2px solid ${faction.color}40` }"
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs px-2 py-0.5 rounded-md font-medium" :style="{ background: faction.color + '18', color: faction.color }">
                  {{ ss.name }}
                </span>
                <span class="text-[10px] px-1.5 py-0.5 rounded" :class="ss.type === '吉' ? 'bg-yellow-500/10 text-yellow-400' : ss.type === '凶' ? 'bg-red-500/10 text-red-400' : 'bg-purple-500/10 text-purple-400'">
                  {{ ss.type }}
                </span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">
                {{ ss.meaning }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-4">
    <p class="text-xs text-slate-500">命盘较清，未检测到主流神煞</p>
  </div>
</template>
