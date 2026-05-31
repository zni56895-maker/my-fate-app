<script setup lang="ts">
import type { ShenShaResult } from '@/types/bazi'
import TagBadge from '@/components/shared/TagBadge.vue'

defineProps<{
  shenShaList: ShenShaResult[]
}>()
</script>

<template>
  <div v-if="shenShaList.length > 0" class="flex flex-wrap gap-1.5 justify-center">
    <TagBadge
      v-for="ss in shenShaList"
      :key="ss.name"
      :name="ss.name"
      :type="ss.type"
    />
  </div>
  <div v-else class="text-center text-[10px] text-cosmic-muted">
    无特殊神煞
  </div>
</template>
