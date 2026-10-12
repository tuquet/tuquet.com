<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { parseAuthHash, updatePassword } from '~/logics/auth'

const newPassword = ref('')
const confirmPassword = ref('')
const recoveryToken = ref('')
const loading = ref(false)
const errorMessage = ref('')
const success = ref(false)

onMounted(() => {
  if (typeof window === 'undefined')
    return

  const hash = window.location.hash
  if (hash && hash.includes('access_token')) {
    const params = parseAuthHash(hash)
    recoveryToken.value = params.access_token || ''
  }
})

async function handleUpdatePassword() {
  if (!newPassword.value) {
    errorMessage.value = 'Vui lòng nhập mật khẩu mới'
    return
  }
  if (newPassword.value.length < 8) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 8 ký tự'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  loading.value = true
  errorMessage.value = ''

  const res = await updatePassword(newPassword.value, recoveryToken.value)
  loading.value = false

  if (res.error) {
    errorMessage.value = res.error
  }
  else {
    success.value = true
  }
}
</script>

<template>
  <div class="prose m-auto slide-enter-content">
    <div class="max-w-md mx-auto my-8 p-6 rounded-xl border border-base bg-base shadow-sm">
      <div v-if="!success" class="space-y-6">
        <div class="text-center">
          <h1 class="text-2xl font-bold tracking-tight mb-2">
            Đặt lại mật khẩu
          </h1>
          <p class="text-sm op60">
            Tạo mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <div v-if="errorMessage" class="p-3 text-xs rounded bg-red-500/10 border border-red-500/20 text-red-500">
          {{ errorMessage }}
        </div>

        <form class="space-y-4" @submit.prevent="handleUpdatePassword">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider mb-1 op70">Mật khẩu mới</label>
            <input
              v-model="newPassword"
              type="password"
              required
              minlength="8"
              placeholder="Tối thiểu 8 ký tự"
              class="w-full px-3 py-2 rounded-lg border border-base bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider mb-1 op70">Xác nhận mật khẩu</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="8"
              placeholder="Nhập lại mật khẩu mới"
              class="w-full px-3 py-2 rounded-lg border border-base bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer border-none shadow"
          >
            {{ loading ? 'Đang cập nhật...' : 'Lưu mật khẩu mới' }}
          </button>
        </form>
      </div>

      <div v-else class="text-center py-6 space-y-4">
        <div class="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl font-bold">
          ✓
        </div>
        <h2 class="text-xl font-bold text-emerald-500 mb-1">
          Cập nhật mật khẩu thành công!
        </h2>
        <p class="text-xs op70">
          Mật khẩu mới đã có hiệu lực. Bạn có thể sử dụng mật khẩu mới này để đăng nhập vào tất cả các dịch vụ Tuquet.
        </p>

        <div class="pt-4">
          <RouterLink to="/login" class="btn-emerald inline-block no-underline">
            Đăng nhập ngay
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
