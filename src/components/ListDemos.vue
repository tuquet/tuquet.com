<script setup lang="ts">
const demos = [
  {
    title: 'Automa Pipeline Visualizer',
    category: 'Workflow Orchestration',
    color: 'text-sky-500',
    hoverBorder: 'hover:border-sky-500/50',
    hoverBg: 'hover:bg-sky-500/5',
    hoverText: 'group-hover:text-sky-500',
    desc: 'Interactive 2D canvas pipeline simulator illustrating real-time distributed DAG execution, state transitions, and step retries.',
    tags: ['Canvas 2D', 'State Machine', 'Live Demo'],
    link: 'https://tuquet.github.io/automa/pipeline.html',
    external: true,
  },
  {
    title: 'Telegram ChatOps & Server Monitor',
    category: 'ChatOps & Automation',
    color: 'text-emerald-500',
    hoverBorder: 'hover:border-emerald-500/50',
    hoverBg: 'hover:bg-emerald-500/5',
    hoverText: 'group-hover:text-emerald-500',
    desc: 'Mobile ChatOps bot built with Node.js and GrammY for GitHub Actions CI/CD dispatch and real-time server health monitoring.',
    tags: ['Node.js', 'GrammY', 'ChatOps'],
    link: '/posts/telegram-chatops-vps-monitoring',
    external: false,
  },
  {
    title: 'EV Telemetry Monitor Architecture',
    category: 'IoT Telemetry Streaming',
    color: 'text-amber-500',
    hoverBorder: 'hover:border-amber-500/50',
    hoverBg: 'hover:bg-amber-500/5',
    hoverText: 'group-hover:text-amber-500',
    desc: 'Architectural blueprint for real-time WebSocket vehicle telemetry streaming, Redis pub/sub backplanes, and 60fps canvas monitors.',
    tags: ['WebSockets', 'Redis Pub/Sub', 'Architecture'],
    link: '/posts/telemetry-architecture-100k-evs',
    external: false,
  },
  {
    title: 'Enterprise Vue UI Storybook',
    category: 'Design System & Data Grid',
    color: 'text-rose-500',
    hoverBorder: 'hover:border-rose-500/50',
    hoverBg: 'hover:bg-rose-500/5',
    hoverText: 'group-hover:text-rose-500',
    desc: 'Live interactive documentation for @tuquet/vue-table and @tuquet/vue-ui packages with virtualized high-density table views.',
    tags: ['Storybook', 'TanStack Table', 'Vue 3'],
    link: 'https://tuquet.github.io/lib/',
    external: true,
  },
]
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 not-prose mt-6">
    <a
      v-for="demo in demos"
      :key="demo.title"
      :href="demo.link"
      :target="demo.external ? '_blank' : undefined"
      :rel="demo.external ? 'noopener' : undefined"
      class="group block p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 transition duration-300 no-underline"
      :class="[demo.hoverBorder, demo.hoverBg]"
    >
      <div class="flex items-center justify-between mb-2 sm:mb-3">
        <span class="text-xs font-mono uppercase tracking-wider font-semibold" :class="demo.color">
          {{ demo.category }}
        </span>
        <span class="text-xs op50 group-hover:translate-x-1 transition-transform">&rarr;</span>
      </div>
      <h3 class="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 transition-colors" :class="demo.hoverText">
        {{ demo.title }}
      </h3>
      <p class="text-sm op70 leading-relaxed mb-4">
        {{ demo.desc }}
      </p>
      <div class="flex flex-wrap gap-1.5 text-xs op60">
        <span
          v-for="tag in demo.tags"
          :key="tag"
          class="px-2 py-0.5 rounded bg-zinc-200/50 dark:bg-zinc-800/50"
        >
          {{ tag }}
        </span>
      </div>
    </a>
  </div>
</template>
