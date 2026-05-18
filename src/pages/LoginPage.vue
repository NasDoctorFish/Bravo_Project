<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const emit = defineEmits(['go-home', 'go-login', 'go-signup', 'login-success'])

const { signIn, isLoggedIn, sessionReady, userId, userRole, signOut } = useAuth()

if (isLoggedIn.value) {
  console.log(
    'Logged in as...\n',
    'userid: ', userId.value,
    '\nRole: ', userRole.value,
    '\nsessionReady: ', sessionReady.value
  )
}
else {
  console.log('Logged Out')
}
const router = useRouter()

// Redirect immediately if a valid session already exists
watch([sessionReady, isLoggedIn], ([ready, loggedIn]) => {
  if (ready && loggedIn) router.push('/')
}, { immediate: true })

const form = reactive({ email: '', password: '', remember: false })
const errors = reactive({ email: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const loginError = ref('')

function validate() {
  errors.email = ''
  errors.password = ''
  let valid = true
  if (!form.email.includes('@')) {
    errors.email = 'Enter a valid email.'
    valid = false
  }
  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
    valid = false
  }
  return valid
}

// async function handleLogin() {
//   loginError.value = ''
//   if (!validate()) {
//     loginError.value = 'Please fix the errors above.'
//     return
//   }

//   loading.value = true
//   try {
//     await signIn(form.email, form.password)
//     emit('login-success')
//     router.push('/')
//   } catch (err: any) {
//     loginError.value = err.message || 'Login failed. Please check your credentials.'
//   } finally {
//     loading.value = false
//   }
// }

async function handleLogin() {
  // Validate login form
  if(!validate()) return

  loading.value = true
  loginError.value = ''

  try {
    await signIn(form.email, form.password) // from useAuth.ts
    router.push('/')
  } catch (err) {
    console.log('LOGIN ERROR:', err)
    loginError.value = 'Invalid email or password'
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div class="login-page">

    <!-- Header -->
    <header class="header">
      <RouterLink to="/" class="brand" @click="emit('go-home')">
        <span class="logo">♥</span>
        <span>FundRise</span>
      </RouterLink>

      <nav class="nav">
        <RouterLink to="/fra/search" class="nav-link">⌕ Donate</RouterLink>
        <RouterLink to="/fra/create" class="nav-link">Fundraising</RouterLink>
      </nav>

      <nav class="nav-actions">
        <RouterLink to="/favourites" class="nav-link">♥ Favourites</RouterLink>
        <RouterLink to="/login" class="nav-link" @click="emit('go-login')">Login</RouterLink>
        <RouterLink to="/signup" class="btn btn-primary" @click="emit('go-signup')">Sign Up</RouterLink>
      </nav>
    </header>

    <!-- Login Card -->
    <div class="login-wrapper">
      <div class="login-card">

        <div class="login-card-header">
          <div class="login-logo">♥</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your FundRise account</p>
        </div>

        <form @submit.prevent="handleLogin">

          <!-- Email -->
          <div class="form-group">
            <label for="email">Email <span class="required">*</span></label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              class="form-input"
              :class="{ 'input-error': errors.email }"
              required
            />
            <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password">Password <span class="required">*</span></label>
            <div class="input-wrap">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="form-input"
                :class="{ 'input-error': errors.password }"
                required
              />
              <button
                type="button"
                class="toggle-pw"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
          </div>

          <!-- Remember me / Forgot -->
          <div class="form-options">
            <label class="remember-label">
              <input type="checkbox" v-model="form.remember" />
              Remember me
            </label>
            <RouterLink to="/login" class="forgot-link">Forgot password?</RouterLink>
          </div>

          <!-- Error Banner -->
          <div v-if="loginError" class="error-banner">{{ loginError }}</div>

          <!-- Submit -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-create"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Signing in…' : 'Sign In' }}
            </button>
          </div>

        </form>

        <p class="signup-prompt">
          Don't have an account?
          <RouterLink to="/signup" @click="emit('go-signup')">Sign up</RouterLink>
        </p>

      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>

  </div>
</template>

<style scoped>
/* ── Shared Header / Nav / Footer ── */
.header {
  display: flex;
  align-items: center;
  padding: 0 32px;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  gap: 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.1rem;
  color: #111;
}
.logo { color: #ef4444; font-size: 1.2rem; }
.nav, .nav-actions { display: flex; align-items: center; gap: 16px; }
.nav-actions { margin-left: auto; }
.nav-link { font-size: 0.88rem; color: #555; text-decoration: none; font-weight: 500; }
.nav-link:hover { color: #111; }
.footer {
  text-align: center;
  padding: 24px;
  font-size: 0.8rem;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

/* ── Shared Form Elements ── */
.form-group { margin-bottom: 20px; }
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 0.88rem;
  color: #1f2937;
}
.required { color: #ef4444; }
.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.88rem;
  color: #111;
  background: #fff;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.form-input:focus { outline: none; border-color: #3b82f6; }

/* Shared button base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 9px 16px;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.88rem;
}
.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover { background: #1d4ed8; }

.form-actions { margin-top: 4px; }
.btn-create {
  width: 100%;
  background: #2563eb;
  color: #fff;
  padding: 11px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.btn-create:hover:not(:disabled) { background: #1d4ed8; }
.btn-create:disabled { opacity: 0.55; cursor: not-allowed; }

/* ── Layout ── */
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.login-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

/* ── Card ── */
.login-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 40px 36px;
  width: 100%;
  max-width: 440px;
}

.login-card-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-logo {
  font-size: 2.4rem;
  color: #e74c3c;
  margin-bottom: 10px;
}

.login-card-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 6px;
}

.login-card-header p {
  color: #888;
  font-size: 0.9rem;
  margin: 0;
}

/* ── Password Input Wrap ── */
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap .form-input {
  padding-right: 44px;
  width: 100%;
}

.toggle-pw {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  line-height: 1;
}

/* ── Input Error State ── */
.input-error {
  border-color: #dc2626 !important;
}

.field-error {
  font-size: 0.78rem;
  color: #dc2626;
  margin-top: 4px;
  display: block;
}

/* ── Options Row ── */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #555;
  cursor: pointer;
}

.forgot-link {
  font-size: 0.85rem;
  color: #3b82f6;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* ── Error Banner ── */
.error-banner {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 12px;
}

/* ── Spinner ── */
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Signup Prompt ── */
.signup-prompt {
  text-align: center;
  font-size: 0.88rem;
  color: #666;
  margin: 20px 0 0;
}

.signup-prompt a {
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;
}

.signup-prompt a:hover {
  text-decoration: underline;
}
</style>
