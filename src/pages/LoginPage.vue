<template>
  <div class="page">
    <div class="card">
      <div class="brand">
        <div class="logo">🤝</div>
        <h1>Fund Raising Platform</h1>
        <p>Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="form">
        <div class="field">
          <label>Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
            required
            :class="{ error: errors.email }"
          />
          <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
        </div>

        <div class="field">
          <label>Password</label>
          <div class="input-wrap">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              :class="{ error: errors.password }"
            />
            <button type="button" class="toggle-pw" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
        </div>

        <div class="options">
          <label class="remember">
            <input type="checkbox" v-model="form.remember" />
            Remember me
          </label>
          <a href="#" class="forgot">Forgot password?</a>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>

        <div v-if="loginError" class="alert-error">{{ loginError }}</div>
      </form>

      <p class="footer-link">
        Don't have an account? <a href="#">Sign up</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const form = reactive({ email: '', password: '', remember: false })
const errors = reactive({ email: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const loginError = ref('')

//Login router
import { useRouter } from 'vue-router'

const router = useRouter()

function validate() {
  errors.email = ''
  errors.password = ''
  let valid = true
  if (!form.email.includes('@')) { errors.email = 'Enter a valid email.'; valid = false }
  if (form.password.length < 6) { errors.password = 'Password must be at least 6 characters.'; valid = false }
  return valid
}

  const emit = defineEmits<{
  (e: 'login-success'): void
  }>()

async function handleLogin() {
  loading.value = true
  loginError.value = ''

  if (!validate()) {
    loading.value = false
    loginError.value = 'Invalid credentials. Please try again.'
    return
  }

  await new Promise(r => setTimeout(r, 1200)) // execute r() after 1.2 seconds(1200ms)

  loading.value = false
  emit('login-success')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@700&display=swap');

.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f4f0;
  font-family: 'DM Sans', sans-serif;
}

.card {
  background: #fff;
  border: 1px solid #e2e0db;
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.06);
}

.brand {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 2.4rem;
  margin-bottom: 8px;
}

.brand h1 {
  font-family: 'Fraunces', serif;
  font-size: 1.6rem;
  color: #1a1a1a;
  margin: 0 0 6px;
}

.brand p {
  color: #6b6b6b;
  font-size: 0.9rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
}

input[type="email"],
input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'DM Sans', sans-serif;
  color: #1a1a1a;
  background: #fafaf9;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #2d6a4f;
  background: #fff;
}

input.error {
  border-color: #e53e3e;
}

.error-msg {
  font-size: 0.78rem;
  color: #e53e3e;
}

.input-wrap {
  position: relative;
}

.input-wrap input {
  padding-right: 44px;
}

.toggle-pw {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.remember {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
  cursor: pointer;
}

.forgot {
  color: #2d6a4f;
  text-decoration: none;
  font-weight: 500;
}

.forgot:hover { text-decoration: underline; }

.btn-primary {
  background: #2d6a4f;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
  margin-top: 4px;
}

.btn-primary:hover:not(:disabled) { background: #1f4d38; }
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.alert-error {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #c53030;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.85rem;
  text-align: center;
}

.footer-link {
  text-align: center;
  margin-top: 24px;
  font-size: 0.85rem;
  color: #6b6b6b;
}

.footer-link a {
  color: #2d6a4f;
  font-weight: 500;
  text-decoration: none;
}

.footer-link a:hover { text-decoration: underline; }
</style>
