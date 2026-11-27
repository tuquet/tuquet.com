<script setup lang="ts">
import { siteLang } from '~/logics'
import { sponsors } from '../data/sponsors-data'

const companyItems = computed(() => sponsors.filter(c => c.tier === 'company'))
const clientItems = computed(() => sponsors.filter(c => c.tier === 'client'))

const cardSections = computed(() => [
  {
    watermark: siteLang.value === 'vi' ? 'DOANH NGHIỆP' : 'COMPANIES',
    title: siteLang.value === 'vi' ? 'Doanh nghiệp & Đội ngũ Kỹ thuật' : 'Companies & Engineering Teams',
    domainClass: 'text-amber-600 dark:text-amber-400',
    items: companyItems.value,
  },
  {
    watermark: siteLang.value === 'vi' ? 'KHÁCH HÀNG' : 'CLIENTS',
    title: siteLang.value === 'vi' ? 'Sản phẩm Khách hàng & Triển khai Doanh nghiệp' : 'Client Products & Enterprise Delivery',
    domainClass: 'text-emerald-600 dark:text-emerald-400',
    items: clientItems.value,
  },
])
</script>

<template>
  <div class="max-w-[var(--prose-max-width)] mx-auto py-4 text-left">
    <div v-for="section in cardSections" :key="section.watermark" class="mb-14">
      <div select-none relative h18 mt2 pointer-events-none>
        <span text-5em color-transparent absolute left--1rem top-0rem font-bold leading-1em text-stroke-1.5 text-stroke-hex-aaa op35 dark:op20>{{ section.watermark }}</span>
      </div>
      <div class="text-xs text-zinc-500 dark:text-zinc-400 mb-3 tracking-wide uppercase">
        {{ section.title }}
      </div>
      <div class="flex flex-col gap-4 mt-2">
        <component
          :is="item.link?.startsWith('http') ? 'a' : 'RouterLink'"
          v-for="item in section.items"
          :key="item.id"
          class="p-4 sm:p-5 rounded-xl border border-base hover:bg-[#8888880e] transition-all flex items-start gap-4 no-underline!"
          v-bind="item.link?.startsWith('http') ? { href: item.link, target: '_blank', rel: 'noopener noreferrer' } : { to: item.link || '/clients' }"
        >
          <div class="w-14 h-14 shrink-0 rounded-xl border border-base bg-white dark:bg-zinc-900 p-2 flex items-center justify-center">
            <img :src="item.logo" :alt="item.name" class="w-full h-full object-contain rounded-lg">
          </div>
          <div class="flex-auto min-w-0">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ item.name }}</div>
              <div class="flex flex-wrap items-center gap-1.5">
                <span v-if="item.role" class="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-mono">{{ item.role }}</span>
                <span v-if="item.via" class="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100/70 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 border border-base font-mono">{{ siteLang === 'vi' && item.viaVi ? item.viaVi : item.via }}</span>
                <span v-if="item.timeline" class="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">{{ siteLang === 'vi' && item.timelineVi ? item.timelineVi : item.timeline }}</span>
              </div>
            </div>
            <div v-if="item.domain" class="text-xs font-medium mt-0.5 font-mono" :class="section.domainClass">{{ siteLang === 'vi' && item.domainVi ? item.domainVi : item.domain }}</div>
            <p class="text-xs sm:text-sm op70 mt-1.5 leading-relaxed">{{ siteLang === 'vi' && item.descVi ? item.descVi : item.desc }}</p>
            <div v-if="item.tags" class="flex flex-wrap gap-1.5 mt-2.5">
              <span v-for="tag in item.tags" :key="tag" class="text-[10.5px] px-2 py-0.2 rounded bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 font-mono">
                {{ tag }}
              </span>
            </div>
          </div>
        </component>
      </div>
    </div>
  </div>
</template>
