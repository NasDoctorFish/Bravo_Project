<script setup lang="ts">
// AppTopBar.vue — Global navigation bar, rendered once in App.vue above <RouterView />.
// Uses vue-router for navigation and useAuth() for session state.
// Role codes: UA = User Admin, PM = Platform Manager, DR = Donor, DO = Donee

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { isLoggedIn, userRole, userName, sessionReady, signOut } = useAuth()

const role = computed(() => userRole.value ?? '')

// ── Role predicates ──────────────────────────────────────────────────────────
const isUA = computed(() => role.value === 'UA')
const isPM = computed(() => role.value === 'PM')
const isDR = computed(() => role.value === 'DR')
const isDO = computed(() => role.value === 'DO')

// ── Navigation helpers ───────────────────────────────────────────────────────
// Adjust paths here if routes change.
const nav = {
  home:             () => router.push('/'),
  search:           () => router.push('/fra/search'),
  login:            () => router.push('/login'),
  signup:           () => router.push('/signup'),
  dashboard:        () => router.push('/dashboard'),
  admin:            () => router.push('/admin'),
  platform:         () => router.push('/platform'),
  reports:          () => router.push('/reports'),
  fraCreate:        () => router.push('/fra/create'),
  fraHistory:       () => router.push('/fra-history'),
  donationHistory:  () => router.push('/donation-history'),
  favourites:       () => router.push('/favourites'),
}

async function handleLogout() {
  await signOut()
  router.push('/')
}

// ── Role label shown in the badge ────────────────────────────────────────────
const roleLabel = computed(() => {
  const labels: Record<string, string> = {
    UA: 'User Admin',
    PM: 'Platform Manager',
    DR: 'Donor',
    DO: 'Donee',
  }
  return labels[role.value] ?? role.value
})
</script>

<template>
  <header class="topbar">

    <!-- Brand -->
    <button class="brand" @click="nav.home()">
      <span class="brand-heart">♥</span>
      <span>FundRise</span>
    </button>

    <!-- Common nav (visible to all) -->
    <nav class="nav-group">
      <button class="nav-btn" @click="nav.search()">⌕ Donate</button>

      <!-- UA links -->
      <template v-if="isLoggedIn && isUA">
        <button class="nav-btn" @click="nav.dashboard()">Dashboard</button>
        <button class="nav-btn" @click="nav.admin()">Admin</button>
        <button class="nav-btn" @click="nav.platform()">Platform</button>
        <button class="nav-btn" @click="nav.reports()">Reports</button>
        <button class="nav-btn" @click="nav.favourites()">♥ Favourites</button>
      </template>

      <!-- PM links -->
      <template v-else-if="isLoggedIn && isPM">
        <button class="nav-btn" @click="nav.dashboard()">Dashboard</button>
        <button class="nav-btn" @click="nav.platform()">Platform</button>
        <button class="nav-btn" @click="nav.reports()">Reports</button>
        <button class="nav-btn" @click="nav.favourites()">♥ Favourites</button>
      </template>

      <!-- DR (Donor) links -->
      <template v-else-if="isLoggedIn && isDR">
        <button class="nav-btn" @click="nav.dashboard()">Dashboard</button>
        <button class="nav-btn" @click="nav.fraCreate()">Fundraising</button>
        <button class="nav-btn" @click="nav.donationHistory()">Donations</button>
        <button class="nav-btn" @click="nav.fraHistory()">FRA History</button>
        <button class="nav-btn" @click="nav.favourites()">♥ Favourites</button>
      </template>

      <!-- DO (Donee) links -->
      <template v-else-if="isLoggedIn && isDO">
        <button class="nav-btn" @click="nav.dashboard()">Dashboard</button>
        <button class="nav-btn" @click="nav.fraCreate()">Create FRA</button>
        <button class="nav-btn" @click="nav.fraHistory()">FRA History</button>
        <button class="nav-btn" @click="nav.favourites()">♥ Favourites</button>
      </template>
    </nav>

    <!-- Right side: auth actions -->
    <nav class="nav-actions">
      <template v-if="!sessionReady">
        <!-- Keep empty while session is being restored -->
      </template>

      <template v-else-if="isLoggedIn">
        <span class="role-badge">{{ roleLabel }}</span>
        <span v-if="userName" class="user-name">{{ userName }}</span>
        <button class="nav-btn logout-btn" @click="handleLogout">⇢ Logout</button>
      </template>

      <template v-else>
        <button class="nav-btn" @click="nav.login()">Login</button>
        <button class="nav-btn signup-btn" @click="nav.signup()">Sign Up</button>
      </template>
    </nav>

  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
  height: 52px;
  background: #1e293b;
  color: #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 200;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #fff;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  padding: 4px 10px 4px 0;
  margin-right: 8px;
  white-space: nowrap;
}
.brand-heart { color: #f87171; font-size: 1.1rem; }

/* Nav groups */
.nav-group {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  flex-wrap: wrap;
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
}

/* Buttons */
.nav-btn {
  background: none;
  border: none;
  color: #cbd5e1;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}
.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.logout-btn { color: #fca5a5; }
.logout-btn:hover { background: rgba(239, 68, 68, 0.15); color: #f87171; }

.signup-btn {
  background: #2563eb;
  color: #fff;
  font-weight: 700;
}
.signup-btn:hover { background: #1d4ed8; }

/* Role badge */
.role-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}
.user-name {
  font-size: 0.82rem;
  color: #e2e8f0;
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
