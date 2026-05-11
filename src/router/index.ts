// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import AdminManagementPage    from '../pages/AdminManagementPage.vue'
import DashboardPage          from '../pages/DashboardPage.vue'
import DonationHistoryPage    from '../pages/DonationHistoryPage.vue'
import FavouritesPage         from '../pages/FavouritesPage.vue'
import FraCreationPage        from '../pages/FraCreationPage.vue'
import FraDetailPage          from '../pages/FraDetailPage.vue'
import FraHistoryPage         from '../pages/FraHistoryPage.vue'
import FraSearchPage          from '../pages/FraSearchPage.vue'
import HomePage               from '../pages/HomePage.vue'
import LoginPage              from '../pages/LoginPage.vue'
import PlatformManagementPage from '../pages/PlatformManagementPage.vue'
import ReportDashboardPage    from '../pages/ReportDashboardPage.vue'
import SignupPage             from '../pages/SignupPage.vue'

const routes = [
  { path: '/',                   component: HomePage },
  { path: '/login',              component: LoginPage },
  { path: '/signup',             component: SignupPage },
  { path: '/dashboard',          component: DashboardPage },
  { path: '/admin',              component: AdminManagementPage },
  { path: '/donation-history',   component: DonationHistoryPage },
  { path: '/favourites',         component: FavouritesPage },
  { path: '/fra/create',         component: FraCreationPage },
  { path: '/fra-history',        component: FraHistoryPage },
  { path: '/fra/search',         component: FraSearchPage },
  { path: '/fra/:id',            component: FraDetailPage },  //:id get every kinds of string, hence should be after actual string route
  { path: '/platform',           component: PlatformManagementPage },
  { path: '/reports',            component: ReportDashboardPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router