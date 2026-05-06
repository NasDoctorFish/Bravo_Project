<script setup>
import { ref, reactive, computed } from 'vue'

const emit = defineEmits(['go-home', 'go-login', 'signup-success'])

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

const strengthClass = computed(() =>
  ['weak', 'fair', 'good', 'strong'][passwordStrength.value - 1] || 'weak'
)
const strengthWidth = computed(() =>
  `${(passwordStrength.value / 4) * 100}%`
)
const strengthLabel = computed(() =>
  ['Weak', 'Fair', 'Good', 'Strong'][passwordStrength.value - 1] || 'Weak'
)

async function handleSignup() {
  if (form.password !== form.confirm) return
  loading.value = true
  await new Promise(r => setTimeout(r, 1200))
  loading.value = false
  emit('signup-success')
}
</script>

<template>
  <div class="signup-page">

    <!-- Header -->
    <header class="header">
      <a href="#" class="brand" @click.prevent="emit('go-home')">
        <span class="logo">♥</span>
        <span>FundRise</span>
      </a>

      <nav class="nav">
        <a href="#" class="nav-link">⌕ Donate</a>
        <a href="#" class="nav-link">Fundraising</a>
      </nav>

      <nav class="nav-actions">
        <a href="#" class="nav-link" @click.prevent="emit('go-login')">Login</a>
        <a href="#" class="btn btn-primary" @click.prevent="emit('go-signup')">Sign Up</a>
      </nav>
    </header>

    <!-- Signup Card -->
    <div class="signup-wrapper">
      <div class="signup-card">

        <div class="signup-card-header">
          <div class="signup-logo">♥</div>
          <h1>Create Account</h1>
          <p>Join FundRise and start making a difference</p>
        </div>

        <form @submit.prevent="handleSignup">

          <!-- First & Last Name -->
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name <span class="required">*</span></label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                placeholder="Jane"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label for="lastName">Last Name <span class="required">*</span></label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                placeholder="Doe"
                class="form-input"
                required
              />
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">Email <span class="required">*</span></label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              class="form-input"
              required
            />
          </div>

          <!-- Role -->
          <div class="form-group">
            <label for="role">Role <span class="required">*</span></label>
            <select id="role" v-model="form.role" class="form-select" required>
              <option value="" disabled>Select your role…</option>
              <option value="fundraiser">Fund Raiser</option>
              <option value="donee">Donee</option>
            </select>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password">Password <span class="required">*</span></label>
            <div class="input-wrap">
              <input
                id="password"
                v-model="form.password"
                :type="showPw ? 'text' : 'password'"
                placeholder="Min. 8 characters"
                class="form-input"
                required
              />
              <button type="button" class="toggle-pw" @click="showPw = !showPw">
                {{ showPw ? '🙈' : '👁️' }}
              </button>
            </div>
            <!-- Strength Bar -->
            <div v-if="form.password" class="strength-bar">
              <div
                class="strength-fill"
                :class="strengthClass"
                :style="{ width: strengthWidth }"
              ></div>
            </div>
            <span v-if="form.password" class="strength-label" :class="strengthClass">
              {{ strengthLabel }}
            </span>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label for="confirm">Confirm Password <span class="required">*</span></label>
            <input
              id="confirm"
              v-model="form.confirm"
              :type="showPw ? 'text' : 'password'"
              placeholder="Repeat your password"
              class="form-input"
              :class="{ 'input-error': form.confirm && form.password !== form.confirm }"
              required
            />
            <span v-if="form.confirm && form.password !== form.confirm" class="field-error">
              Passwords do not match.
            </span>
          </div>

          <!-- Terms -->
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.agreed" required />
              I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </label>
          </div>

          <!-- Submit -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-create"
              :disabled="loading || !form.agreed"
            >
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Creating account…' : 'Create Account' }}
            </button>
          </div>

        </form>

        <p class="login-prompt">
          Already have an account?
          <a href="#" @click.prevent="emit('go-login')">Sign in</a>
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
/* ── Layout ── */
.signup-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.signup-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

/* ── Card ── */
.signup-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 40px 36px;
  width: 100%;
  max-width: 500px;
}

.signup-card-header {
  text-align: center;
  margin-bottom: 28px;
}

.signup-logo {
  font-size: 2.4rem;
  color: #e74c3c;
  margin-bottom: 10px;
}

.signup-card-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 6px;
}

.signup-card-header p {
  color: #888;
  font-size: 0.9rem;
  margin: 0;
}

/* ── Password wrap ── */
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

/* ── Strength bar ── */
.strength-bar {
  height: 5px;
  background: #e5e7eb;
  border-radius: 99px;
  margin-top: 8px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.3s, background 0.3s;
}

.strength-fill.weak   { background: #ef4444; }
.strength-fill.fair   { background: #f97316; }
.strength-fill.good   { background: #eab308; }
.strength-fill.strong { background: #22c55e; }

.strength-label {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 4px;
  display: block;
}

.strength-label.weak   { color: #ef4444; }
.strength-label.fair   { color: #f97316; }
.strength-label.good   { color: #eab308; }
.strength-label.strong { color: #22c55e; }

/* ── Error state ── */
.input-error {
  border-color: #dc2626 !important;
}

.field-error {
  font-size: 0.78rem;
  color: #dc2626;
  margin-top: 4px;
  display: block;
}

/* ── Checkbox ── */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #555;
  cursor: pointer;
}

.checkbox-label a {
  color: #3b82f6;
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
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

/* ── Login prompt ── */
.login-prompt {
  text-align: center;
  font-size: 0.88rem;
  color: #666;
  margin: 20px 0 0;
}

.login-prompt a {
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;
}

.login-prompt a:hover {
  text-decoration: underline;
}
</style>