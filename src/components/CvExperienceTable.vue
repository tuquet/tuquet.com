<script setup lang="ts">
import { COMPANIES } from '~/data/registry'

const props = withDefaults(defineProps<{
  lang?: 'en' | 'vi'
}>(), {
  lang: 'en',
})

const headers = computed(() => props.lang === 'vi'
  ? ['Từ', 'Đến', 'Doanh nghiệp', 'Vị trí', 'Phạm vi chính']
  : ['From', 'To', 'Company', 'Position', 'Key Scope'])
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in headers" :key="col">{{ col }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="company in COMPANIES" :key="company.id">
        <td>{{ company.from }}</td>
        <td>{{ props.lang === 'vi' && company.toVi ? company.toVi : company.to }}</td>
        <td>
          <strong>{{ company.name }}</strong>
          (<a :href="company.url" target="_blank" rel="noopener">{{ company.domain }}</a>)
        </td>
        <td>{{ company.role }}</td>
        <td>{{ props.lang === 'vi' && company.scopeVi ? company.scopeVi : company.scope }}</td>
      </tr>
    </tbody>
  </table>
</template>
