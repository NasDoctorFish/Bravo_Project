<script setup>
import { ref } from 'vue'

import HomePage from './pages/HomePage.vue'
import LoginPage from './pages/LoginPage.vue'
import SignupPage from './pages/SignupPage.vue'
import FraSearchPage from './pages/FraSearchPage.vue'
import FraCreationPage from './pages/FraCreationPage.vue'

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

function goSearch() {
  page.value = 'search'
}

function goCreate() {
  page.value = 'creation'
}

function goLogout() {
  page.value = 'home'
}

function handleCampaignCreated(campaignData) {
  console.log('New campaign created:', campaignData)
  page.value = 'search'
}
</script>

<template>
  <HomePage
    v-if="page === 'home'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-signup="goSignup"
    @go-search="goSearch"
    @go-create="goCreate"
  />

  <LoginPage
    v-else-if="page === 'login'"
    @go-home="goHome"
    @go-signup="goSignup"
    @go-search="goSearch"
  />

  <SignupPage
    v-else-if="page === 'signup'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-search="goSearch"
  />

  <FraSearchPage
    v-else-if="page === 'search'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-signup="goSignup"
    @go-search="goSearch"
  />

  <FraCreationPage
    v-else-if="page === 'creation'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-signup="goSignup"
    @go-search="goSearch"
    @campaign-created="handleCampaignCreated"
  />
</template>