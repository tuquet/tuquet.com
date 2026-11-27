---
title: Redirecting to Clients - Tu Quet
titleVi: Đang chuyển hướng tới trang Khách hàng - Tú Quét
display: ''
---

<script setup lang="ts">
const router = useRouter()

onMounted(() => {
  router.replace('/clients')
})
</script>

<div class="prose m-auto py-12 text-center">
  <p class="op70 lang-en">
    Redirecting to <RouterLink to="/clients">/clients</RouterLink>...
  </p>
  <p class="op70 lang-vi">
    Đang chuyển hướng tới <RouterLink to="/clients">/clients</RouterLink>...
  </p>
</div>
