<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  currentUser,
  isAuthenticated,
  resetPasswordForEmail,
  signInWithGitHub,
  signInWithOtp,
  signInWithPassword,
  signOut,
} from '~/logics/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const isForgotMode = ref(false)
const isOtpMode = ref(false)
const forgotEmail = ref('')
const forgotSuccess = ref(false)
const otpSent = ref(false)

function handleGitHubLogin() {
  errorMessage.value = ''
  signInWithGitHub()
}

async function handlePasswordLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Vui lòng nhập đầy đủ email và mật khẩu'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const res = await signInWithPassword(email.value, password.value)
  loading.value = false

  if (res.error) {
    errorMessage.value = res.error
  }
  else {
    successMessage.value = 'Đăng nhập thành công!'
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }
}

async function handleForgotPassword() {
  const targetEmail = forgotEmail.value || email.value
  if (!targetEmail) {
    errorMessage.value = 'Vui lòng nhập địa chỉ email nhận link khôi phục'
    return
  }

  loading.value = true
  errorMessage.value = ''

  const res = await resetPasswordForEmail(targetEmail)
  loading.value = false

  if (res.error) {
    errorMessage.value = res.error
  }
  else {
    forgotSuccess.value = true
  }
}

async function handleSendOtp() {
  if (!email.value) {
    errorMessage.value = 'Vui lòng nhập email trước khi nhận mã OTP'
    return
  }

  loading.value = true
  errorMessage.value = ''

  const res = await signInWithOtp(email.value)
  loading.value = false

  if (res.error) {
    errorMessage.value = res.error
  }
  else {
    otpSent.value = true
    successMessage.value = 'Đã gửi mã OTP đến email. Vui lòng kiểm tra hộp thư!'
  }
}

function handleSignOut() {
  signOut()
  successMessage.value = 'Đã đăng xuất'
}
</script>

<template>
  <div class="prose m-auto slide-enter-content">
    <div class="max-w-md mx-auto my-8 p-6 rounded-xl border border-base bg-base shadow-sm">
      <!-- Trạng thái đã đăng nhập -->
      <div v-if="isAuthenticated" class="text-center space-y-4">
        <div class="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl font-bold">
          {{ (currentUser?.user_metadata?.full_name || currentUser?.email || 'U')[0].toUpperCase() }}
        </div>
        <h2 class="text-xl font-bold mb-1">
          Xin chào, {{ currentUser?.user_metadata?.full_name || currentUser?.email }}
        </h2>
        <p class="text-sm op60">
          Bạn đã đăng nhập vào hệ sinh thái Tuquet.
        </p>

        <div class="pt-4 flex gap-3 justify-center">
          <RouterLink to="/" class="btn-emerald no-underline">
            Trang chủ
          </RouterLink>
          <button class="btn-rose" @click="handleSignOut">
            Đăng xuất
          </button>
        </div>
      </div>

      <!-- Form Đăng nhập chưa có Session -->
      <div v-else class="space-y-6">
        <div class="text-center">
          <h1 class="text-2xl font-bold tracking-tight mb-2">
            Đăng nhập Tuquet
          </h1>
          <p class="text-sm op60">
            Truy cập hệ sinh thái tự động hóa và điện toán đám mây
          </p>
        </div>

        <!-- 1. Hero Button: Continue with GitHub -->
        <button
          type="button"
          :disabled="loading"
          class="w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-3 bg-[#24292e] dark:bg-[#161b22] text-white hover:op90 transition-all border border-zinc-700 shadow-sm cursor-pointer"
          @click="handleGitHubLogin"
        >
          <div class="i-uil-github-alt text-xl" />
          <span>Continue with GitHub</span>
        </button>

        <div class="relative flex py-1 items-center">
          <div class="flex-grow border-t border-base" />
          <span class="flex-shrink mx-3 text-xs uppercase op40 font-semibold tracking-wider">hoặc với email</span>
          <div class="flex-grow border-t border-base" />
        </div>

        <!-- Thông báo lỗi / thành công -->
        <div v-if="errorMessage" class="p-3 text-xs rounded bg-red-500/10 border border-red-500/20 text-red-500">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="p-3 text-xs rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
          {{ successMessage }}
        </div>

        <!-- Form nhập Email + Mật khẩu -->
        <form v-if="!isForgotMode" class="space-y-4" @submit.prevent="handlePasswordLogin">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider mb-1 op70">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="admin@tuquet.com"
              class="w-full px-3 py-2 rounded-lg border border-base bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="text-xs font-semibold uppercase tracking-wider op70">Mật khẩu</label>
              <!-- Nút Forgot Password -->
              <button
                type="button"
                class="text-xs text-emerald-500 hover:underline cursor-pointer border-none bg-transparent p-0"
                @click="isForgotMode = true; forgotEmail = email; errorMessage = ''"
              >
                Quên mật khẩu?
              </button>
            </div>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-3 py-2 rounded-lg border border-base bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer border-none shadow"
          >
            {{ loading ? 'Đang xử lý...' : 'Đăng nhập với mật khẩu' }}
          </button>

          <!-- Tùy chọn Đăng nhập không cần mật khẩu (Email OTP) -->
          <div class="pt-2 text-center">
            <button
              type="button"
              class="text-xs op60 hover:op100 hover:underline cursor-pointer border-none bg-transparent"
              @click="handleSendOtp"
            >
              ✉️ Gửi mã OTP đăng nhập nhanh qua Email (Không cần mật khẩu)
            </button>
          </div>
        </form>

        <!-- Chế độ Khôi phục mật khẩu (Forgot Password View) -->
        <div v-else class="space-y-4">
          <div class="text-start">
            <h3 class="text-lg font-semibold mb-1">
              Khôi phục mật khẩu
            </h3>
            <p class="text-xs op60">
              Nhập email để nhận liên kết đặt lại mật khẩu mới từ Supabase.
            </p>
          </div>

          <div v-if="!forgotSuccess" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider mb-1 op70">Email nhận link</label>
              <input
                v-model="forgotEmail"
                type="email"
                required
                placeholder="admin@tuquet.com"
                class="w-full px-3 py-2 rounded-lg border border-base bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 py-2 rounded-lg border border-base bg-transparent text-sm hover:bg-zinc-500/10 cursor-pointer"
                @click="isForgotMode = false; forgotSuccess = false; errorMessage = ''"
              >
                Quay lại
              </button>
              <button
                type="button"
                :disabled="loading"
                class="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium border-none cursor-pointer"
                @click="handleForgotPassword"
              >
                {{ loading ? 'Đang gửi...' : 'Gửi email khôi phục' }}
              </button>
            </div>
          </div>

          <div v-else class="text-center py-4 space-y-3">
            <div class="text-emerald-500 text-2xl font-bold">✓</div>
            <h4 class="font-semibold text-emerald-500">Đã gửi email khôi phục!</h4>
            <p class="text-xs op70">
              Vui lòng kiểm tra hộp thư đến (hoặc hòm thư spam) của <b>{{ forgotEmail }}</b> và nhấp vào liên kết để tạo mật khẩu mới.
            </p>
            <button
              type="button"
              class="px-4 py-1.5 rounded-lg border border-base text-xs hover:bg-zinc-500/10 cursor-pointer"
              @click="isForgotMode = false; forgotSuccess = false"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
