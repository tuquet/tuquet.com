<script setup lang="ts">
import { computed, ref } from 'vue'
import defaultData from '~/data/projects-data.json'

interface ProjectItem {
  name: string
  repo?: string
  link: string
  githubUrl?: string
  desc: string
  icon: string
  stars?: number
  forks?: number
  language?: string | null
  topics?: string[]
  category?: string
}

const props = defineProps<{
  projects?: Record<string, ProjectItem[]>
}>()

const searchQuery = ref('')
const selectedTopic = ref<string>('all')

// Use prop projects if passed, otherwise default to generated projectsData
const baseProjects = computed<Record<string, ProjectItem[]>>(() => {
  if (props.projects && Object.keys(props.projects).length > 0)
    return props.projects
  return (defaultData.categories as unknown as Record<string, ProjectItem[]>) || {}
})

// Curated highlight topic pills
const highlightedTopics = [
  { label: 'All', value: 'all' },
  { label: 'Rust', value: 'rust' },
  { label: 'Vue 3', value: 'vue3' },
  { label: 'AI & Agents', value: 'ai' },
  { label: 'Automation', value: 'automation' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Cloudflare', value: 'cloudflare' },
  { label: 'Supabase', value: 'supabase' },
]

function slug(name: string) {
  return name.toLowerCase().replace(/[\s\\/]+/g, '-')
}

function selectTopic(topic: string) {
  selectedTopic.value = selectedTopic.value === topic ? 'all' : topic
}

// Filtered projects by search query and topic
const filteredProjects = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const topicFilter = selectedTopic.value.toLowerCase()

  const result: Record<string, ProjectItem[]> = {}

  for (const [category, items] of Object.entries(baseProjects.value)) {
    const matched = items.filter((item) => {
      // Topic filter check
      if (topicFilter !== 'all') {
        const itemTopics = (item.topics || []).map(t => t.toLowerCase())
        const itemLang = (item.language || '').toLowerCase()
        const matchesTopic = itemTopics.some(t => t.includes(topicFilter))
          || itemLang.includes(topicFilter)
          || (topicFilter === 'ai' && (itemTopics.includes('agent-skills') || itemTopics.includes('claude') || itemTopics.includes('antigravity')))
          || (topicFilter === 'vue3' && (itemTopics.includes('vue') || itemLang === 'vue'))
          || (topicFilter === 'cloudflare' && (itemTopics.includes('cloudflare-workers') || itemTopics.includes('cloudflare')))
        if (!matchesTopic) return false
      }

      // Search query check
      if (!query) return true

      const nameMatch = item.name.toLowerCase().includes(query)
      const descMatch = (item.desc || '').toLowerCase().includes(query)
      const langMatch = (item.language || '').toLowerCase().includes(query)
      const topicMatch = (item.topics || []).some(t => t.toLowerCase().includes(query))

      return nameMatch || descMatch || langMatch || topicMatch
    })

    if (matched.length > 0) {
      result[category] = matched
    }
  }

  return result
})

const totalVisibleCount = computed(() => {
  return Object.values(filteredProjects.value).reduce((acc, list) => acc + list.length, 0)
})

const totalProjectsCount = computed(() => {
  return Object.values(baseProjects.value).reduce((acc, list) => acc + list.length, 0)
})
</script>

<template>
  <div class="max-w-300 mx-auto">
    <p text-center mt--6 mb5 op50 text-lg italic>
      Open-source architecture, ecosystem mesh, and developer tooling.
    </p>

    <!-- Quick Links Bar -->
    <div class="prose pb4 mx-auto mt8 text-center">
      <div flex="~ gap-2 justify-center flex-wrap">
        <a
          href="https://github.com/tuquet"
          target="_blank"
          class="group btn-blue inline-block"
        >
          <div
            i-ph-github-logo-duotone
            group-hover="i-ph-github-logo-fill text-blue"
          />
          GitHub @tuquet
        </a>
        <a
          href="https://release.tuquet.com"
          target="_blank"
          class="group btn-amber inline-block"
        >
          <div
            i-ph-rocket-launch-duotone
            group-hover="i-ph-rocket-launch-fill text-amber"
          />
          Recent Releases
        </a>
        <a
          href="https://yakmap.tuquet.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="group btn-lime inline-block"
        >
          <div
            i-ph-cow-duotone
            group-hover="i-ph-cow-duotone-fill text-lime"
          />
          Yak Map
        </a>
      </div>
      <hr>
    </div>

    <!-- Interactive Search & Topic Filter Section -->
    <div class="my-6 max-w-200 mx-auto px-4">
      <!-- Search Input -->
      <div class="relative flex items-center mb-4">
        <div class="absolute left-3.5 text-base op40 i-carbon-search pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter projects by name, keyword, or tech stack..."
          class="w-full pl-10 pr-9 py-2 text-sm rounded-lg border border-base bg-transparent transition-all outline-none focus:(border-primary ring-1 ring-primary/30)"
        >
        <button
          v-if="searchQuery"
          class="absolute right-3 text-sm op40 hover:op80 transition-opacity"
          title="Clear search"
          @click="searchQuery = ''"
        >
          <div i-carbon-close />
        </button>
      </div>

      <!-- Topic Filter Pills -->
      <div class="flex flex-wrap items-center justify-center gap-1.5 text-xs">
        <button
          v-for="topic in highlightedTopics"
          :key="topic.value"
          class="px-2.5 py-1 rounded-full border transition-all cursor-pointer select-none"
          :class="selectedTopic === topic.value
            ? 'bg-neutral-800 text-white border-neutral-700 dark:(bg-neutral-200 text-black border-white) font-medium shadow-sm'
            : 'border-base op60 hover:(op100 bg-neutral-500/10)'"
          @click="selectTopic(topic.value)"
        >
          {{ topic.label }}
        </button>
      </div>

      <!-- Match counter when filtered -->
      <div
        v-if="searchQuery || selectedTopic !== 'all'"
        class="mt-3 text-center text-xs op50"
      >
        Showing {{ totalVisibleCount }} of {{ totalProjectsCount }} projects
        <button
          class="ml-2 underline op70 hover:op100 cursor-pointer"
          @click="searchQuery = ''; selectedTopic = 'all'"
        >
          Reset filters
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="totalVisibleCount === 0"
      class="py-16 text-center op50"
    >
      <div class="text-4xl mb-2 i-carbon-search-locate inline-block" />
      <p>No projects match your filter criteria.</p>
      <button
        class="mt-3 px-3 py-1 text-sm border border-base rounded hover:bg-neutral-500/10 cursor-pointer"
        @click="searchQuery = ''; selectedTopic = 'all'"
      >
        Clear filters
      </button>
    </div>

    <!-- Category Sections -->
    <div
      v-for="key, cidx in Object.keys(filteredProjects)"
      :key="key"
      slide-enter
      :style="{ '--enter-stage': cidx + 1 }"
    >
      <div
        :id="slug(key)"
        select-none relative h18 mt5 pointer-events-none slide-enter
        :style="{
          '--enter-stage': cidx - 2,
          '--enter-step': '60ms',
        }"
      >
        <span
          text-5em color-transparent absolute left--1rem top-0rem font-bold leading-1em
          text-stroke-1.5 text-stroke-hex-aaa op35 dark:op20
        >
          {{ key }}
        </span>
      </div>

      <div
        class="project-grid py-2 max-w-500 w-full sm:w-max mx-auto"
        grid="~ cols-1 md:cols-2 gap-4 lg:cols-3"
      >
        <div
          v-for="item, idx in filteredProjects[key]"
          :key="idx"
          class="item relative flex flex-col justify-between"
        >
          <component
            :is="item.link.startsWith('http') ? 'a' : 'RouterLink'"
            class="flex items-start flex-auto no-underline! color-inherit"
            v-bind="item.link.startsWith('http') ? {
              href: item.link,
              target: '_blank',
              rel: 'noopener noreferrer',
            } : {
              to: item.link,
            }"
            :title="item.name"
          >
            <!-- Project Icon -->
            <div v-if="item.icon" class="pt-1.5 pr-4 shrink-0">
              <div
                class="text-3xl opacity-60 transition-transform duration-200 group-hover:scale-110"
                :class="item.icon || 'i-carbon-unknown'"
              />
            </div>

            <!-- Content -->
            <div class="flex-auto min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-base font-semibold">{{ item.name }}</span>
                <!-- Star count badge if > 0 -->
                <span
                  v-if="item.stars && item.stars > 0"
                  class="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.2 rounded-full border border-base op70"
                  title="GitHub Stars"
                >
                  <div class="i-carbon-star text-amber text-[10px]" />
                  {{ item.stars }}
                </span>
                <!-- Language badge -->
                <span
                  v-if="item.language"
                  class="text-[10px] px-1.5 py-0.2 rounded border border-base/40 op40 uppercase tracking-wide ml-auto font-mono"
                >
                  {{ item.language }}
                </span>
              </div>
              <div class="desc text-xs opacity-60 font-normal mt-1 leading-relaxed" v-html="item.desc" />
            </div>
          </component>

          <!-- Topics Pill List (Clickable to Filter) -->
          <div
            v-if="item.topics && item.topics.length > 0"
            class="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-base/20"
          >
            <button
              v-for="t in item.topics.slice(0, 4)"
              :key="t"
              class="text-[10px] px-1.5 py-0.2 rounded bg-neutral-500/10 op50 hover:op100 transition-opacity cursor-pointer border-none font-mono"
              :title="`Filter by topic: ${t}`"
              @click.stop="selectTopic(t)"
            >
              #{{ t }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Links -->
    <div class="prose pb5 mx-auto mt12 text-center">
      <div block mt-5>
        <a href="https://github.com/tuquet" target="_blank" op50>
          Explore all open repositories on GitHub @tuquet
        </a>
      </div>
    </div>
  </div>

  <!-- Dynamic Table of Contents (TOC) -->
  <div>
    <div class="table-of-contents">
      <div class="table-of-contents-anchor">
        <div class="i-ri-menu-2-fill" />
      </div>
      <ul>
        <li v-for="key of Object.keys(filteredProjects)" :key="key">
          <a :href="`#${slug(key)}`">{{ key }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.project-grid .item {
  background: transparent;
  width: 350px;
  max-width: 100%;
  padding: 0.75rem 0.875rem;
  border-radius: 8px;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}

.project-grid .item:hover {
  background: #8888880f;
  border-color: #88888820;
}
</style>
