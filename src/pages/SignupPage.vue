<script setup>
import { useAuth } from '../composables/useAuth'
const { isLoggedIn, userId, userRole, sessionReady, signOut } = useAuth()
import { useRouter } from 'vue-router'
import { ref, reactive, computed } from 'vue'
import { create } from '../controllers/authController'

// router
const router = useRouter()

const emit = defineEmits(['go-home', 'go-login', 'go-signup', 'signup-success', 'go-search'])

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

const form = reactive({
  firstName: '', lastName: '', email: '',
  role: '', password: '', confirm: '', agreed: false
})

const errors = reactive({
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

function validateSignup() {
  errors.firstName = '' 
  errors.lastName = '' 
  errors.email = ''
  errors.role = ''
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

async function handleSignup() {
  errors.password = ''

  if (form.password !== form.confirm) {
    errors.password = 'Password confirmation does not match the password.'
    return
  }

  const valid = validateSignup()

  if (!valid) {
    return
  }

  loading.value = true

  try {
    const fullName = `${form.firstName} ${form.lastName}`.trim()

    const newUserId = await create(
      fullName,
      form.role,
      form.password,
      form.email
    )

    console.log('Created user:', newUserId)

    router.push('/login')
  } catch (err) {
    console.log('UNEXPECTED SIGN UP ERROR:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="signup-page">

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
        <RouterLink to="/login" class="nav-link" @click="emit('go-login')">Login</RouterLink>
        <RouterLink to="/signup" class="btn btn-primary" @click="emit('go-signup')">Sign Up</RouterLink>
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
              I agree to the <RouterLink to="/signup">Terms of Service</RouterLink> and <RouterLink to="/signup">Privacy Policy</RouterLink>
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
          <RouterLink to="/login" @click="emit('go-login')">Sign in</RouterLink>
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
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 480px) {
  .form-row { grid-template-columns: 1fr; }
}
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
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.88rem;
  color: #111;
  background: #fff;
  box-sizing: border-box;
}

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
