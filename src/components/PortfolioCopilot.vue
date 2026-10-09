<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

interface Message {
  role: 'user' | 'bot'
  text: string
}

const isOpen = ref(false)
const isExpanded = ref(false)
const inputQuery = ref('')
const chatBodyRef = ref<HTMLDivElement>()
const inputRef = ref<HTMLInputElement>()

function getTimeGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning!'
  if (hour >= 12 && hour < 18) return 'Good afternoon!'
  return 'Good evening!'
}

const welcomeGreeting = computed(() => {
  const g = getTimeGreeting()
  return `**${g}** I am Tu Quet's portfolio AI assistant. How can I help you explore his systems architecture, engineering leadership, or background today?`
})

const messages = ref<Message[]>([
  {
    role: 'bot',
    text: welcomeGreeting.value,
  },
])

const knowledge = [
  {
    keys: ['cv', 'resume', 'curriculum vitae', 'profile', 'pdf', 'download cv', 'cv link', 'resume link', 'get cv', 'view cv', 'link to cv', 'download', 'pdf cv', 'experience', 'qualifications'],
    answer: '**Tu Quet\'s Professional Profile & Qualifications:**\n- **Current Role:** Technical Project Lead at CMC Global, directing the real-time Smart EV Telemetry platform and high-scale visitor web portals for **Lotte Group**.\n- **Past Leadership:** CPO & Tech Lead at ICOMM Tech (enterprise Big Data analytics & multi-channel communications platform leading 15+ engineers).\n- **Core Engineering:** Systems programming in **Rust** (Tokio async, Systems Programming) & **Java / Spring Boot**; modern web with **React / Next.js / Vue.js**; real-time telemetry streaming (WebSockets, SSE, Redis).\n- **Engineering Culture:** Clean code advocate, Agile Scrum/Kanban, and AI-augmented SDLC (MCP & LLMs) improving team delivery velocity.\n- **Full Interactive CV:** Explore the complete interactive timeline and project breakdowns at [tuquet.com/cv](https://tuquet.com/cv).\n- Feel free to ask me specific questions about his **EV telemetry streaming**, **process engine**, or **role fit**!',
  },
  {
    keys: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'morning', 'afternoon', 'evening'],
    answer: () => {
      const g = getTimeGreeting()
      return `**${g}** Glad to connect with you. How can I help you explore Tu Quet's engineering background, distributed architecture, or technical leadership today? Feel free to ask or pick a suggestion below!`
    },
  },
  {
    keys: ['nda', 'confidential', 'client name', 'who is the client', 'automotive client', 'car brand', 'source code', 'proprietary'],
    answer: '**Confidentiality & Non-Disclosure (NDA) Notice:**\n- Specific enterprise client identities, proprietary source code, and internal corporate data are protected under **Non-Disclosure Agreements (NDAs)**.\n- Tu Quet welcomes technical deep-dives into **system architecture, WebSocket telemetry streaming, database optimizations, and high-concurrency solutions** he directly engineered, in full compliance with confidentiality standards.',
  },
  {
    keys: ['summary', 'recruiter', 'who', 'about', 'tu quet', 'achievements', 'overview', 'highlights', 'hire', 'background'],
    answer: '**Executive Summary for Recruiters & Hiring Managers:**\n- **Track Record:** 8+ years architecting high-scale distributed backend systems, real-time data streaming engines, and world-class web applications.\n- **Engineering Leadership:** Technical Project Lead leading 3 squads (15+ engineers) delivering enterprise real-time telemetry platforms; former CPO & Tech Lead at ICOMM Tech.\n- **Core Capabilities:** Systems programming in **Rust** (Process Sandboxing, Tokio async) & **Java / Spring Boot**; modern web with **React / Next.js / Vue.js** (Core Web Vitals LCP < 2s, INP < 150ms); real-time telemetry streaming (WebSockets, SSE, Redis).\n- **Product & AI Mindset:** Deep PLG (Product-Led Growth) product discovery coupled with modern AI-augmented SDLC (MCP, LLM toolchains), boosting sprint feature velocity by 25%.\n- **Full CV Link:** [tuquet.com/cv](https://tuquet.com/cv)',
  },
  {
    keys: ['fit', 'role', 'position', 'match', 'suitable', 'openings', 'lead', 'architect', 'scope', 'senior', 'staff', 'principal'],
    answer: '**Role Fit & Ideal Engagement:**\n- **Technical Project Lead / Tech Lead:** Proven capability managing 15+ engineers across multiple squads, driving architecture roadmaps, technical debt governance, and sprint delivery.\n- **Staff / Principal / Senior Software Engineer:** Deep hands-on mastery of distributed backend systems, Rust async runtimes, Java/Spring Boot services, and complex real-time WebSockets.\n- **Solutions Architect:** Designing resilient cloud and hybrid telemetry architectures, Medallion data pipelines, and enterprise micro-frontends.\n- **Working Culture:** Agile Scrum / Kanban, clean code advocate, mentor, and product-first innovator.',
  },
  {
    keys: ['telemetry', 'ev', 'websocket', 'sse', 'realtime', 'streaming', 'fleet', 'automotive'],
    answer: '**Smart EV Telemetry & Fleet Monitoring Architecture:**\n- Tu Quet served as **Technical Project Lead** across 3 squads (15+ engineers) delivering the real-time telemetry streaming platform for smart electric vehicles via CMC Global.\n- Architected a resilient telemetry streaming pipeline (WebSocket/SSE fallback over Redis pub/sub) handling millions of daily EV operational events with sub-100ms latency.\n- Engineered **Virtual Scrolling, Canvas Data Charting, and Debounced State Updates** maintaining 60fps rendering without blocking the Main Thread.\n- Established route & component code splitting keeping INP < 150ms and LCP < 2.0s.',
  },
  {
    keys: ['runner', 'engine', 'zombie', 'chromium', 'crawler', 'rust', 'medallion', 'job object', 'process'],
    answer: '**Distributed Automation & Process Supervision Engine:**\n- Engineered a zero-leakage process supervision core using kernel process tree sandboxing with IO completion ports, completely eliminating zombie Chromium processes.\n- Designed a 3-tier **Medallion architecture** (Bronze raw BLOB gzip -> Silver Rust sanitizer & deduplicator -> Gold Supabase sync) with zero-cost local caching.\n- Authored the CLI in Rust with rustyline auto-completion, distributed via official Scoop bucket: [github.com/tuquet/scoop-bucket](https://github.com/tuquet/scoop-bucket).',
  },
  {
    keys: ['diagram', 'architecture', 'diagrams', 'pipeline', 'storybook', 'archify', 'visual', 'demo', 'showcase', 'live', 'projects', 'yakmap', 'graph'],
    answer: '**Interactive Artifacts & Live Architecture Showcases:**\n- **Yak Map Dependency Graph:** Interactive ecosystem lineage and open-source derivation graph at [yakmap.tuquet.com](https://yakmap.tuquet.com/)\n- **Enterprise UI Component Library:** Live interactive Storybook component lab & virtualized data tables at [storybook.tuquet.com](https://storybook.tuquet.com/)\n- **Specter Architecture Docs:** Multi-pillar stealth browser & process supervisor docs at [specter.tuquet.com](https://specter.tuquet.com/)\n- **Storage Hub:** Multi-tenant Cloudflare Pages + D1 + R2 storage plane at [storage.tuquet.com](https://storage.tuquet.com/)\n- **Recent Releases:** Real-time multi-repo changelog & releases at [release.tuquet.com](https://release.tuquet.com/)',
  },
  {
    keys: ['portal', 'theme park', 'lotte', 'lotte world', 'lotte group', 'booking', 'webview', 'hospitality', 'high-scale web', 'high-traffic'],
    answer: '**High-Scale Web & Booking Portals – Lotte Group:**\n- Tu Quet served as **Lead Frontend Engineer**, building, refactoring, and delivering feature enhancements for high-traffic Visitor Web Portals and Partner Booking WebViews for **Lotte Group (Lotte World Theme Parks & Hospitality)** via CMC Global.\n- Engineered responsive, pixel-perfect mobile-embedded WebViews in React, Vite, and Tailwind CSS adhering strictly to client design specs.\n- Established seamless local developer workflows and mock data synchronization between Spring Boot backend services and React/React Native clients.',
  },
  {
    keys: ['team', 'squad', 'mentoring', 'management', 'culture', '15+', 'leadership', 'lead'],
    answer: '**Leadership Experience & Team Scaling:**\n- Scaled and led cross-functional teams: **Technical Project Lead** (15+ engineers across 3 squads), **Chief Product Officer & Tech Lead** (ICOMM Tech, scaling SaaS products to thousands of businesses), **Senior Software Engineer** (OpenCommerce Group).\n- Mentored 15+ engineers in Component-Driven Architecture, JavaScript Clean Code, and performance profiling.\n- Recognized with the **Rising Star Award** (Q4/2025).',
  },
  {
    keys: ['stack', 'tech stack', 'technologies', 'skill', 'skills', 'programming', 'languages', 'frameworks'],
    answer: '**Core Tech Stack & Architecture:**\n- **Backend/Systems:** Rust (Tokio, Process Sandboxing), Java / Spring Boot (Security, JPA), Node.js / NestJS, Event-Driven Architecture.\n- **Frontend:** React (Concurrent Features, Next.js, Server Components), Vue.js (Nuxt), TypeScript, Micro-frontends (Module Federation), Tailwind CSS.\n- **Data & Real-time:** Redis, WebSockets, SSE, PostgreSQL, Supabase, ClickHouse OLAP, Apache Solr.\n- **DevOps & Cloud:** Docker, Kubernetes fundamentals, Azure Cloud, Cloud CLI, GitHub Actions CI/CD.\n- **AI & Productivity:** Model Context Protocol (MCP), LLM toolchains, Playwright, Vitest, Jest.',
  },
  {
    keys: ['contact', 'email', 'phone', 'location', 'interview', 'salary', 'connect', 'reach', 'schedule'],
    answer: '**Contact Information & Availability:**\n- Tu Quet is open to high-impact technical leadership and senior engineering opportunities.\n- **Phone:** +84 936 683 088\n- **Email:** tunyk.93@gmail.com\n- **Location:** Ha Dong, Ha Noi, Vietnam\n- **Online CV:** [tuquet.com/cv](https://tuquet.com/cv)\n- **GitHub:** [github.com/tuquet](https://github.com/tuquet)\n- **LinkedIn:** [linkedin.com/in/tuquet](https://www.linkedin.com/in/tuquet)\n- **NPM Organization:** [npmjs.com/org/tuquet](https://www.npmjs.com/org/tuquet)',
  },
]

const chips = [
  { label: 'CV / Resume', q: 'Where can I find Tu Quet\'s CV or Resume link?' },
  { label: 'Executive Summary', q: 'Can you provide an executive summary of Tu Quet\'s background?' },
  { label: 'EV Telemetry', q: 'Tell me about the Smart EV Telemetry platform' },
  { label: 'Process Engine', q: 'How does his Rust zero-zombie process supervisor work?' },
  { label: 'Contact', q: 'How can I contact Tu Quet for an interview?' },
]

function queryKnowledge(query: string): string {
  const lower = query.toLowerCase().trim()

  let bestMatch: any = null
  let maxScore = 0

  knowledge.forEach((item) => {
    let score = 0
    item.keys.forEach((key) => {
      const lowerKey = key.toLowerCase()
      if (lower.includes(lowerKey)) {
        score += lowerKey.length >= 3 ? lowerKey.length : 2
        if (['cv', 'resume'].includes(lowerKey)) {
          if (new RegExp(`\\b${lowerKey}\\b`, 'i').test(lower))
            score += 10
        }
      }
    })
    if (score > maxScore) {
      maxScore = score
      bestMatch = typeof item.answer === 'function' ? item.answer() : item.answer
    }
  })

  if (!bestMatch) {
    return 'I can answer questions regarding Tu Quet\'s **CV / Resume**, **technical architecture**, **distributed systems experience**, **leadership across 15+ engineers**, **role fit check**, or **contact info**. Feel free to pick a prompt below!'
  }

  return bestMatch
}

function scrollToBottom() {
  nextTick(() => {
    if (chatBodyRef.value)
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  })
}

function handleSend(text?: string) {
  const query = (text || inputQuery.value).trim()
  if (!query) return

  inputQuery.value = ''
  messages.value.push({
    role: 'user',
    text: query,
  })
  scrollToBottom()

  setTimeout(() => {
    const response = queryKnowledge(query)
    messages.value.push({
      role: 'bot',
      text: response,
    })
    scrollToBottom()
  }, 180)
}

function formatMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="underline underline-offset-2 font-medium hover:text-black dark:hover:text-white">$1</a>')
    .replace(/\n- /g, '<br/>• ')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom()
      inputRef.value?.focus()
    })
  }
}

function handleOpenCopilot(e: Event) {
  const customEvent = e as CustomEvent<{ query?: string }>
  isOpen.value = true
  if (customEvent.detail?.query) {
    handleSend(customEvent.detail.query)
  }
  nextTick(() => {
    scrollToBottom()
    inputRef.value?.focus()
  })
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('open-portfolio-copilot', handleOpenCopilot)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('open-portfolio-copilot', handleOpenCopilot)
  }
})
</script>

<template>
  <div class="portfolio-ai-container fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 print:hidden">
    <!-- Trigger Floating Action Button -->
    <button
      type="button"
      class="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-medium bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 border border-zinc-800 dark:border-zinc-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
      aria-label="Ask Tu Quet"
      @click="toggleOpen"
    >
      <img
        src="https://avatars.githubusercontent.com/u/20990824?v=4"
        alt="Tu Quet"
        class="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full object-cover"
      >
      <span>Ask Tu Quet</span>
      <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 dark:bg-zinc-200 dark:text-zinc-800">AI</span>
    </button>

    <!-- Chat Drawer Dialog -->
    <div
      v-if="isOpen"
      class="fixed bottom-[60px] md:bottom-20 left-3 right-3 md:left-auto md:right-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ease-out"
      :class="isExpanded
        ? 'w-auto md:w-[580px] h-[calc(100dvh-75px)] md:h-[680px]'
        : 'w-auto md:w-[390px] h-[calc(100dvh-75px)] md:h-[530px] max-h-[580px]'"
      role="dialog"
      aria-label="Tu Quet AI Assistant"
    >
      <!-- Dialog Header -->
      <div class="shrink-0 flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
        <div class="flex items-center gap-2.5">
          <img
            src="https://avatars.githubusercontent.com/u/20990824?v=4"
            alt="Tu Quet"
            class="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
          >
          <div>
            <div class="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-1.5">
              <span>Tu Quet AI</span>
              <span class="text-[10px] px-1 rounded font-normal bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Online</span>
            </div>
            <div class="text-[11px] text-zinc-500 dark:text-zinc-400">
              Distributed systems &amp; role fit
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <!-- Expand / Collapse button -->
          <button
            type="button"
            class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            :title="isExpanded ? 'Collapse' : 'Expand'"
            @click="isExpanded = !isExpanded"
          >
            <div :class="isExpanded ? 'i-carbon-minimize' : 'i-carbon-maximize'" class="text-sm" />
          </button>

          <!-- Close button -->
          <button
            type="button"
            class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close"
            @click="isOpen = false"
          >
            <div class="i-carbon-close text-sm" />
          </button>
        </div>
      </div>

      <!-- Messages Body -->
      <div
        ref="chatBodyRef"
        class="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300"
      >
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="max-w-[92%] p-3 rounded-xl text-[13px] leading-relaxed break-words"
          :class="msg.role === 'user'
            ? 'self-end bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900'
            : 'self-start bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800/80'"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="formatMarkdown(msg.text)" />
        </div>
      </div>

      <!-- Quick Action Chips -->
      <div class="shrink-0 flex items-center gap-1.5 px-3 py-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 overflow-x-auto no-scrollbar">
        <button
          v-for="chip in chips"
          :key="chip.q"
          type="button"
          class="shrink-0 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-full transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
          @click="handleSend(chip.q)"
        >
          {{ chip.label }}
        </button>
      </div>

      <!-- Input Footer -->
      <div class="shrink-0 flex items-center gap-2 p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <input
          ref="inputRef"
          v-model="inputQuery"
          type="text"
          class="flex-1 h-[38px] px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
          placeholder="Ask a question about Tu Quet..."
          @keydown.enter="handleSend()"
        >
        <button
          type="button"
          class="shrink-0 h-[38px] px-3.5 text-[13px] font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          @click="handleSend()"
        >
          <span>Send</span>
          <div class="i-carbon-send-alt text-xs" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
