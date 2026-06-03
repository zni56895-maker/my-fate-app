<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { BirthInfo, Gender } from '@/types/bazi'
import { useBaziStore } from '@/stores/useBaziStore'

const baziStore = useBaziStore()

function update<K extends keyof BirthInfo>(key: K, value: BirthInfo[K]): void {
  baziStore.updateBirthInfo(key, value)
}

const currentYear = new Date().getFullYear()
const yearOpts = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => ({ value: currentYear - i, label: `${currentYear - i}` }))
const monthOpts = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}` }))
const dayOpts = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: `${i + 1}` }))
const hourOpts = Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${String(i).padStart(2, '0')}:00` }))

const fields = {
  year:  { label: '年', opts: yearOpts,  get: () => baziStore.birthInfo.year },
  month: { label: '月', opts: monthOpts, get: () => baziStore.birthInfo.month },
  day:   { label: '日', opts: dayOpts,   get: () => baziStore.birthInfo.day },
  hour:  { label: '时', opts: hourOpts,  get: () => baziStore.birthInfo.hour },
} as const

const openField = ref<string | null>(null)
const cardRefs = ref<Record<string, HTMLElement | null>>({})

function setRef(k: string) {
  return (el: any) => { cardRefs.value[k] = el }
}

function toggle(k: string) {
  openField.value = openField.value === k ? null : k
}

function pick(k: string, v: number) {
  update(k as keyof BirthInfo, v as any)
  openField.value = null
}

function onDocClick(e: MouseEvent) {
  if (!openField.value) return
  const k = openField.value
  const el = cardRefs.value[k]
  if (el && !el.contains(e.target as Node)) {
    openField.value = null
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div class="flex flex-col items-center pt-16 md:pt-20">
    <!-- 时间卡片组 (max-w-4xl 轨道对齐) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 w-full max-w-4xl mx-auto">
      <div
        v-for="(f, key) in fields"
        :key="key"
        :ref="setRef(key)"
        class="relative flex flex-col items-stretch"
      >
        <span class="text-sm text-white/60 text-center mb-3">{{ f.label }}</span>
        <button
          @click.stop="toggle(key)"
          class="w-full bg-white/[0.04] border border-white/5 backdrop-blur-sm rounded-sm px-1 py-1.5 h-10 flex items-center justify-center font-mono text-base text-white/60 outline-none cursor-pointer transition-all duration-300 hover:bg-white/[0.07]"
        >
          {{ f.opts.find(o => o.value === f.get())?.label ?? f.get() }}
        </button>

        <Teleport to="body">
          <div v-if="openField === key" class="fixed inset-0 z-40" />
          <div
            v-if="openField === key"
            class="fixed z-50 max-h-40 overflow-y-auto bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-sm text-sm animate-fade-in scrollbar-none"
            :style="{
              left: (cardRefs[key]?.getBoundingClientRect().left ?? 0) + 'px',
              top: ((cardRefs[key]?.getBoundingClientRect().bottom ?? 0) + 4) + 'px',
              minWidth: (cardRefs[key]?.offsetWidth ?? 80) + 'px',
            }"
            @click.stop
          >
            <div class="px-2 py-2 space-y-0.5">
              <button
                v-for="opt in f.opts"
                :key="opt.value"
                @click="pick(key, opt.value)"
                class="block w-full text-left px-3 py-2 text-white/50 transition-all duration-300"
                :class="{ 'text-sky-300': opt.value === f.get() }"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </Teleport>
      </div>
    </div>

    <!-- 阴阳锚点 (独立站位，通过留白分隔) -->
    <div class="flex items-center justify-center gap-4 my-16">
      <button
        @click="update('gender', 0)"
        class="text-xs font-extralight tracking-widest transition-all duration-300 outline-none cursor-pointer"
        :class="baziStore.birthInfo.gender === 0 ? 'text-white/70 border-b border-white/30 pb-0.5' : 'text-white/20 border-b border-transparent pb-0.5 hover:text-white/40'"
      >阳</button>
      <span class="w-1 h-1 rounded-full bg-white/15" />
      <button
        @click="update('gender', 1)"
        class="text-xs font-extralight tracking-widest transition-all duration-300 outline-none cursor-pointer"
        :class="baziStore.birthInfo.gender === 1 ? 'text-white/70 border-b border-white/30 pb-0.5' : 'text-white/20 border-b border-transparent pb-0.5 hover:text-white/40'"
      >阴</button>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  0% { opacity: 0; transform: translateY(-2px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
</style>
