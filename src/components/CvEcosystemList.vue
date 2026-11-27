<script setup lang="ts">
import { extractDomain, getEcosystemModules } from '~/data/registry'

const modules = getEcosystemModules().map(entry => ({
  id: entry.id,
  name: entry.name,
  url: entry.url,
  label: entry.url.includes('github.com') ? entry.url.replace(/^https?:\/\//, '') : extractDomain(entry.url),
}))
</script>

<template>
  <span>
    <template v-for="(item, idx) in modules" :key="item.id">
      <template v-if="idx > 0"> · </template>
      <a :href="item.url" target="_blank" rel="noopener">{{ item.name }}</a> ({{ item.label }})
    </template>
  </span>
</template>
