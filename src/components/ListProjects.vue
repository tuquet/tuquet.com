<script setup lang="ts">
import { computed } from 'vue'
import defaultData from '~/data/projects-data.json'
import { siteLang } from '~/logics'

interface ProjectItem {
  name: string
  repo: string
  url: string
  link: string
  homepage?: string | null
  description: string
  desc?: string
  icon: string
  stars: number
  forks: number
  language?: string | null
  topics: string[]
  category: string
  isArchived: boolean
}

const VI_CATEGORY: Record<string, string> = {
  'Operon Ecosystem': 'Hệ sinh thái Operon',
  'Tools & Web Apps': 'Công cụ & Ứng dụng Web',
}

const VI_DESC: Record<string, string> = {
  'tuquet/operon': 'Nền tảng runtime tự động hóa local-first và console trình duyệt antidetect kết hợp core (Rust), console (Vue 3 / Tauri v2) và control plane Supabase',
  'tuquet/core': 'Engine Rust chạy trực tiếp trên thiết bị (opn CLI, daemon :8765, runtime SQLite, trình quản lý driver Chromium antidetect và MCP stdio server)',
  'tuquet/console': 'Không gian làm việc micro-app và ứng dụng desktop Tauri v2 xây dựng với Vue 3, Shadcn UI, TanStack Query và @operon/kernel',
  'tuquet/id': 'Nền tảng Định danh, Xác thực và Quản lý Quyền (Entitlements) tập trung',
  'tuquet/storage': 'Hệ thống lưu trữ đám mây đa tenant: Cloudflare Pages + D1 + R2 + WebDAV đồng bộ hồ sơ trình duyệt antidetect & media',
  'tuquet/skills-pack': 'Thư viện tuyển chọn các agent skill AI và runbook tự động hóa chuẩn production theo tiêu chuẩn Ponytail',
  'tuquet/yak-map': 'Bản đồ kiến trúc trực quan tương tác giúp phân rã các phụ thuộc monorepo và luồng dữ liệu',
  'tuquet/releases': 'Dashboard theo dõi và phân phối bản phát hành tự động cho các phần mềm và công cụ mã nguồn mở',
  'tuquet/store': 'Nền tảng thương mại điện tử Medusa v2 với Storefront Next.js và Docker',
  'tuquet/kernel': 'Thư viện kernel nhẹ điều phối giao tiếp micro-app, sandbox và điều khiển host shell',
}

function getCategoryTitle(key: string) {
  return siteLang.value === 'vi' ? (VI_CATEGORY[key] || key) : key
}

function getItemDescription(item: ProjectItem) {
  if (siteLang.value === 'vi' && item.repo && VI_DESC[item.repo])
    return VI_DESC[item.repo]
  return item.description || item.desc
}

const props = defineProps<{
  projects?: Record<string, ProjectItem[]>
}>()

// Use prop projects if passed, otherwise default to generated projectsData
const projects = computed<Record<string, ProjectItem[]>>(() => {
  if (props.projects && Object.keys(props.projects).length > 0)
    return props.projects
  return (defaultData.categories as unknown as Record<string, ProjectItem[]>) || {}
})

function slug(name: string) {
  return name.toLowerCase().replace(/[\s\\/]+/g, '-')
}
</script>

<template>
  <div class="max-w-[var(--prose-max-width)] mx-auto">
    <p class="mt--4 mb-6 op60 text-base sm:text-lg">
      {{ siteLang === 'vi'
        ? 'Nền tảng mã nguồn mở, runtime ưu tiên cục bộ (local-first) và các ứng dụng web cho lập trình viên.'
        : 'Open-source platforms, local-first runtimes, and developer web applications.' }}
    </p>

    <!-- Quick Links Bar -->
    <div class="flex flex-wrap items-center gap-2 mb-10">
      <a
        href="https://github.com/tuquet"
        target="_blank"
        rel="noopener noreferrer"
        class="group btn-blue inline-flex items-center gap-1.5 text-sm"
      >
        <div
          i-ph-github-logo-duotone
          group-hover="i-ph-github-logo-fill text-blue"
        />
        <span>GitHub</span>
      </a>
      <a
        href="https://yakmap.tuquet.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="group btn-lime inline-flex items-center gap-1.5 text-sm"
      >
        <div
          i-ph-cow-duotone
          group-hover="i-ph-cow-duotone-fill text-lime"
        />
        <span>Yak Map</span>
      </a>
      <a
        href="https://release.tuquet.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="group btn-amber inline-flex items-center gap-1.5 text-sm"
      >
        <div
          i-ph-rocket-launch-duotone
          group-hover="i-ph-rocket-launch-fill text-amber"
        />
        <span>Releases</span>
      </a>
    </div>

    <!-- Category Sections -->
    <section
      v-for="key, cidx in Object.keys(projects)"
      :key="key"
      class="mb-12 slide-enter"
      :style="{ '--enter-stage': cidx + 1 }"
    >
      <div
        :id="slug(key)"
        class="flex items-baseline justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5 mb-5"
      >
        <h2 class="text-sm font-mono uppercase tracking-widest font-semibold text-zinc-700 dark:text-zinc-300 m-0">
          {{ getCategoryTitle(key) }}
        </h2>
        <span class="text-xs font-mono op45">
          {{ projects[key].length }} {{ siteLang === 'vi' ? 'dự án' : 'repos' }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item, idx in projects[key]"
          :key="idx"
          class="group relative flex flex-col justify-between p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-all duration-200"
        >
          <!-- Main Link Area -->
          <a
            :href="item.url || item.link"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-start gap-3.5 flex-auto no-underline! color-inherit"
            :title="item.name"
          >
            <!-- Project Icon -->
            <div v-if="item.icon" class="pt-0.5 shrink-0">
              <img
                v-if="item.icon.startsWith('http') || item.icon.startsWith('/')"
                :src="item.icon"
                :alt="`${item.name} logo`"
                class="w-7 h-7 object-contain rounded transition-transform duration-200 group-hover:scale-105"
              >
              <div
                v-else
                class="text-2xl opacity-65 transition-transform duration-200 group-hover:scale-105 group-hover:opacity-90"
                :class="item.icon || 'i-carbon-unknown'"
              />
            </div>

            <!-- Content Area -->
            <div class="flex-auto min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">{{ item.name }}</span>
                <!-- Star count badge if > 0 -->
                <span
                  v-if="item.stars && item.stars > 0"
                  class="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.2 rounded-full border border-base op65 shrink-0"
                  title="GitHub Stars"
                >
                  <div class="i-carbon-star text-amber text-[10px]" />
                  {{ item.stars }}
                </span>
                <!-- Archived Badge -->
                <span
                  v-if="item.isArchived"
                  class="text-[10px] px-1.5 py-0.2 rounded border border-base/40 op40 uppercase font-mono tracking-wide ml-auto"
                >
                  {{ siteLang === 'vi' ? 'đã lưu trữ' : 'archived' }}
                </span>
              </div>
              <p class="text-xs opacity-65 font-normal mt-1.5 leading-relaxed line-clamp-3 m-0">
                {{ getItemDescription(item) }}
              </p>
            </div>
          </a>

          <!-- Footer Meta: Language / Topics / Live Link -->
          <div class="flex items-center justify-between gap-2 mt-3.5 pt-2.5 border-t border-zinc-200/50 dark:border-zinc-800/60">
            <div class="flex flex-wrap items-center gap-1.5 min-w-0">
              <span
                v-if="item.language"
                class="text-[10.5px] px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-mono"
              >
                {{ item.language }}
              </span>
              <span
                v-for="t in (item.topics || []).slice(0, 2)"
                :key="t"
                class="text-[10.5px] op45 font-mono select-none truncate"
              >
                #{{ t }}
              </span>
            </div>
            <a
              v-if="item.homepage"
              :href="item.homepage"
              target="_blank"
              rel="noopener noreferrer"
              class="shrink-0 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline no-underline!"
              :title="siteLang === 'vi' ? `Mở trực tuyến ${item.name}` : `Open ${item.name} live`"
            >
              {{ siteLang === 'vi' ? 'trực tuyến' : 'live' }} &nearr;
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Links -->
    <div class="prose pb-5 mx-auto mt-8 text-center">
      <a href="https://github.com/tuquet" target="_blank" rel="noopener noreferrer" class="op55 hover:op90 text-sm">
        {{ siteLang === 'vi' ? 'Khám phá toàn bộ kho mã nguồn trên GitHub @tuquet' : 'Explore all repositories on GitHub @tuquet' }} &rarr;
      </a>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
