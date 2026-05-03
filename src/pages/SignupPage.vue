<script setup>
import { ref } from 'vue'
const emit = defineEmits(['go-home', 'go-login', 'go-search'])

const selectedRole = ref('donor')

function handleSignup(event) {
  event.preventDefault()

  // TODO: later connect backend signup API
  console.log('Create account clicked:', selectedRole.value)
}
</script>

<template>
  <div class="signup-page">
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
        <a href="#" class="nav-link" @click.prevent="emit('go-login')">Sign In</a>
      </nav>
    </header>

    <main class="login-main">
      <div class="signup-card">
        <div class="card-icon">👤</div>

        <h1>Create Your Account</h1>
        <p class="subtitle">Join our community today</p>

        <form class="signup-form" @submit="handleSignup">
          <label>
            Full Name
            <input type="text" placeholder="John Doe" />
          </label>

          <label>
            Email
            <input type="email" placeholder="your@email.com" />
          </label>

          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>

          <div class="role-section">
            <p class="role-label">I want to:</p>

            <div class="role-grid">
              <button
                type="button"
                class="role-card"
                :class="{ 'role-card-active': selectedRole === 'donor' }"
                @click="selectedRole = 'donor'"
              >
                <span class="role-icon">🤝</span>
                <span class="role-name">Donate</span>
                <span class="role-desc">Support campaigns</span>
              </button>

              <button
                type="button"
                class="role-card"
                :class="{ 'role-card-active': selectedRole === 'fundraiser' }"
                @click="selectedRole = 'fundraiser'"
              >
                <span class="role-icon">♥</span>
                <span class="role-name">Fundraise</span>
                <span class="role-desc">Create campaigns</span>
              </button>

              <button
                type="button"
                class="role-card"
                :class="{ 'role-card-active': selectedRole === 'admin' }"
                @click="selectedRole = 'admin'"
              >
                <span class="role-icon">🛡️</span>
                <span class="role-name">Admin</span>
                <span class="role-desc">Manage platform</span>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-submit">
            Create Account
          </button>
        </form>

        <p class="signin-line">
          Already have an account?
          <a href="#" @click.prevent="emit('go-login')">Sign in</a>
        </p>
      </div>
    </main>
  </div>
</template>