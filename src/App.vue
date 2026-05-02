<script setup>
import { ref } from 'vue'

import HomePage from './pages/HomePage.vue'
import LoginPage from './pages/LoginPage.vue'
import SignupPage from './pages/SignupPage.vue'

const page = ref('home')

function goHome() {
  page.value = 'home'
}

function goLogin() {
  page.value = 'login'
}

function goSignup() {
  page.value = 'signup'
}
</script>

<template>
  <HomePage
    v-if="page === 'home'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-signup="goSignup"
  />

  <LoginPage
    v-else-if="page === 'login'"
    @go-home="goHome"
    @go-signup="goSignup"
  />

  <SignupPage
    v-else-if="page === 'signup'"
    @go-home="goHome"
    @go-login="goLogin"
  />
</template>