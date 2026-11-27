<script setup lang="ts">
import { siteLang, toggleSiteLang } from '~/logics'

function toTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const { y: scroll } = useWindowScroll()
</script>

<template>
  <header class="header z-40 print:hidden">
    <RouterLink
      class="w-12 h-12 absolute xl:fixed m-5 select-none outline-none"
      to="/"
      focusable="false"
    >
      <Logo />
    </RouterLink>
    <button
      :title="siteLang === 'vi' ? 'Lên đầu trang' : 'Scroll to top'"
      fixed right-3 bottom-3 w-10 h-10 hover:op100 rounded-full
      hover-bg-hex-8883 transition duration-300 z-100 print:hidden
      :class="scroll > 300 ? 'op30' : 'op0! pointer-events-none'"
      @click="toTop()"
    >
      <div i-ri-arrow-up-line />
    </button>
    <nav class="nav">
      <div class="spacer" />
      <div class="right" print:op0>
        <RouterLink to="/posts" :title="siteLang === 'vi' ? 'Bài viết' : 'Blog'">
          <span class="lt-md:hidden">{{ siteLang === 'vi' ? 'Bài viết' : 'Blog' }}</span>
          <div i-ri-article-line md:hidden />
        </RouterLink>
        <RouterLink to="/projects" :title="siteLang === 'vi' ? 'Dự án' : 'Projects'">
          <span class="lt-md:hidden">{{ siteLang === 'vi' ? 'Dự án' : 'Projects' }}</span>
          <div i-ri-lightbulb-line class="md:hidden" />
        </RouterLink>
        <RouterLink to="/cv" :title="siteLang === 'vi' ? 'Hồ sơ (CV)' : 'CV'">
          <span class="lt-md:hidden">CV</span>
          <div i-ri-file-text-line class="md:hidden" />
        </RouterLink>
        <RouterLink to="/clients" :title="siteLang === 'vi' ? 'Khách hàng' : 'Clients'">
          <span class="lt-md:hidden">{{ siteLang === 'vi' ? 'Khách hàng' : 'Clients' }}</span>
          <div i-ri-building-2-line class="md:hidden" />
        </RouterLink>
        <a href="https://fb.com/quet.jr" target="_blank" title="Facebook" class="lt-md:hidden">
          <div i-ri-facebook-fill />
        </a>
        <a href="https://github.com/tuquet" target="_blank" title="GitHub" class="lt-md:hidden">
          <div i-uil-github-alt />
        </a>
        <a href="/feed.xml" target="_blank" title="RSS" class="lt-md:hidden">
          <div i-la-rss-square style="font-size:1.25rem; margin: 0 -0.125rem;" />
        </a>
        <button
          type="button"
          class="lang-switch font-mono text-xs uppercase px-1.5 py-0.5 rounded border border-base opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          :title="siteLang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'"
          :aria-label="siteLang === 'vi' ? 'Switch language to English' : 'Chuyển ngôn ngữ sang Tiếng Việt'"
          @click="toggleSiteLang"
        >
          {{ siteLang === 'vi' ? 'VI' : 'EN' }}
        </button>
        <ToggleTheme />
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header h1 {
  margin-bottom: 0;
}

.logo {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
}

.nav {
  padding: 2rem;
  width: 100%;
  display: grid;
  grid-template-columns: auto max-content;
  box-sizing: border-box;
}

.nav > * {
  margin: auto;
}

.nav img {
  margin-bottom: 0;
}

.nav a {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
  opacity: 0.6;
  outline: none;
}

.nav a:hover {
  opacity: 1;
  text-decoration-color: inherit;
}

.nav .right {
  display: grid;
  grid-gap: 1.2rem;
  grid-auto-flow: column;
}

.nav .right > * {
  margin: auto;
}
</style>
