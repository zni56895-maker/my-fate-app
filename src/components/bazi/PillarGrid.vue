<script setup lang="ts">
import type { PillarData } from '@/types/bazi'
import PillarCard from './PillarCard.vue'

defineProps<{
  pillars: PillarData[]
}>()
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
    <PillarCard
      v-for="pillar in pillars"
      :key="pillar.pillarType"
      :pillar="pillar"
    />
  </div>
</template>
