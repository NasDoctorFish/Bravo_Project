<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['go-home', 'go-logout', 'go-search', 'go-campaign'])

const favorites = ref([])
const loading = ref(true)

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
const accessToken = ref(localStorage.getItem('accessToken') || '')

const fetchFavorites = async () => {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-f9d90081/favorites`,
      { headers: { Authorization: `Bearer ${accessToken.value}` } }
    )

    if (response.ok) {
      const data = await response.json()
      favorites.value = data.campaigns
    }
  } catch (err) {
    console.error('Error fetching favorites:', err)
  } finally {
    loading.value = false
  }
}

const progressPercent = (campaign) =>
  Math.min(Math.round((campaign.raised / campaign.goal) * 100), 100)

onMounted(() => {
  fetchFavorites()
})
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
    <div v-if="loading" class="loading-screen">
      <p>Loading...</p>
    </div>

    <div v-else class="favourites-container">

      <!-- Page Title -->
      <div class="dashboard-header">
        <h1><span class="heart-icon">♥</span> My Favourites</h1>
        <p>Campaigns you've saved for later</p>
      </div>

      <!-- Empty State -->
      <div v-if="favorites.length === 0" class="empty-state">
        <div class="empty-heart">♥</div>
        <p class="empty-title">No favourite campaigns yet</p>
        <p class="empty-sub">Start exploring and save campaigns you care about</p>
        <button class="btn btn-create" @click="emit('go-search')">
          ⌕ Browse Campaigns
        </button>
      </div>

      <!-- Campaigns Grid -->
      <div v-else>
        <p class="results-count">
          {{ favorites.length }} favourite campaign{{ favorites.length !== 1 ? 's' : '' }}
        </p>

        <div class="campaigns-grid">
          <div
            v-for="campaign in favorites"
            :key="campaign.id"
            class="campaign-card"
            @click="emit('go-campaign', campaign)"
          >
            <!-- Image -->
            <div class="campaign-image-wrap">
              <img
                v-if="campaign.imageUrl"
                :src="campaign.imageUrl"
                :alt="campaign.title"
                class="campaign-image"
              />
              <div v-else class="campaign-image-placeholder">🎯</div>
              <span class="campaign-category">{{ campaign.category }}</span>
            </div>

            <!-- Body -->
            <div class="campaign-body">
              <h4 class="campaign-title">{{ campaign.title }}</h4>
              <p class="campaign-desc">{{ campaign.description }}</p>

              <div class="campaign-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: progressPercent(campaign) + '%' }"
                  ></div>
                </div>
                <div class="progress-labels">
                  <span class="progress-raised">${{ campaign.raised?.toLocaleString() }} raised</span>
                  <span class="progress-pct">{{ progressPercent(campaign) }}%</span>
                </div>
              </div>

              <p class="campaign-goal">Goal: ${{ campaign.goal?.toLocaleString() }}</p>
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
/* ── Layout ── */
.favourites-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.favourites-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

/* ── Loading ── */
.loading-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #666;
}

/* ── Page Title ── */
.dashboard-header {
  margin-bottom: 28px;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 15px;
  color: #111;
  display: flex;
  align-items: center;
  gap: 10px;
}

.heart-icon {
  color: #dc2626;
  font-size: 1.8rem;
}

.dashboard-header p {
  color: #666;
  margin: 0;
  text-align: left;
}

/* ── Results Count ── */
.results-count {
  color: #6b7280;
  margin: 0 0 20px;
  font-size: 0.95rem;
}

/* ── Empty State ── */
.empty-state {
  background: #fff;
  border-radius: 12px;
  padding: 64px 24px;
  text-align: center;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}

.empty-heart {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 16px;
  line-height: 1;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 6px;
}

.empty-sub {
  font-size: 0.9rem;
  color: #9ca3af;
  margin: 0 0 24px;
}

.empty-state .btn {
  display: inline-block;
}

/* ── Campaign Cards ── */
.campaigns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.campaign-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.campaign-card:hover {
  box-shadow: 0 6px 18px rgba(0,0,0,0.13);
  transform: translateY(-2px);
}

.campaign-image-wrap {
  position: relative;
  height: 180px;
  background: #f0f0f0;
}

.campaign-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.campaign-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: #f3f4f6;
}

.campaign-category {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 20px;
}

.campaign-body {
  padding: 16px;
}

.campaign-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.campaign-desc {
  font-size: 0.82rem;
  color: #666;
  margin: 0 0 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.progress-bar {
  background: #e5e7eb;
  border-radius: 99px;
  height: 7px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: #6b7280;
  margin-bottom: 6px;
}

.progress-raised {
  font-weight: 600;
  color: #16a34a;
}

.campaign-goal {
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 0;
}
</style>