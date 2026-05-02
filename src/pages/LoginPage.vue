<script setup>
const emit = defineEmits(['go-home', 'go-signup'])

function handleLogin(event) {
  event.preventDefault()

  // TODO: later connect backend login API
  console.log('Sign in clicked')
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
        <a href="#" class="nav-link">Donate</a>
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
            <input type="email" placeholder="your@email.com" />
          </label>

          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>

          <button type="submit" class="btn btn-primary btn-submit">
            Sign In
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