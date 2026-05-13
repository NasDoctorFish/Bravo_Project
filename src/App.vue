<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import { supabase } from '../utils/supabase'

import LoginPage from './pages/LoginPage.vue'
import DashboardPage from './pages/DashboardPage.vue'
import HomePage from './pages/HomePage.vue'
import SignupPage from './pages/SignupPage.vue'
import FraSearchPage from './pages/FraSearchPage.vue'
import FraCreationPage from './pages/FraCreationPage.vue'
import FraDetailPage from './pages/FraDetailPage.vue'
import PlatformManagementPage from './pages/PlatformManagementPage.vue'
import AdminManagementPage from './pages/AdminManagementPage.vue'
import DonationHistoryPage from './pages/DonationHistoryPage.vue'
import ReportDashboardPage from './pages/ReportDashboardPage.vue'
import FavouritesPage from './pages/FavouritesPage.vue'

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

function goDetail() {
  page.value = 'campaigndetail'
}

function goPlatformManagement() {
  page.value = 'platformmanagement'
}

function goDashboard() {
  page.value = 'dashboard'
}

function goAdminManagement() {
  page.value = 'adminmanagement'
}

function goDonationHistory() {
  page.value = 'donationhistory'
}

function goLogout() {
  page.value = 'home'
}

function handleCampaignCreated(campaignData) {
  console.log('New campaign created:', campaignData)
  page.value = 'search'
}

function goReportDashboard() {
  page.value = 'reportdashboard'
}

function goFavourites() {
  page.value = 'favourites'
}
</script>

<template>

   <!-- Added for router, this will automatically route pages -->
  <RouterView />
<!--   
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
  
  <DashboardPage
    v-else-if="page === 'dashboard'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-signup="goSignup"
    @go-search="goSearch"
    @go-creation="goCreate"
    @go-campaigndetail="goDetail"
  />

  <AdminManagementPage
    v-else-if="page === 'adminmanagement'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-signup="goSignup"
    @go-search="goSearch"
    @go-creation="goCreate"
    @go-campaigndetail="goDetail"
  />

  <DonationHistoryPage
    v-else-if="page === 'donationhistory'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-signup="goSignup"
    @go-search="goSearch"
    @go-creation="goCreate"
    @go-favourites="goFavourites"
    @go-campaigndetail="goDetail"
  />

  <ReportDashboardPage
    v-else-if="page === 'reportdashboard'"
    @go-home="goHome"
    @go-login="goLogin"
    @go-signup="goSignup"
    @go-search="goSearch"
    @go-creation="goCreate"
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
  /> -->

</template>