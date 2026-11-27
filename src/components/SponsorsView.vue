<script setup lang="ts">
import { siteLang } from '~/logics'
import SponsorsCircles from './SponsorsCircles.vue'
import SponsorsTiers from './SponsorsTiers.vue'

const showCircle = ref(true)
</script>

<template>
  <div flex="~ gap-2 items-center justify-center" z-100 mt-5>
    <button op50 hover:op100 :class="showCircle ? 'op75 font-semibold' : 'op50'" @click="showCircle = true">
      {{ siteLang === 'vi' ? 'Bản đồ bong bóng' : 'Bubble Map' }}
    </button>
    <span op25>|</span>
    <button op50 hover:op100 :class="showCircle ? 'op50' : 'op75 font-semibold'" @click="showCircle = false">
      {{ siteLang === 'vi' ? 'Theo danh mục' : 'By Category' }}
    </button>
  </div>

  <div class="mt-6">
    <SponsorsCircles v-if="showCircle" />
    <SponsorsTiers v-else />
  </div>
</template>
