<script setup lang="ts">
// 全屏暗黑六芒星背景 — 纯CSS+SVG
</script>

<template>
  <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <!-- 同心圆轨道 -->
    <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#a855f7" stop-opacity="0.06" />
          <stop offset="100%" stop-color="#a855f7" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- 同心圆 -->
      <circle cx="50%" cy="50%" r="15%" fill="none" stroke="#a855f7" stroke-width="0.3" opacity="0.15" />
      <circle cx="50%" cy="50%" r="25%" fill="none" stroke="#a855f7" stroke-width="0.3" opacity="0.12" />
      <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#a855f7" stroke-width="0.3" opacity="0.09" />
      <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#a855f7" stroke-width="0.3" opacity="0.06" />
      <circle cx="50%" cy="50%" r="55%" fill="none" stroke="#a855f7" stroke-width="0.3" opacity="0.04" />
      <!-- 六芒星 -->
      <g transform="translate(50%,50%)" opacity="0.04">
        <polygon :points="hexagramPoints(0,15)" fill="none" stroke="#a855f7" stroke-width="0.5" />
        <polygon :points="hexagramPoints(30,15)" fill="none" stroke="#a855f7" stroke-width="0.5" />
      </g>
      <circle cx="50%" cy="50%" r="50%" fill="url(#glowGrad)" />
    </svg>
    <!-- 漂浮粒子 -->
    <div class="absolute top-[15%] left-[10%] w-2 h-2 rounded-full bg-purple-400/20 blur-[1px] animate-[float_6s_ease-in-out_infinite]" />
    <div class="absolute top-[60%] left-[85%] w-1.5 h-1.5 rounded-full bg-purple-400/15 blur-[1px] animate-[float_8s_ease-in-out_infinite_1s]" />
    <div class="absolute top-[25%] left-[75%] w-1 h-1 rounded-full bg-purple-300/20 blur-[1px] animate-[float_7s_ease-in-out_infinite_2s]" />
    <div class="absolute top-[70%] left-[20%] w-2 h-2 rounded-full bg-purple-500/10 blur-[1px] animate-[float_9s_ease-in-out_infinite_0.5s]" />
    <div class="absolute top-[40%] left-[50%] w-1.5 h-1.5 rounded-full bg-purple-300/15 blur-[1px] animate-[float_5s_ease-in-out_infinite_3s]" />
    <div class="absolute top-[80%] left-[60%] w-1 h-1 rounded-full bg-purple-400/20 blur-[1px] animate-[float_10s_ease-in-out_infinite_1.5s]" />
    <div class="absolute top-[10%] left-[40%] w-1 h-1 rounded-full bg-purple-300/12 blur-[1px] animate-[float_7.5s_ease-in-out_infinite_4s]" />
    <div class="absolute top-[50%] left-[5%] w-1.5 h-1.5 rounded-full bg-purple-500/12 blur-[1px] animate-[float_6.5s_ease-in-out_infinite_2.5s]" />
  </div>
</template>

<script lang="ts">
function hexagramPoints(rotation: number, size: number): string {
  const points: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (rotation + i * 60) * Math.PI / 180
    const r = i % 2 === 0 ? size : size * 0.45
    points.push(`${Math.cos(angle)*r},${Math.sin(angle)*r}`)
  }
  return points.join(' ')
}
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
  50% { transform: translateY(-20px) scale(1.3); opacity: 0.9; }
}
</style>
