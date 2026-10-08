<script setup lang='ts'>
import { formatDate, isDark } from '~/logics'

const { frontmatter } = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const route = useRoute()
const content = ref<HTMLDivElement>()

const base = 'https://tuquet.github.io'
const facebookUrl = 'https://fb.com/quet.jr'
const tweetUrl = computed(() => `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Reading @quetjr's ${base}${route.path}\n\nI think...`)}`)

let mermaidInstance: any = null

async function renderMermaid() {
  if (typeof window === 'undefined' || !content.value)
    return

  const targets = content.value.querySelectorAll('code.language-mermaid, div.mermaid-wrapper')
  if (!targets.length)
    return

  try {
    if (!mermaidInstance) {
      const mermaidModule = await import('mermaid')
      mermaidInstance = mermaidModule.default || mermaidModule
    }

    mermaidInstance.initialize({
      startOnLoad: false,
      theme: isDark.value ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    })

    let count = 0
    for (const el of Array.from(targets)) {
      let rawCode = ''
      let container: HTMLElement

      if (el.tagName.toLowerCase() === 'code') {
        rawCode = el.textContent || ''
        const pre = el.closest('pre') || el
        container = document.createElement('div')
        container.className = 'mermaid-wrapper'
        container.dataset.mermaidCode = rawCode
        try {
          const id = `mermaid-${Date.now()}-${count++}`
          const { svg, bindFunctions } = await mermaidInstance.render(id, rawCode)
          container.innerHTML = svg
          pre.parentNode?.replaceChild(container, pre)
          bindFunctions?.(container)
        }
        catch (renderErr) {
          console.warn('Mermaid render error:', renderErr)
        }
      }
      else {
        container = el as HTMLElement
        rawCode = container.dataset.mermaidCode || ''
        if (!rawCode.trim())
          continue
        try {
          const id = `mermaid-${Date.now()}-${count++}`
          const { svg, bindFunctions } = await mermaidInstance.render(id, rawCode)
          container.innerHTML = svg
          bindFunctions?.(container)
        }
        catch (renderErr) {
          console.warn('Mermaid re-render error:', renderErr)
        }
      }
    }
  }
  catch (err) {
    console.error('Failed to initialize or render Mermaid diagrams:', err)
  }
}

watch(isDark, async () => {
  await nextTick()
  renderMermaid()
})

watch(
  () => route.path,
  async () => {
    await nextTick()
    renderMermaid()
  },
)

onMounted(() => {
  const navigate = () => {
    if (location.hash) {
      const el = document.querySelector(decodeURIComponent(location.hash))
      if (el) {
        const rect = el.getBoundingClientRect()
        const y = window.scrollY + rect.top - 40
        window.scrollTo({
          top: y,
          behavior: 'smooth',
        })
        return true
      }
    }
  }

  const handleAnchors = (
    event: MouseEvent & { target: HTMLElement },
  ) => {
    const link = event.target.closest('a')

    if (
      !event.defaultPrevented
      && link
      && event.button === 0
      && link.target !== '_blank'
      && link.rel !== 'external'
      && !link.download
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey
    ) {
      const url = new URL(link.href)
      if (url.origin !== window.location.origin)
        return

      event.preventDefault()
      const { pathname, hash } = url
      if (hash && (!pathname || pathname === location.pathname)) {
        window.history.replaceState({}, '', hash)
        navigate()
      }
      else {
        router.push({ path: pathname, hash })
      }
    }
  }

  useEventListener(window, 'hashchange', navigate)
  useEventListener(content.value!, 'click', handleAnchors, { passive: false })

  setTimeout(() => {
    if (!navigate())
      setTimeout(navigate, 1000)
  }, 1)

  nextTick(() => {
    renderMermaid()
  })
})

const ArtComponent = computed(() => {
  let art = frontmatter.art
  if (art === 'random')
    art = 'plum'
  if (typeof window !== 'undefined') {
    if (art === 'plum')
      return defineAsyncComponent(() => import('./ArtPlum.vue'))
    else if (art === 'dots')
      return defineAsyncComponent(() => import('./ArtDots.vue'))
  }
  return undefined
})
</script>

<template>
  <ClientOnly v-if="ArtComponent">
    <component :is="ArtComponent" />
  </ClientOnly>
  <div
    v-if="frontmatter.display ?? frontmatter.title"
    class="prose m-auto mb-8"
    :lang="frontmatter.lang"
    :class="[frontmatter.wrapperClass]"
  >
    <h1 class="mb-0 slide-enter-50">
      {{ frontmatter.display ?? frontmatter.title }}
    </h1>
    <p
      v-if="frontmatter.date || frontmatter.updated"
      class="opacity-50 !-mt-6 slide-enter-50"
    >
      <span v-if="frontmatter.updated">Last updated: {{ typeof frontmatter.updated === 'string' ? frontmatter.updated : formatDate(frontmatter.date, false) }}</span>
      <span v-else>{{ formatDate(frontmatter.date, false) }}</span>
      <span v-if="frontmatter.duration"> · {{ frontmatter.duration }}</span>
    </p>
    <p v-if="frontmatter.place" class="mt--4!">
      <span op50>at </span>
      <a v-if="frontmatter.placeLink" :href="frontmatter.placeLink" target="_blank">
        {{ frontmatter.place }}
      </a>
      <span v-else font-bold>
        {{ frontmatter.place }}
      </span>
    </p>
    <p
      v-if="frontmatter.subtitle"
      class="opacity-50 !-mt-6 italic slide-enter"
    >
      {{ frontmatter.subtitle }}
    </p>
    <p
      v-if="frontmatter.draft"
      class="slide-enter" bg-orange-4:10 text-orange-4 border="l-3 orange-4" px4 py2
    >
      This is a draft post, the content may be incomplete. Please check back later.
    </p>
  </div>
  <article
    ref="content"
    :lang="frontmatter.lang"
    :class="[frontmatter.tocAlwaysOn ? 'toc-always-on' : '', frontmatter.class]"
  >
    <slot />
  </article>
  <div v-if="route.path !== '/'" class="prose m-auto mt-8 mb-8 slide-enter animate-delay-500 print:hidden">
    <template v-if="frontmatter.duration">
      <span font-mono op50>> </span>
      <span op50>discuss on </span>
      <a :href="facebookUrl" target="_blank" op50>facebook</a>
      <span op25> / </span>
      <a :href="tweetUrl" target="_blank" op50>twitter</a>
    </template>
    <br>
    <span font-mono op50>> </span>
    <RouterLink
      :to="route.path.split('/').slice(0, -1).join('/') || '/'"
      class="font-mono op50 hover:op75"
      v-text="'cd ..'"
    />
  </div>
</template>
