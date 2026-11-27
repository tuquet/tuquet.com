<script setup lang="ts">
import { getClientsByCompany } from '~/data/registry'

const props = withDefaults(defineProps<{
  companyId: string
  excludeIds?: string[]
}>(), {
  excludeIds: () => [],
})

const clients = computed(() => getClientsByCompany(props.companyId, props.excludeIds))
</script>

<template>
  <span>
    <template v-for="(client, idx) in clients" :key="client.id">
      <template v-if="idx > 0">, </template>
      <a :href="client.url" target="_blank" rel="noopener">{{ client.name }}</a>
    </template>
  </span>
</template>
