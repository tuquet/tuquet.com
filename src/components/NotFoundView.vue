<script setup lang="ts">
import { siteLang } from '~/logics'
</script>

<template>
  <div class="prose m-auto">
    <h1>404</h1>
    <p>
      {{ siteLang === 'vi' ? 'Rất vui được gặp bạn, nhưng trang này không tồn tại rồi!' : 'Nice to meet you tho!' }}
    </p>
  </div>
</template>
