<script setup lang="ts">
import { ref } from 'vue'
import LoginPage from './pages/LoginPage.vue'
import DashboardPage from './pages/DashboardPage.vue'

const currentPage = ref<'login' | 'dashboard'>('login')

function goDashboard() {
  currentPage.value = 'dashboard'
}
</script>

<template>
  <LoginPage
    v-if="currentPage === 'login'"
    @login-success="goDashboard"
  />

  <DashboardPage
    v-else-if="currentPage === 'dashboard'"
  />
</template>