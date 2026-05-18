<script setup lang="ts">

import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFavouritesController } from '../controllers/FavouritesController'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['go-home', 'go-logout', 'go-search', 'go-campaigndetail'])
const router = useRouter()

const { userId: authUserId, isLoggedIn } = useAuth()
const { userId, userRole, sessionReady, signOut } = useAuth()

if (isLoggedIn.value) {
  console.log(
    'Logged in as...\n',
    'userid: ', userId.value,
    '\nRole: ', userRole.value,
    '\nsessionReady: ', sessionReady.value
  )
}
else {
  console.log('Logged Out')
}

// Redirect unauthenticated users to login
watch(sessionReady, (ready) => {
  if (ready && !isLoggedIn.value) router.push('/login')
}, { immediate: true })

const {
  favourites,
  isLoading,
  confirmation,
  error,
  hasFavourites,
  favouriteCount,
  hasError,
  hasConfirmation,
  getFavourites,
  removeFavourite,
} = useFavouritesController()

const canShowFavourites = computed(() => isLoggedIn.value && !!authUserId.value)

watch(authUserId, (uid) => {
  if (uid) {
    getFavourites(uid)
  }
}, { immediate: true })

function viewDetails(campaign: unknown) {
  emit('go-campaigndetail', campaign)
  const fraId = (campaign as any)?.fraId ?? (campaign as any)?.fraid
  if (fraId) router.push(`/fra/${fraId}`)
}

function clickSaveFavourite(fid: string | number) {
  if (!authUserId.value) return
  removeFavourite(String(authUserId.value), fid)
}

function progressWidth(value: number | undefined) {
  return `${Math.min(Math.max(value ?? 0, 0), 100)}%`
}
</script>

<template>
  <div class="favourites-page">

    <!-- Header -->
    <header class="header">
      <RouterLink to="/" class="brand" @click="emit('go-home')">
        <span class="logo">♥</span>
        <span>FundRise</span>
      </RouterLink>
      <nav class="nav">
        <RouterLink to="/fra/search" class="nav-link" @click="emit('go-search')">⌕ Donate</RouterLink>
        <RouterLink to="/fra/create" class="nav-link">Fundraising</RouterLink>
      </nav>
      <nav class="nav-actions">
        <RouterLink to="/" class="nav-link" @click="emit('go-home')">Home</RouterLink>
        <button class="nav-link logout-link" @click="async () => { await signOut(); router.push('/') }">
          <span class="logout-icon">⇢</span> Logout
        </button>
      </nav>
    </header>

    <div class="favourites-container">

      <div class="dashboard-header">
        <h1><span class="heart-icon">♥</span> My Favourites</h1>
        <p>Campaigns you've saved for later</p>
      </div>

      <div v-if="!canShowFavourites" class="login-required-state">
        <p class="state-title">Login required</p>
        <p class="state-copy">Please log in to view your saved campaigns.</p>
      </div>

      <div v-else-if="isLoading" class="loading-screen">
        <div class="loading-spinner"></div>
        <p>Loading your favourites...</p>
      </div>

      <template v-else>
        <div v-if="hasConfirmation" class="confirmation-banner">
          {{ confirmation }}
        </div>

        <div v-if="hasError" class="error-banner">
          {{ error }}
        </div>

        <div v-if="!hasError && !hasFavourites" class="empty-state">
          <div class="empty-heart">♥</div>
          <p class="empty-title">No favourite campaigns yet</p>
          <p class="empty-sub">Start exploring and save campaigns you care about</p>
          <RouterLink to="/fra/search" class="btn btn-create" @click="emit('go-search')">
            Browse Campaigns
          </RouterLink>
        </div>

        <div v-else-if="hasFavourites">
          <p class="results-count">
            {{ favouriteCount }} favourite campaign{{ favouriteCount !== 1 ? 's' : '' }}
          </p>

          <div class="campaigns-grid">

            <article
              v-for="item in favourites"
              :key="item.favourite.favouriteid || item.favourite.fraid"
              class="campaign-card"
            >
              <div
                class="campaign-image-wrap"
                @click="viewDetails(item.campaign)"
              >
                <img
                  v-if="item.campaign.image"
                  :src="item.campaign.image"
                  :alt="item.campaign.title"
                  class="campaign-image"
                />
                <div v-else class="campaign-image-placeholder">Campaign Image</div>
              </div>

              <div class="campaign-body">
                <div class="campaign-meta">
                  <span :class="['status-badge', 'status-' + (item.campaign.status?.toLowerCase() || 'unknown')]">
                    {{ item.campaign.status || 'unknown' }}
                  </span>
                  <span class="campaign-category">Category {{ item.campaign.categoryId }}</span>
                </div>

                <h4 class="campaign-title">
                  {{ item.campaign.title || 'Untitled campaign' }}
                </h4>

                <p class="campaign-desc">
                  {{ item.campaign.description || 'No description available.' }}
                </p>

                <div class="campaign-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: progressWidth(item.campaign.progressPercent) }"
                    ></div>
                  </div>
                  <div class="progress-labels">
                    <span class="progress-raised">
                      ${{ item.campaign.currentAmount?.toLocaleString() ?? '0' }} raised
                    </span>
                    <span class="progress-pct">{{ item.campaign.progressPercent ?? 0 }}%</span>
                  </div>
                </div>

                <p class="campaign-goal">
                  Goal: ${{ item.campaign.targetAmount?.toLocaleString() ?? '0' }}
                </p>

                <div class="campaign-actions">
                  <button
                    class="btn btn-details"
                    @click="viewDetails(item.campaign)"
                  >
                    View Details
                  </button>
                  <button
                    class="btn btn-remove"
                    @click.stop="clickSaveFavourite(item.favourite.fraId)"
                    title="Remove from favourites"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </template>

    </div>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>

  </div>
</template>

<style scoped>
/* Layout */
.favourites-page      { min-height: 100vh; display: flex; flex-direction: column; background: #f5f5f5; }
.favourites-container { max-width: 1100px; margin: 0 auto; padding: 40px 24px; flex: 1; width: 100%; box-sizing: border-box; }

/* Loading */
.loading-screen, .login-required-state { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; min-height: 240px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; font-size: 1rem; color: #6b7280; text-align: center; padding: 24px; }
.loading-spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.75s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-title { color: #111827; font-size: 1.2rem; font-weight: 700; margin: 0; }
.state-copy { margin: 0; }

/* Banners */
.confirmation-banner { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; border-radius: 8px; padding: 10px 16px; font-size: 0.88rem; font-weight: 600; margin-bottom: 16px; }
.error-banner        { background: #fff5f5; border: 1px solid #fecaca; color: #b91c1c; border-radius: 8px; padding: 10px 16px; font-size: 0.88rem; margin-bottom: 16px; }

/* Page Title */
.dashboard-header    { margin-bottom: 28px; }
.dashboard-header h1 { font-size: 2rem; font-weight: 700; margin: 0 0 8px; color: #111; display: flex; align-items: center; gap: 10px; }
.heart-icon          { color: #dc2626; font-size: 1.8rem; }
.dashboard-header p  { color: #666; margin: 0; }

/* Results Count */
.results-count { color: #6b7280; margin: 0 0 20px; font-size: 0.95rem; }

/* Empty State */
.empty-state  { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 64px 24px; text-align: center; }
.empty-heart  { font-size: 4rem; color: #d1d5db; margin-bottom: 16px; line-height: 1; }
.empty-title  { font-size: 1.1rem; font-weight: 600; color: #374151; margin: 0 0 6px; }
.empty-sub    { font-size: 0.9rem; color: #9ca3af; margin: 0 0 24px; }

/* Campaign Cards */
.campaigns-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

.campaign-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; transition: box-shadow 0.2s, transform 0.2s; }
.campaign-card:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.10); transform: translateY(-2px); }

.campaign-image-wrap { position: relative; height: 180px; background: #f0f0f0; cursor: pointer; }
.campaign-image { width: 100%; height: 100%; object-fit: cover; }
.campaign-image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; color: #6b7280; background: #f3f4f6; }

.campaign-body  { padding: 16px; }
.campaign-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
.campaign-category { color: #6b7280; font-size: 0.78rem; font-weight: 600; }
.status-badge { border-radius: 999px; font-size: 0.72rem; font-weight: 700; line-height: 1; padding: 5px 9px; text-transform: capitalize; }
.status-active    { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.status-completed { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.status-pending   { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.status-unknown   { background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; }
.campaign-title {
  font-size: 1rem; font-weight: 700; color: #111; margin: 0 0 6px; cursor: pointer;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.campaign-title:hover { color: #2563eb; }
.campaign-desc {
  font-size: 0.82rem; color: #666; margin: 0 0 14px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* Progress */
.progress-bar    { background: #e5e7eb; border-radius: 99px; height: 7px; overflow: hidden; margin-bottom: 6px; }
.progress-fill   { background: linear-gradient(90deg, #3b82f6, #2563eb); height: 100%; border-radius: 99px; transition: width 0.4s; }
.progress-labels { display: flex; justify-content: space-between; font-size: 0.78rem; color: #6b7280; margin-bottom: 6px; }
.progress-raised { font-weight: 600; color: #16a34a; }
.campaign-goal   { font-size: 0.78rem; color: #9ca3af; margin: 0 0 12px; }

/* Buttons */
.btn        { padding: 8px 18px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.btn-create { background: #2563eb; color: #fff; }
.btn-create:hover { background: #1d4ed8; }
.campaign-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.btn-details { background: #2563eb; color: #fff; }
.btn-details:hover { background: #1d4ed8; }
.btn-remove { background: #fff0f0; border: 1px solid #fecaca; color: #dc2626; border-radius: 8px; padding: 7px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-remove:hover { background: #fee2e2; }

/* Header */
.header       { display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 60px; background: #fff; border-bottom: 1px solid #e5e7eb; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.brand        { display: flex; align-items: center; gap: 8px; text-decoration: none; font-weight: 700; font-size: 1.1rem; color: #111; }
.logo         { color: #e53e3e; font-size: 1.3rem; }
.nav, .nav-actions { display: flex; align-items: center; gap: 20px; }
.nav-link     { text-decoration: none; font-size: 0.9rem; color: #374151; }
.nav-link:hover { color: #2563eb; }
.logout-link  { color: #e53e3e; }

/* Footer */
.footer { background: #1e293b; color: #94a3b8; text-align: center; padding: 20px; font-size: 0.82rem; }

@media (max-width: 720px) {
  .header { height: auto; padding: 14px 18px; align-items: flex-start; gap: 12px; flex-direction: column; }
  .nav, .nav-actions { flex-wrap: wrap; gap: 12px; }
  .favourites-container { padding: 28px 16px; }
  .dashboard-header h1 { font-size: 1.6rem; }
  .campaigns-grid { grid-template-columns: 1fr; }
}
</style>
