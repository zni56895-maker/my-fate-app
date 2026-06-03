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
        class="text-white/70 text-xs"
      >
        {{ ss.name }}
      </span>
    </template>
    <!-- 展开按钮 -->
    <button
      v-if="extraList.length > 0"
      @click="showAll = !showAll"
      class="text-xs text-white/40 hover:text-white/70 transition-colors"
    >
      {{ showAll ? '−' : `+${extraList.length}` }}
    </button>
  </div>
  <div v-else class="text-center text-xs text-white/40">
    无特殊神煞
  </div>
</template>
