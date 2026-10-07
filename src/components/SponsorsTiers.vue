<script setup lang="ts">
import { sponsors } from '../data/sponsors-data'

const specialItems = computed(() => sponsors.filter((c: any) => c.tier === 'special'))
const platinumItems = computed(() => sponsors.filter((c: any) => c.tier === 'platinum'))
const ecosystemItems = computed(() => sponsors.filter((c: any) => c.tier === 'ecosystem'))
const techItems = computed(() => sponsors.filter((c: any) => c.tier === 'tech'))
</script>

<template>
  <div class="max-w-260 mx-auto py-4 text-left">
    <!-- Section 1: Special Sponsors -->
    <div class="mb-14">
      <div select-none relative h18 mt2 pointer-events-none>
        <span text-5em color-transparent absolute left--1rem top-0rem font-bold leading-1em text-stroke-1.5 text-stroke-hex-aaa op35 dark:op20>SPECIAL</span>
      </div>
      <div class="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-3 tracking-wide uppercase">
        Special Sponsors
      </div>
      <div class="flex flex-col gap-4 mt-2">
        <component
          :is="item.link.startsWith('http') ? 'a' : 'RouterLink'"
          v-for="item in specialItems"
          :key="item.id"
          class="p-4 sm:p-5 rounded-xl border border-base hover:bg-[#8888880e] transition-all flex items-start gap-4 no-underline!"
          v-bind="item.link.startsWith('http') ? { href: item.link, target: '_blank', rel: 'noopener noreferrer' } : { to: item.link }"
        >
          <div class="w-14 h-14 shrink-0 rounded-xl border border-base bg-white dark:bg-zinc-900 p-2 flex items-center justify-center">
            <img :src="item.logo" :alt="item.name" class="w-full h-full object-contain rounded-lg">
          </div>
          <div class="flex-auto min-w-0">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ item.name }}</div>
              <span v-if="item.timeline" class="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">{{ item.timeline }}</span>
            </div>
            <div v-if="item.domain" class="text-xs font-medium text-amber-600 dark:text-amber-400 mt-0.5 font-mono">{{ item.domain }}</div>
            <p class="text-xs sm:text-sm op70 mt-1.5 leading-relaxed">{{ item.desc }}</p>
            <div v-if="item.tags" class="flex flex-wrap gap-1.5 mt-2.5">
              <span v-for="tag in item.tags" :key="tag" class="text-[10.5px] px-2 py-0.2 rounded bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 font-mono">
                {{ tag }}
              </span>
            </div>
          </div>
        </component>
      </div>
    </div>

    <!-- Section 2: Platinum Sponsors -->
    <div class="mb-14">
      <div select-none relative h18 mt2 pointer-events-none>
        <span text-5em color-transparent absolute left--1rem top-0rem font-bold leading-1em text-stroke-1.5 text-stroke-hex-aaa op35 dark:op20>PLATINUM</span>
      </div>
      <div class="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-3 tracking-wide uppercase">
        Platinum Sponsors
      </div>
      <div class="flex flex-col gap-4 mt-2">
        <component
          :is="item.link.startsWith('http') ? 'a' : 'RouterLink'"
          v-for="item in platinumItems"
          :key="item.id"
          class="p-4 sm:p-5 rounded-xl border border-base hover:bg-[#8888880e] transition-all flex items-start gap-4 no-underline!"
          v-bind="item.link.startsWith('http') ? { href: item.link, target: '_blank', rel: 'noopener noreferrer' } : { to: item.link }"
        >
          <div class="w-14 h-14 shrink-0 rounded-xl border border-base bg-white dark:bg-zinc-900 p-2 flex items-center justify-center">
            <img :src="item.logo" :alt="item.name" class="w-full h-full object-contain rounded-lg">
          </div>
          <div class="flex-auto min-w-0">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ item.name }}</div>
              <span v-if="item.timeline" class="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">{{ item.timeline }}</span>
            </div>
            <div v-if="item.domain" class="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">{{ item.domain }}</div>
            <p class="text-xs sm:text-sm op70 mt-1.5 leading-relaxed">{{ item.desc }}</p>
            <div v-if="item.tags" class="flex flex-wrap gap-1.5 mt-2.5">
              <span v-for="tag in item.tags" :key="tag" class="text-[10.5px] px-2 py-0.2 rounded bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 font-mono">
                {{ tag }}
              </span>
            </div>
          </div>
        </component>
      </div>
    </div>

    <!-- Section 3: Open Source Tooling Ecosystem -->
    <div class="mb-14">
      <div select-none relative h18 mt2 pointer-events-none>
        <span text-5em color-transparent absolute left--1rem top-0rem font-bold leading-1em text-stroke-1.5 text-stroke-hex-aaa op35 dark:op20>ECOSYSTEM</span>
      </div>
      <div class="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-3 tracking-wide uppercase">
        Ecosystem Backers &amp; Infrastructure
      </div>
      <div grid="~ cols-1 sm:cols-2 md:cols-4 gap-3.5" class="mt-2">
        <component
          :is="item.link.startsWith('http') ? 'a' : 'RouterLink'"
          v-for="item in ecosystemItems"
          :key="item.id"
          class="p-3.5 rounded-lg border border-base hover:bg-[#8888880e] transition-all flex items-center gap-3 no-underline!"
          v-bind="item.link.startsWith('http') ? { href: item.link, target: '_blank', rel: 'noopener noreferrer' } : { to: item.link }"
        >
          <div class="w-10 h-10 shrink-0 rounded-md border border-base bg-white dark:bg-zinc-900 p-1 flex items-center justify-center">
            <img :src="item.logo" :alt="item.name" class="w-full h-full object-contain rounded-sm">
          </div>
          <div class="flex-auto min-w-0">
            <div class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{{ item.name }}</div>
            <div class="text-[11px] op60 font-mono truncate">{{ item.domain || 'Open Source' }}</div>
          </div>
        </component>
      </div>
    </div>

    <!-- Section 4: Core Technologies -->
    <div class="mb-8">
      <div select-none relative h18 mt2 pointer-events-none>
        <span text-5em color-transparent absolute left--1rem top-0rem font-bold leading-1em text-stroke-1.5 text-stroke-hex-aaa op35 dark:op20>TECHNOLOGIES</span>
      </div>
      <div class="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-3 tracking-wide uppercase">
        Core Technologies &amp; Cloud Runtimes
      </div>
      <div class="flex flex-wrap gap-2 mt-2">
        <a
          v-for="item in techItems"
          :key="item.id"
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-base hover:bg-[#88888812] transition-colors text-xs text-zinc-700 dark:text-zinc-300 no-underline!"
          :title="item.name"
        >
          <img :src="item.logo" :alt="item.name" class="w-4 h-4 object-contain rounded-full">
          <span>{{ item.name }}</span>
        </a>
      </div>
    </div>
  </div>
</template>
