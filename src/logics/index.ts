import dayjs from 'dayjs'

export const isDark = useDark()
export const englishOnly = useLocalStorage('english-only', false)
export const galleryView = useLocalStorage<'cover' | 'contain'>('gallery-view', 'cover')

export type SiteLang = 'en' | 'vi'

export function detectBrowserLang(): SiteLang {
  if (typeof navigator === 'undefined')
    return 'en'
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language || 'en']
  return langs.some(l => String(l).toLowerCase().startsWith('vi')) ? 'vi' : 'en'
}

export const siteLang = ref<SiteLang>('en')

export function initSiteLang() {
  if (typeof window === 'undefined')
    return
  const saved = localStorage.getItem('tuquet-lang')
  const resolved: SiteLang = saved === 'vi' || saved === 'en' ? saved : detectBrowserLang()
  siteLang.value = resolved
  document.documentElement.dataset.lang = resolved
  document.documentElement.lang = resolved
}

export function setSiteLang(lang: SiteLang) {
  siteLang.value = lang
  if (typeof window !== 'undefined') {
    localStorage.setItem('tuquet-lang', lang)
    document.documentElement.dataset.lang = lang
    document.documentElement.lang = lang
  }
}

export function toggleSiteLang() {
  setSiteLang(siteLang.value === 'vi' ? 'en' : 'vi')
}

/**
 * Credit to [@hooray](https://github.com/hooray)
 * @see https://github.com/vuejs/vitepress/pull/2347
 */
export function toggleDark(event: MouseEvent) {
  // @ts-expect-error experimental API
  const isAppearanceTransition = document.startViewTransition
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!isAppearanceTransition) {
    isDark.value = !isDark.value
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )
  const transition = document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  })
  transition.ready
    .then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      document.documentElement.animate(
        {
          clipPath: isDark.value
            ? [...clipPath].reverse()
            : clipPath,
        },
        {
          duration: 400,
          easing: 'ease-out',
          fill: 'forwards',
          pseudoElement: isDark.value
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
}

export function formatDate(d: string | Date, onlyDate = true) {
  const date = dayjs(d)
  if (onlyDate || date.year() === dayjs().year())
    return date.format('MMM D')
  return date.format('MMM D, YYYY')
}
