<script setup lang="ts">
import { siteLang } from '~/logics'

const copied = ref(false)
const exporting = ref(false)

async function downloadPdf() {
  if (typeof window === 'undefined' || exporting.value)
    return

  exporting.value = true
  try {
    const { generateAndDownloadCvPdf } = await import('~/utils/exportCvPdf')
    generateAndDownloadCvPdf('Nguyen_Dinh_Tu_CV.pdf')
  }
  finally {
    setTimeout(() => {
      exporting.value = false
    }, 300)
  }
}

function printCv() {
  if (typeof window === 'undefined')
    return

  const originalTitle = document.title
  document.title = 'Nguyen_Dinh_Tu_CV'

  const restoreTitle = () => {
    document.title = originalTitle
    window.removeEventListener('afterprint', restoreTitle)
    window.removeEventListener('focus', restoreTitle)
  }

  window.addEventListener('afterprint', restoreTitle, { once: true })
  window.addEventListener('focus', restoreTitle, { once: true })
  window.print()
}

async function copyCvUrl() {
  if (typeof window === 'undefined' || !navigator?.clipboard)
    return

  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  catch {
    // Clipboard access may be denied in restricted contexts
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 my-4 print:hidden">
    <button
      type="button"
      :disabled="exporting"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 border border-zinc-800 dark:border-zinc-200 transition-colors cursor-pointer disabled:opacity-60"
      @click="downloadPdf"
    >
      <div class="i-carbon-document-pdf text-sm" />
      <span>{{ exporting ? (siteLang === 'vi' ? 'Đang tạo PDF...' : 'Generating PDF...') : (siteLang === 'vi' ? 'Lưu / Xuất PDF' : 'Save / Export PDF') }}</span>
    </button>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
      @click="printCv"
    >
      <div class="i-carbon-printer text-sm" />
      <span>{{ siteLang === 'vi' ? 'In CV' : 'Print' }}</span>
    </button>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
      @click="copyCvUrl"
    >
      <div :class="copied ? 'i-carbon-checkmark text-emerald-600 dark:text-emerald-400' : 'i-carbon-link'" class="text-sm" />
      <span>{{ copied ? (siteLang === 'vi' ? 'Đã sao chép' : 'Copied Link') : (siteLang === 'vi' ? 'Sao chép link CV' : 'Copy CV Link') }}</span>
    </button>
  </div>
</template>
