<script setup lang="ts">
import type { BirthInfo, Gender } from '@/types/bazi'

const props = defineProps<{
  birthInfo: BirthInfo
}>()

const emit = defineEmits<{
  'update:birthInfo': [info: BirthInfo]
}>()

function update<K extends keyof BirthInfo>(key: K, value: BirthInfo[K]): void {
  emit('update:birthInfo', { ...props.birthInfo, [key]: value })
}

// 生成年份选项（1900~当前年份）
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)
const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1)
const hourOptions = Array.from({ length: 24 }, (_, i) => i)
</script>

<template>
  <div class="card-cosmic p-4 md:p-6">
    <h3 class="text-base md:text-lg font-semibold text-cosmic-accent-light mb-4 flex items-center gap-2">
      <span>📋</span> 出生信息
    </h3>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      <!-- 年份 -->
      <div>
        <label class="block text-xs text-cosmic-muted mb-1">年份</label>
        <select
          :value="birthInfo.year"
          @change="update('year', Number(($event.target as HTMLSelectElement).value))"
          class="select-cosmic text-sm"
        >
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }} 年</option>
        </select>
      </div>

      <!-- 月份 -->
      <div>
        <label class="block text-xs text-cosmic-muted mb-1">月份</label>
        <select
          :value="birthInfo.month"
          @change="update('month', Number(($event.target as HTMLSelectElement).value))"
          class="select-cosmic text-sm"
        >
          <option v-for="m in monthOptions" :key="m" :value="m">{{ m }} 月</option>
        </select>
      </div>

      <!-- 日期 -->
      <div>
        <label class="block text-xs text-cosmic-muted mb-1">日期</label>
        <select
          :value="birthInfo.day"
          @change="update('day', Number(($event.target as HTMLSelectElement).value))"
          class="select-cosmic text-sm"
        >
          <option v-for="d in dayOptions" :key="d" :value="d">{{ d }} 日</option>
        </select>
      </div>

      <!-- 小时 -->
      <div>
        <label class="block text-xs text-cosmic-muted mb-1">时间（0-23时）</label>
        <select
          :value="birthInfo.hour"
          @change="update('hour', Number(($event.target as HTMLSelectElement).value))"
          class="select-cosmic text-sm"
        >
          <option v-for="h in hourOptions" :key="h" :value="h">
            {{ String(h).padStart(2, '0') }}:00
          </option>
        </select>
      </div>

      <!-- 性别 -->
      <div>
        <label class="block text-xs text-cosmic-muted mb-1">性别</label>
        <div class="flex gap-2">
          <button
            v-for="g in [
              { value: 0 as Gender, label: '男 ♂' },
              { value: 1 as Gender, label: '女 ♀' },
            ]"
            :key="g.value"
            @click="update('gender', g.value)"
            :class="[
              'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300',
              birthInfo.gender === g.value
                ? 'bg-cosmic-accent text-white shadow-glow'
                : 'bg-cosmic-bg border border-cosmic-border text-cosmic-muted hover:border-cosmic-accent',
            ]"
          >
            {{ g.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
