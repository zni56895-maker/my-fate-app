<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ShenShaResult } from '@/types/bazi'
import { groupShenShaByFaction, SHENSHA_FACTIONS } from '@/utils/shensha-engine'

const props = defineProps<{ allShenSha: Record<number, ShenShaResult[]> }>()
const grouped = computed(() => groupShenShaByFaction(props.allShenSha))

const SVG_ICONS: Record<string, string> = {
  auspicious: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><polygon points="7,1 9,5.5 13.5,6 10.5,9 11,13.5 7,11.5 3,13.5 3.5,9 0.5,6 5,5.5"/></svg>',
  wealth: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><circle cx="7" cy="7" r="5"/><path d="M7 4v6M4.5 7h5"/></svg>',
  romance: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><path d="M7 12S2 9 2 6a3.5 3.5 0 0 1 5-2.5A3.5 3.5 0 0 1 12 6c0 3-5 6-5 6z"/></svg>',
  tough: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><polygon points="7,1.5 4.5,5 1,5.5 3.5,8 3,11.5 7,10 11,11.5 10.5,8 13,5.5 9.5,5"/></svg>',
  change: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><circle cx="7" cy="7" r="5"/><path d="M7 4v3l2 1.5"/></svg>',
}

const SVG_KEYS: Record<string, string> = {
  auspicious: 'auspicious', wealth: 'wealth', romance: 'romance', tough: 'tough', change: 'change',
}

const factionEntries = computed(() =>
  Object.entries(SHENSHA_FACTIONS).map(([key, faction]) => ({
    key, label: faction.label, color: faction.color, items: grouped.value[key] || [],
    svgKey: SVG_KEYS[key] || 'auspicious',
  })).filter(f => f.items.length > 0)
)
const totalCount = computed(() => factionEntries.value.reduce((sum, f) => sum + f.items.length, 0))
const expandedMap = ref<Record<string, boolean>>({})
function toggleGroup(key: string) { expandedMap.value[key] = !(expandedMap.value[key] ?? false) }
</script>

<template>
  <div v-if="totalCount > 0" class="flex flex-col gap-3">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <div v-for="faction in factionEntries" :key="faction.key"
        class="rounded-sm backdrop-blur-sm transition-all duration-300"
        :style="{ background: 'rgba(15,23,42,0.5)', border: '0.5px solid ' + faction.color + '30' }">
        <div @click="toggleGroup(faction.key)" class="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none transition-all duration-300"
          :style="{ borderBottom: '0.5px solid ' + faction.color + '15', marginBottom: (expandedMap[faction.key] ?? false) ? '0.5rem' : '0', boxShadow: (expandedMap[faction.key] ?? false) ? 'inset 0 0 20px ' + faction.color + '08' : 'none' }">
          <span class="inline-block w-3.5 h-3.5 shrink-0" :style="{ color: faction.color + 'b3' }" v-html="SVG_ICONS[faction.svgKey]" />
          <h3 class="text-xs font-light tracking-wider" :style="{ color: faction.color + 'cc' }">{{ faction.label }}</h3>
          <span class="ml-auto text-[10px]" :style="{ color: faction.color + '80' }">{{ faction.items.length }}</span>
          <span class="text-[8px] transition-[transform] duration-300 ease-stretch" :style="{ color: faction.color + '60' }" :class="(expandedMap[faction.key] ?? false) ? '' : '-rotate-90'">▼</span>
        </div>
        <div class="overflow-hidden transition-all duration-500 ease-stretch px-3" :style="{ maxHeight: (expandedMap[faction.key] ?? false) ? '800px' : '0px', opacity: (expandedMap[faction.key] ?? false) ? 1 : 0 }">
          <div class="flex flex-col gap-1.5 pb-2">
            <div v-for="(ss, idx) in faction.items" :key="ss.name" class="flex flex-col gap-0.5 px-1 py-1 transition-all duration-500 ease-stretch" :style="{ transitionDelay: (expandedMap[faction.key] ?? false) ? `${idx*30}ms` : '0ms', opacity: (expandedMap[faction.key] ?? false) ? 1 : 0, transform: (expandedMap[faction.key] ?? false) ? 'translateY(0)' : 'translateY(4px)' }">
              <div class="flex items-center gap-2">
                <span class="text-xs font-light" :style="{ color: faction.color + 'cc' }">{{ ss.name }}</span>
                <span class="text-[10px] text-white/20 lowercase">{{ ss.type }}</span>
              </div>
              <p class="text-[10px] text-white/25 leading-relaxed">{{ ss.meaning }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-4"><p class="text-xs text-white/20">命盘清静，无主流神煞</p></div>
</template>
