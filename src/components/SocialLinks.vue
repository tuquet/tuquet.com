<script setup lang="ts">
const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/tuquet', icon: 'i-simple-icons-github' },
  { label: 'Twitter', href: 'https://x.com/quetjr', icon: 'i-ri-twitter-x-fill' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tuquet', icon: 'i-simple-icons-linkedin' },
  { label: 'Facebook', href: 'https://fb.com/quet.jr', icon: 'i-simple-icons-facebook' },
  { label: 'npm', href: 'https://www.npmjs.com/org/tuquet', icon: 'i-simple-icons-npm' },
]
</script>

<template>
  <p flex="~ gap-2 wrap" class="mt--2!">
    <a
      v-for="item in socialLinks"
      :key="item.label"
      :href="item.href"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span op75 :class="item.icon" /> {{ item.label }}
    </a>
  </p>
</template>
