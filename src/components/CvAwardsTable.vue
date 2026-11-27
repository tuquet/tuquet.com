<script setup lang="ts">
import { AWARDS_AND_EDUCATION } from '~/data/registry'

const props = withDefaults(defineProps<{
  lang?: 'en' | 'vi'
}>(), {
  lang: 'en',
})

const headers = computed(() => props.lang === 'vi'
  ? ['Thời gian', 'Tổ chức / Trường', 'Giải thưởng / Chuyên ngành']
  : ['Time', 'Organization / School', 'Award / Major'])
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in headers" :key="col">{{ col }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in AWARDS_AND_EDUCATION" :key="entry.id">
        <td>{{ entry.time }}</td>
        <td>
          <strong>{{ entry.organization }}</strong>
          (<a :href="entry.organizationUrl" target="_blank" rel="noopener">{{ entry.organizationDomain }}</a>)
        </td>
        <td>
          <strong>{{ props.lang === 'vi' && entry.titleVi ? entry.titleVi : entry.title }}</strong>
          – {{ props.lang === 'vi' && entry.detailVi ? entry.detailVi : entry.detail }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
