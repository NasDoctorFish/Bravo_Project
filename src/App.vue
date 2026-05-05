<script setup>
import { ref } from 'vue'

import HomePage from './pages/HomePage.vue'
import LoginPage from './pages/LoginPage.vue'
import SignupPage from './pages/SignupPage.vue'
import FraSearchPage from './pages/FraSearchPage.vue'
import FraCreationPage from './pages/FraCreationPage.vue'
import FraDetailPage from './pages/FraDetailPage.vue'
import PADashboardPage from './pages/PADashboardPage.vue'
import PlatformManagementPage from './pages/PlatformManagementPage.vue'
import DoneeDashboardPage from './pages/DoneeDashboardPage.vue'
import FavouritesPage from './pages/FavouritesPage.vue'

const page = ref('creation')

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

function goDetail() {
  page.value = 'campaigndetail'
}

function goPlatformManagement() {
  page.value = 'platformmanagement'
}

function goPADashboard() {
  page.value = 'padashboard'
}

function goDoneeDashboard() {
  page.value = 'doneedashboard'
}

function goLogout() {
  page.value = 'home'
}

function handleCampaignCreated(campaignData) {
  console.log('New campaign created:', campaignData)
  page.value = 'search'
}

function goFavourites() {
  page.value = 'favourites'
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
    @go-campaigndetail="goDetail"
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
    @go-campaigndetail="goDetail"
  />

  <FraCreationPage
    v-else-if="page === 'creation'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-signup="goSignup"
    @go-search="goSearch"
    @campaign-created="handleCampaignCreated"
  />

  <FraDetailPage
  v-else-if="page === 'campaigndetail'"
  @go-home="goHome"
  @go-logout="goLogout"
  @go-search="goSearch"
  />
  
  <PlatformManagementPage
    v-else-if="page === 'platformmanagement'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-signup="goSignup"
    @go-search="goSearch"
    @go-creation="goCreate"
    @go-campaigndetail="goDetail"
  />
  <PADashboardPage
    v-else-if="page === 'padashboard'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-signup="goSignup"
    @go-search="goSearch"
    @go-creation="goCreate"
    @go-campaigndetail="goDetail"
  />

  <DoneeDashboardPage
    v-else-if="page === 'doneedashboard'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-signup="goSignup"
    @go-search="goSearch"
    @go-creation="goCreate"
    @go-favourites="goFavourites"
    @go-campaigndetail="goDetail"
  />

  <FavouritesPage
    v-else-if="page === 'favourites'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-signup="goSignup"
    @go-search="goSearch"
    @go-creation="goCreate"
    @go-campaigndetail="goDetail"
  />
</template>