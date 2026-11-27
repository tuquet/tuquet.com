<script setup lang="ts">
import { resolveDomainFavicon } from '~/data/registry'
import { siteLang } from '~/logics'

interface DemoItem {
  title: string
  titleVi?: string
  category: string
  categoryVi?: string
  color: string
  hoverBorder: string
  hoverBg: string
  hoverText: string
  desc: string
  descVi?: string
  tags: string[]
  tagsVi?: string[]
  link: string
  external: boolean
  logo?: string
}

const demos: DemoItem[] = [
  {
    title: 'Operon Web Console',
    category: 'Micro-App Workstation',
    categoryVi: 'Không gian làm việc Micro-App',
    color: 'text-emerald-500',
    hoverBorder: 'hover:border-emerald-500/50',
    hoverBg: 'hover:bg-emerald-500/5',
    hoverText: 'group-hover:text-emerald-500',
    desc: 'Live web console for the Operon platform: Vue 3, Shadcn UI, and @operon/kernel micro-app host shell unifying automation, workspaces, tasks, and system controls.',
    descVi: 'Web console trực tuyến của nền tảng Operon: Vue 3, Shadcn UI và @operon/kernel micro-app host shell thống nhất tự động hóa, workspace, tác vụ và điều khiển hệ thống.',
    tags: ['Vue 3 / Shadcn UI', '@operon/kernel', 'Supabase', 'Live Web App'],
    tagsVi: ['Vue 3 / Shadcn UI', '@operon/kernel', 'Supabase', 'Ứng dụng Web trực tuyến'],
    link: 'https://console.tuquet.com/',
    external: true,
    logo: resolveDomainFavicon('https://console.tuquet.com/'),
  },
  {
    title: 'Yak Map Dependency Graph',
    titleVi: 'Đồ thị phụ thuộc Yak Map',
    category: 'Interactive Lineage Graph',
    categoryVi: 'Đồ thị luồng phụ thuộc tương tác',
    color: 'text-lime-500',
    hoverBorder: 'hover:border-lime-500/50',
    hoverBg: 'hover:bg-lime-500/5',
    hoverText: 'group-hover:text-lime-500',
    desc: 'Interactive dependency and lineage graph visualizing monorepo packages, open-source services, and relationships across projects.',
    descVi: 'Đồ thị tương tác trực quan hóa các gói monorepo, dịch vụ mã nguồn mở và mối liên hệ kiến trúc giữa các dự án.',
    tags: ['TypeScript', 'Interactive Graph', 'Live Web App'],
    tagsVi: ['TypeScript', 'Đồ thị tương tác', 'Ứng dụng Web trực tuyến'],
    link: 'https://yakmap.tuquet.com/',
    external: true,
  },
  {
    title: 'Operon Releases Dashboard',
    titleVi: 'Bảng điều phối phát hành Operon',
    category: 'Software Distribution',
    categoryVi: 'Phân phối phần mềm',
    color: 'text-amber-500',
    hoverBorder: 'hover:border-amber-500/50',
    hoverBg: 'hover:bg-amber-500/5',
    hoverText: 'group-hover:text-amber-500',
    desc: 'Automated release tracking and distribution dashboard indexing multi-repo CLI, desktop, and tooling builds across the ecosystem.',
    descVi: 'Dashboard theo dõi và phân phối bản phát hành tự động, lập chỉ mục các bản dựng CLI, desktop và công cụ đa repo trong hệ sinh thái.',
    tags: ['TypeScript', 'Release Tracker', 'Live Web App'],
    tagsVi: ['TypeScript', 'Theo dõi phát hành', 'Ứng dụng Web trực tuyến'],
    link: 'https://release.tuquet.com/',
    external: true,
  },
  {
    title: 'Storage Hub',
    category: 'Cloud Storage & WebDAV',
    categoryVi: 'Lưu trữ đám mây & WebDAV',
    color: 'text-sky-500',
    hoverBorder: 'hover:border-sky-500/50',
    hoverBg: 'hover:bg-sky-500/5',
    hoverText: 'group-hover:text-sky-500',
    desc: 'Multi-tenant cloud storage hub powered by Cloudflare Pages, D1, R2, and WebDAV for syncing antidetect browser profiles and media assets.',
    descVi: 'Hệ thống lưu trữ đám mây đa tenant chạy trên Cloudflare Pages, D1, R2 và WebDAV để đồng bộ hồ sơ trình duyệt antidetect và tài nguyên media.',
    tags: ['Cloudflare Pages', 'D1 / R2', 'WebDAV', 'Live Web App'],
    tagsVi: ['Cloudflare Pages', 'D1 / R2', 'WebDAV', 'Ứng dụng Web trực tuyến'],
    link: 'https://storage.tuquet.com/',
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
        <div class="flex items-center gap-2">
          <img
            v-if="demo.logo"
            :src="demo.logo"
            :alt="`${demo.title} logo`"
            class="w-4 h-4 rounded-sm object-contain"
          >
          <span class="text-xs uppercase tracking-wider font-semibold" :class="demo.color">
            {{ siteLang === 'vi' && demo.categoryVi ? demo.categoryVi : demo.category }}
          </span>
        </div>
        <span class="text-xs op50 group-hover:translate-x-1 transition-transform">&rarr;</span>
      </div>
      <h3 class="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 transition-colors" :class="demo.hoverText">
        {{ siteLang === 'vi' && demo.titleVi ? demo.titleVi : demo.title }}
      </h3>
      <p class="text-sm op70 leading-relaxed mb-4">
        {{ siteLang === 'vi' && demo.descVi ? demo.descVi : demo.desc }}
      </p>
      <div class="flex flex-wrap gap-1.5 text-xs op60">
        <span
          v-for="tag in (siteLang === 'vi' && demo.tagsVi ? demo.tagsVi : demo.tags)"
          :key="tag"
          class="px-2 py-0.5 rounded bg-zinc-200/50 dark:bg-zinc-800/50"
        >
          {{ tag }}
        </span>
      </div>
    </a>
  </div>
</template>
