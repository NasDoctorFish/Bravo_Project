<script setup>
import { ref } from 'vue'
const emit = defineEmits(['go-home', 'go-signup', 'go-search'])

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function handleLogin(event) {
  event.preventDefault()

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.message || 'Unable to sign in. Please try again.')
    }

    if (data.token) {
      localStorage.setItem('authToken', data.token)
    }

    emit('go-home')
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to sign in. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <header class="header">
      <a href="#" class="brand" @click.prevent="emit('go-home')">
        <span class="logo">♥</span>
        <span>FundRise</span>
      </a>

      <nav class="nav">
        <a href="#" class="nav-link" @click.prevent="emit('go-search')">⌕ Donate</a>
        <a href="#" class="nav-link">Fundraising</a>
      </nav>

      <nav class="nav-actions">
        <a href="#" class="nav-link" @click.prevent="emit('go-home')">Home</a>
        <a href="#" class="btn btn-primary" @click.prevent="emit('go-signup')">
          Start Campaign
        </a>
      </nav>
    </header>

    <main class="login-main">
      <div class="login-card">
        <div class="card-icon">↴</div>

        <h1>Welcome Back</h1>
        <p class="subtitle">Sign in to your account</p>

        <form class="login-form" @submit="handleLogin">
          <label>
            Email
            <input v-model="email" type="email" placeholder="your@email.com" required />
          </label>

          <label>
            Password
            <input v-model="password" type="password" placeholder="••••••••" required />
          </label>

          <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

          <button type="submit" class="btn btn-primary btn-submit" :disabled="isLoading">
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <p class="signup-line">
          Don't have an account?
          <a href="#" @click.prevent="emit('go-signup')">Sign up</a>
        </p>
      </div>
    </main>
  </div>
</template>
