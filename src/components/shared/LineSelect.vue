<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: number
  options: { value: number; label: string }[]
  label: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const open = ref(false)
const triggerRef = ref<HTMLElement | null>()

function toggle() {
  open.value = !open.value
}

function select(val: number) {
  emit('update:modelValue', val)
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  if (!open.value) return
  if (triggerRef.value && !triggerRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="triggerRef" class="relative">
    <label class="block text-xs text-white/20 mb-1.5">{{ label }}</label>
    <button
      @click.stop="toggle"
      class="inline-select-btn relative w-full text-left text-sm text-white/60 pb-2 outline-none cursor-pointer"
    >
      {{ options.find(o => o.value === modelValue)?.label ?? modelValue }}
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        class="fixed inset-0 z-40"
      />
      <div
        v-if="open"
        class="fixed z-50 max-h-40 overflow-y-auto bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-sm text-sm animate-fade-in"
        :style="{
          left: (triggerRef?.getBoundingClientRect().left ?? 0) + 'px',
          top: ((triggerRef?.getBoundingClientRect().bottom ?? 0) + 4) + 'px',
          minWidth: (triggerRef?.offsetWidth ?? 120) + 'px',
        }"
        @click.stop
      >
        <div class="px-2 py-2 space-y-0.5">
          <button
            v-for="opt in options"
            :key="opt.value"
            @click="select(opt.value)"
            class="block w-full text-left px-3 py-2 text-white/50 transition-all duration-300"
            :class="{ 'text-sky-300': opt.value === modelValue }"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* 渐变光束底线 — 视觉微光 */
.inline-select-btn::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 0.5px;
  background: linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.35), rgba(255,255,255,0.05));
  transition: background 0.5s ease;
}
.inline-select-btn:hover::after {
  background: linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.6), rgba(255,255,255,0.1));
}

@keyframes fade-in {
  0% { opacity: 0; transform: translateY(-2px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
</style>
