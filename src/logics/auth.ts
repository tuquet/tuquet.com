import { computed, ref } from 'vue'

export interface UserProfile {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    name?: string
    avatar_url?: string
    user_name?: string
  }
}

export interface AuthSession {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in?: number
  expires_at?: number
  user: UserProfile
}

const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL)
  || 'https://dswhacsoaxgpfnkaxnhz.supabase.co'

const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzd2hhY3NvYXhncGZua2F4bmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyOTEzMzcsImV4cCI6MjEwNTg2NzMzN30.QRdxE3CPCF8CtliOtSUcSFO-jbKi99uM2AKlJgKt6RQ'

const SESSION_STORAGE_KEY = 'tuquet_auth_session'

const currentSession = ref<AuthSession | null>(loadSession())

function loadSession(): AuthSession | null {
  if (typeof window === 'undefined')
    return null
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw)
      return null
    return JSON.parse(raw) as AuthSession
  }
  catch {
    return null
  }
}

export function saveSession(session: AuthSession | null) {
  currentSession.value = session
  if (typeof window === 'undefined')
    return
  if (session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  }
  else {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }
}

export const isAuthenticated = computed(() => !!currentSession.value?.access_token)
export const currentUser = computed(() => currentSession.value?.user ?? null)

/**
 * 1. Đăng nhập 1-click bằng GitHub OAuth
 */
export function signInWithGitHub(redirectTo?: string) {
  if (typeof window === 'undefined')
    return
  const targetCallback = redirectTo || `${window.location.origin}/auth/callback`
  const authUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent(targetCallback)}`
  window.location.href = authUrl
}

/**
 * 2. Đăng nhập truyền thống bằng Email + Password
 */
export async function signInWithPassword(email: string, password: string): Promise<{ session?: AuthSession, error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim(), password }),
    })

    const data = await res.json()
    if (!res.ok) {
      return { error: data.error_description || data.msg || data.message || 'Đăng nhập không thành công' }
    }

    const session: AuthSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      expires_at: data.expires_at || (Date.now() / 1000 + (data.expires_in || 3600)),
      user: data.user,
    }

    saveSession(session)
    return { session }
  }
  catch (e: any) {
    return { error: e.message || 'Lỗi mạng khi kết nối đến Supabase' }
  }
}

/**
 * 3. Gửi yêu cầu Khôi phục mật khẩu (Forgot Password)
 */
export async function resetPasswordForEmail(email: string, redirectTo?: string): Promise<{ success: boolean, error?: string }> {
  try {
    const targetRedirect = redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : '')
    const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        redirect_to: targetRedirect,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      return { success: false, error: data.error_description || data.msg || data.message || 'Không thể gửi email khôi phục' }
    }

    return { success: true }
  }
  catch (e: any) {
    return { success: false, error: e.message || 'Lỗi mạng' }
  }
}

/**
 * 4. Cập nhật mật khẩu mới (khi người dùng click link recovery hoặc đã có token)
 */
export async function updatePassword(newPassword: string, customToken?: string): Promise<{ success: boolean, error?: string }> {
  const token = customToken || currentSession.value?.access_token
  if (!token) {
    return { success: false, error: 'Không tìm thấy phiên làm việc hoặc token khôi phục' }
  }

  try {
    const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    })

    const data = await res.json()
    if (!res.ok) {
      return { success: false, error: data.error_description || data.msg || data.message || 'Không thể đổi mật khẩu' }
    }

    if (currentSession.value) {
      currentSession.value.user = data
      saveSession(currentSession.value)
    }

    return { success: true }
  }
  catch (e: any) {
    return { success: false, error: e.message || 'Lỗi mạng khi cập nhật mật khẩu' }
  }
}

/**
 * 5. Đăng nhập nhanh không cần mật khẩu (Email OTP 6 số)
 */
export async function signInWithOtp(email: string): Promise<{ success: boolean, error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        create_user: false,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      return { success: false, error: data.error_description || data.msg || data.message || 'Không thể gửi mã OTP' }
    }

    return { success: true }
  }
  catch (e: any) {
    return { success: false, error: e.message || 'Lỗi mạng' }
  }
}

/**
 * 6. Xác thực mã OTP 6 số
 */
export async function verifyOtp(email: string, token: string): Promise<{ session?: AuthSession, error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/verify`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'email',
        email: email.trim(),
        token: token.trim(),
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return { error: data.error_description || data.msg || data.message || 'Mã OTP không hợp lệ' }
    }

    const session: AuthSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      expires_at: data.expires_at || (Date.now() / 1000 + (data.expires_in || 3600)),
      user: data.user,
    }

    saveSession(session)
    return { session }
  }
  catch (e: any) {
    return { error: e.message || 'Lỗi mạng khi xác thực OTP' }
  }
}

/**
 * 7. Đăng xuất
 */
export function signOut() {
  saveSession(null)
}

/**
 * 8. Phân tích hash parameters từ URL callback
 */
export function parseAuthHash(hash: string): Record<string, string> {
  const cleanHash = hash.replace(/^#/, '')
  const params = new URLSearchParams(cleanHash)
  const result: Record<string, string> = {}
  params.forEach((value, key) => {
    result[key] = value
  })
  return result
}
