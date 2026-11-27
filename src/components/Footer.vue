<script setup lang="ts">
import { getFooterStackItems } from '~/data/registry'

const stackItems = getFooterStackItems()
</script>

<template>
  <footer class="mt-12 mb-6 prose m-auto flex flex-col gap-5 slide-enter animate-delay-1200! copyright print:hidden">
    <div class="tech-marquee-wrap" aria-label="Core tech stack">
      <div class="tech-marquee-track">
        <a
          v-for="item in stackItems"
          :key="`a-${item.name}`"
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
          class="border tech-marquee-pill"
        >
          <img :src="item.logo" :alt="item.name" loading="lazy">
          <span>{{ item.name }}</span>
        </a>
        <a
          v-for="item in stackItems"
          :key="`b-${item.name}`"
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
          tabindex="-1"
          aria-hidden="true"
          class="border tech-marquee-pill"
        >
          <img :src="item.logo" alt="" loading="lazy">
          <span>{{ item.name }}</span>
        </a>
      </div>
    </div>

    <div class="flex items-center">
      <span class="text-sm op50"><a target="_blank" href="https://creativecommons.org/licenses/by-nc-sa/4.0/" style="color:inherit">CC BY-NC-SA 4.0</a> 2021-PRESENT © Nguyen Dinh Tu (Tu Quet)</span>
      <div class="flex-auto" />
    </div>
  </footer>
</template>

<style>
.no-copyright ~ .copyright {
  display: none;
}
</style>

<style scoped>
.tech-marquee-wrap {
  width: 100%;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
  mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
}

.tech-marquee-track {
  display: flex;
  gap: 0.5rem;
  width: max-content;
  animation: tech-marquee 38s linear infinite;
}

.tech-marquee-wrap:hover .tech-marquee-track {
  animation-play-state: paused;
}

.tech-marquee-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid #8883;
  font-size: 0.72rem;
  line-height: 1.2;
  white-space: nowrap;
  opacity: 0.72;
  transition: opacity 0.2s ease, border-color 0.2s ease;
  border-bottom-width: 1px !important;
}

.tech-marquee-pill:hover {
  opacity: 1;
  border-color: #8886;
}

.tech-marquee-pill img {
  width: 0.9rem !important;
  height: 0.9rem !important;
  margin: 0 !important;
  object-fit: contain;
  border-radius: 2px;
}

@keyframes tech-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tech-marquee-track {
    animation: none;
    flex-wrap: wrap;
    width: auto;
  }

  .tech-marquee-pill[aria-hidden='true'] {
    display: none;
  }
}
</style>
