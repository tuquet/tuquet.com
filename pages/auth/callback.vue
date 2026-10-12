<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { parseAuthHash, saveSession } from '~/logics/auth'

const statusText = ref('Đang hoàn tất quá trình xác thực tài khoản...')
const errorMessage = ref('')
const isLoading = ref(true)

onMounted(async () => {
  if (typeof window === 'undefined')
    return

  try {
    const hash = window.location.hash
    const searchParams = new URLSearchParams(window.location.search)

    // Kiểm tra lỗi từ provider
    const error = searchParams.get('error') || searchParams.get('error_description')
    if (error) {
      isLoading.value = false
      errorMessage.value = `Đăng nhập thất bại: ${error}`
      return
    }

    if (hash && hash.includes('access_token')) {
      const params = parseAuthHash(hash)
      const accessToken = params.access_token
      const refreshToken = params.refresh_token
      const type = params.type

      // Nếu là luồng khôi phục mật khẩu (Forgot Password link)
      if (type === 'recovery') {
        statusText.value = 'Chuyển hướng đến trang đặt lại mật khẩu...'
        window.location.href = `/auth/reset-password${hash}`
        return
      }

      // Luồng đăng nhập OAuth GitHub
      if (accessToken) {
        statusText.value = 'Lưu phiên làm việc...'

        // Lưu session vào localStorage
        saveSession({
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: params.token_type || 'bearer',
          expires_in: params.expires_in ? Number.parseInt(params.expires_in) : 3600,
          expires_at: Date.now() / 1000 + (params.expires_in ? Number.parseInt(params.expires_in) : 3600),
          user: {
            id: 'current_user',
          },
        })

        statusText.value = 'Đăng nhập thành công! Đang chuyển về trang chủ...'
        setTimeout(() => {
          window.location.href = '/'
        }, 600)
        return
      }
    }

    // Nếu không có token trong hash
    isLoading.value = false
    errorMessage.value = 'Không tìm thấy dữ liệu xác thực hợp lệ từ hệ thống.'
  }
  catch (e: any) {
    isLoading.value = false
    errorMessage.value = `Lỗi xử lý xác thực: ${e.message}`
  }
})
</script>

<template>
  <div class="min-h-[50vh] flex items-center justify-center p-6 slide-enter-content">
    <div class="max-w-md w-full p-8 rounded-xl border border-base bg-base shadow-sm text-center space-y-4">
      <div v-if="isLoading" class="space-y-4">
        <div class="w-12 h-12 mx-auto rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <h3 class="text-lg font-medium">
          {{ statusText }}
        </h3>
        <p class="text-xs op50">
          Vui lòng đợi trong giây lát...
        </p>
      </div>

      <div v-else class="space-y-4">
        <div class="text-red-500 text-3xl font-bold">!</div>
        <h3 class="text-lg font-medium text-red-500">
          Đăng nhập không thành công
        </h3>
        <p class="text-xs op70">
          {{ errorMessage }}
        </p>
        <div class="pt-2">
          <RouterLink to="/login" class="btn-emerald inline-block no-underline">
            Quay lại trang đăng nhập
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
