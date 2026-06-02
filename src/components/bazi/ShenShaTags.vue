<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ShenShaResult } from '@/types/bazi'
import { IS_BASIC } from '@/constants/fortuneDatabase'
import TagBadge from '@/components/shared/TagBadge.vue'

const props = defineProps<{
  shenShaList: ShenShaResult[]
}>()

const showAll = ref(false)

const isBasic = (name: string) => IS_BASIC.has(name)
const basicList = computed(() => props.shenShaList.filter(s => isBasic(s.name)))
const extraList = computed(() => props.shenShaList.filter(s => !isBasic(s.name)))
</script>

<template>
  <div v-if="shenShaList.length > 0" class="flex flex-wrap gap-1.5 justify-center">
    <!-- 基础神煞（鲜艳） -->
    <TagBadge
      v-for="ss in basicList"
      :key="ss.name"
      :name="ss.name"
      :type="ss.type"
    />
    <!-- 折叠的普通神煞（灰色） -->
    <template v-if="showAll">
      <span
        v-for="ss in extraList"
        :key="ss.name"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border border-slate-700/30 bg-slate-800/30 text-slate-500"
      >
        {{ ss.name }}
      </span>
    </template>
    <!-- 展开按钮 -->
    <button
      v-if="extraList.length > 0"
      @click="showAll = !showAll"
      class="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-slate-600/50 text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors"
    >
      {{ showAll ? '−' : `+${extraList.length}` }}
    </button>
  </div>
  <div v-else class="text-center text-[10px] text-cosmic-muted">
    无特殊神煞
  </div>
</template>
