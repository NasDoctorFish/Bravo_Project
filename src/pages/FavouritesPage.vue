//  BOUNDARY — FavouritesPage
<script setup>

import { onMounted } from 'vue'
import { useFavouritesController } from './FavouritesController.js'

const emit = defineEmits(['go-home', 'go-logout', 'go-search', 'go-campaigndetail'])

const {
  userId,
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

onMounted(() => {
  getFavourites(userId.value)   // diagram: getFavourites(userId)
})


/**
 * @param {string} fid
 */
function clickSaveFavourite(fid) {
  removeFavourite(userId.value, fid)   // delegates to Control
}
</script>

<template>
  <div class="favourites-page">

    <!-- Header -->
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
        <a href="#" class="nav-link logout-link" @click.prevent="emit('go-logout')">
          <span class="logout-icon">⇢</span> Logout
        </a>
      </nav>
    </header>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-screen">
      <div class="loading-spinner"></div>
      <p>Loading your favourites…</p>
    </div>

    <div v-else class="favourites-container">

      <!-- Page Title -->
      <div class="dashboard-header">
        <h1><span class="heart-icon">♥</span> My Favourites</h1>
        <p>Campaigns you've saved for later</p>
      </div>

      <!-- showConfirmation() -->
      <div v-if="hasConfirmation" class="confirmation-banner">
        ✅ {{ confirmation }}
      </div>

      <!-- displayError(msg) -->
      <div v-if="hasError" class="error-banner">
        ⚠ {{ error }}
      </div>

      <!-- Empty State -->
      <div v-if="!hasFavourites" class="empty-state">
        <div class="empty-heart">♥</div>
        <p class="empty-title">No favourite campaigns yet</p>
        <p class="empty-sub">Start exploring and save campaigns you care about</p>
        <button class="btn btn-create" @click="emit('go-search')">
          ⌕ Browse Campaigns
        </button>
      </div>

      <!--displayFavList(favs) -->
      <div v-else>
        <p class="results-count">
          {{ favouriteCount }} favourite campaign{{ favouriteCount !== 1 ? 's' : '' }}
        </p>

        <div class="campaigns-grid">

          <div
            v-for="item in favourites"
            :key="item.favourite.favouriteId"
            class="campaign-card"
          >
            <!-- Image -->
            <div
              class="campaign-image-wrap"
              @click="emit('go-campaigndetail', item.campaign)"
            >
              <img
                v-if="item.campaign.image"
                :src="item.campaign.image"
                :alt="item.campaign.title"
                class="campaign-image"
              />
              <div v-else class="campaign-image-placeholder">🎯</div>
              <span class="campaign-category">{{ item.campaign.categoryId }}</span>
            </div>

            <!-- Body -->
            <div class="campaign-body">
              <h4
                class="campaign-title"
                @click="emit('go-campaigndetail', item.campaign)"
              >{{ item.campaign.title }}</h4>

              <p class="campaign-desc">{{ item.campaign.description }}</p>

              <div class="campaign-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: item.campaign.progressPercent + '%' }"
                  ></div>
                </div>
                <div class="progress-labels">
                  <span class="progress-raised">
                    ${{ item.campaign.currentAmount?.toLocaleString() }} raised
                  </span>
                  <span class="progress-pct">{{ item.campaign.progressPercent }}%</span>
                </div>
              </div>

              <p class="campaign-goal">
                Goal: ${{ item.campaign.targetAmount?.toLocaleString() }}
              </p>

              <!-- clickSaveFavourite() -->
              <button
                class="btn btn-remove"
                @click.stop="clickSaveFavourite(item.favourite.fraId)"
                title="Remove from favourites"
              >
                ♥ Remove
              </button>
            </div>
          </div>
        </div>
      </div>

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
.loading-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; font-size: 1rem; color: #6b7280; }
.loading-spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.75s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

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

/* ── Empty State ── */
.empty-state  { background: #fff; border-radius: 12px; padding: 64px 24px; text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
.empty-heart  { font-size: 4rem; color: #d1d5db; margin-bottom: 16px; line-height: 1; }
.empty-title  { font-size: 1.1rem; font-weight: 600; color: #374151; margin: 0 0 6px; }
.empty-sub    { font-size: 0.9rem; color: #9ca3af; margin: 0 0 24px; }

/* Campaign Cards */
.campaigns-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

.campaign-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 6px rgba(0,0,0,0.08); transition: box-shadow 0.2s, transform 0.2s; }
.campaign-card:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.13); transform: translateY(-2px); }

.campaign-image-wrap { position: relative; height: 180px; background: #f0f0f0; cursor: pointer; }
.campaign-image { width: 100%; height: 100%; object-fit: cover; }
.campaign-image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; background: #f3f4f6; }

.campaign-category { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.55); color: #fff; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; }

.campaign-body  { padding: 16px; }
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
.btn-remove { width: 100%; background: #fff0f0; border: 1px solid #fecaca; color: #dc2626; border-radius: 8px; padding: 7px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-remove:hover { background: #fee2e2; }

/* Header */
.header       { display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 60px; background: #fff; border-bottom: 1px solid #e5e7eb; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.brand        { display: flex; align-items: center; gap: 8px; text-decoration: none; font-weight: 700; font-size: 1.1rem; color: #111; }
.logo         { color: #e53e3e; font-size: 1.3rem; }
.nav, .nav-actions { display: flex; align-items: center; gap: 20px; }
.nav-link     { text-decoration: none; font-size: 0.9rem; color: #374151; }
.nav-link:hover { color: #2563eb; }
.logout-link  { color: #6b7280; }

/* Footer */
.footer { background: #1e293b; color: #94a3b8; text-align: center; padding: 20px; font-size: 0.82rem; }
</style>
