<template>
  <div class="page">
    <div class="card">
      <div class="brand">
        <div class="logo">🤝</div>
        <h1>FundBridge</h1>
        <p>Create your account</p>
      </div>

      <form @submit.prevent="handleSignup" class="form">
        <div class="row">
          <div class="field">
            <label>First Name</label>
            <input v-model="form.firstName" type="text" placeholder="Jane" required />
          </div>
          <div class="field">
            <label>Last Name</label>
            <input v-model="form.lastName" type="text" placeholder="Doe" required />
          </div>
        </div>

        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="you@example.com" required />
        </div>

        <div class="field">
          <label>Role</label>
          <select v-model="form.role" required>
            <option value="" disabled>Select your role…</option>
            <option value="fundraiser">Fund Raiser</option>
            <option value="donee">Donee</option>
          </select>
        </div>

        <div class="field">
          <label>Password</label>
          <div class="input-wrap">
            <input
              v-model="form.password"
              :type="showPw ? 'text' : 'password'"
              placeholder="Min. 8 characters"
              required
            />
            <button type="button" class="toggle-pw" @click="showPw = !showPw">
              {{ showPw ? '🙈' : '👁️' }}
            </button>
          </div>
          <div class="strength-bar" v-if="form.password">
            <div class="strength-fill" :class="strengthClass" :style="{ width: strengthWidth }"></div>
          </div>
          <span class="strength-label" v-if="form.password">{{ strengthLabel }}</span>
        </div>

        <div class="field">
          <label>Confirm Password</label>
          <input
            v-model="form.confirm"
            :type="showPw ? 'text' : 'password'"
            placeholder="Repeat your password"
            required
            :class="{ error: form.confirm && form.password !== form.confirm }"
          />
          <span v-if="form.confirm && form.password !== form.confirm" class="error-msg">
            Passwords do not match.
          </span>
        </div>

        <label class="checkbox-field">
          <input type="checkbox" v-model="form.agreed" required />
          I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </label>

        <button type="submit" class="btn-primary" :disabled="loading || !form.agreed">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Creating account…' : 'Create Account' }}
        </button>
      </form>

      <p class="footer-link">
        Already have an account? <a href="#">Sign in</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const form = reactive({
  firstName: '', lastName: '', email: '',
  role: '', password: '', confirm: '', agreed: false
})
const showPw = ref(false)
const loading = ref(false)

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthClass = computed(() => ['weak', 'fair', 'good', 'strong'][passwordStrength.value - 1] || 'weak')
const strengthWidth = computed(() => `${(passwordStrength.value / 4) * 100}%`)
const strengthLabel = computed(() => ['Weak', 'Fair', 'Good', 'Strong'][passwordStrength.value - 1] || 'Weak')

async function handleSignup() {
  if (form.password !== form.confirm) return
  loading.value = true
  await new Promise(r => setTimeout(r, 1200))
  loading.value = false
  // TODO: integrate signup API
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
  padding: 24px;
}

.card {
  background: #fff;
  border: 1px solid #e2e0db;
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.06);
}

.brand { text-align: center; margin-bottom: 32px; }
.logo { font-size: 2.4rem; margin-bottom: 8px; }
.brand h1 { font-family: 'Fraunces', serif; font-size: 1.6rem; color: #1a1a1a; margin: 0 0 6px; }
.brand p { color: #6b6b6b; font-size: 0.9rem; }

.form { display: flex; flex-direction: column; gap: 16px; }

.row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.field { display: flex; flex-direction: column; gap: 6px; }

label { font-size: 0.85rem; font-weight: 500; color: #333; }

input[type="text"], input[type="email"], input[type="password"], select {
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

input:focus, select:focus { outline: none; border-color: #2d6a4f; background: #fff; }
input.error { border-color: #e53e3e; }
.error-msg { font-size: 0.78rem; color: #e53e3e; }

.input-wrap { position: relative; }
.input-wrap input { padding-right: 44px; }
.toggle-pw {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0;
}

.strength-bar {
  height: 4px; background: #eee; border-radius: 4px; overflow: hidden; margin-top: 4px;
}
.strength-fill { height: 100%; border-radius: 4px; transition: width 0.3s, background 0.3s; }
.strength-fill.weak { background: #e53e3e; }
.strength-fill.fair { background: #dd6b20; }
.strength-fill.good { background: #d69e2e; }
.strength-fill.strong { background: #2d6a4f; }
.strength-label { font-size: 0.75rem; color: #888; }

.checkbox-field {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 0.85rem; color: #555; cursor: pointer; line-height: 1.5;
}
.checkbox-field a { color: #2d6a4f; text-decoration: none; font-weight: 500; }
.checkbox-field a:hover { text-decoration: underline; }

.btn-primary {
  background: #2d6a4f; color: #fff; border: none; border-radius: 8px;
  padding: 12px; font-size: 0.95rem; font-weight: 600;
  font-family: 'DM Sans', sans-serif; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background 0.2s; margin-top: 4px;
}
.btn-primary:hover:not(:disabled) { background: #1f4d38; }
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.footer-link { text-align: center; margin-top: 24px; font-size: 0.85rem; color: #6b6b6b; }
.footer-link a { color: #2d6a4f; font-weight: 500; text-decoration: none; }
.footer-link a:hover { text-decoration: underline; }
</style>
