<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['go-home', 'go-login', 'go-logout', 'go-search', 'go-favorites', 'go-history', 'go-campaign'])

const campaigns = ref([])
const donations = ref([])
const favorites = ref([])
const loading = ref(true)

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const accessToken = ref(localStorage.getItem('accessToken') || '')

const fetchData = async () => {
  try {
    const [campaignsRes, donationsRes, favoritesRes] = await Promise.all([
      fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9d90081/campaigns?status=active`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      ),
      fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9d90081/donations`,
        { headers: { Authorization: `Bearer ${accessToken.value}` } }
      ),
      fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9d90081/favorites`,
        { headers: { Authorization: `Bearer ${accessToken.value}` } }
      ),
    ])

    if (campaignsRes.ok) {
      const data = await campaignsRes.json()
      campaigns.value = data.campaigns.slice(0, 6)
    }

    if (donationsRes.ok) {
      const data = await donationsRes.json()
      donations.value = data.donations
    }

    if (favoritesRes.ok) {
      const data = await favoritesRes.json()
      favorites.value = data.campaigns
    }
  } catch (err) {
    console.error('Error fetching data:', err)
  } finally {
    loading.value = false
  }
}

const totalDonated = computed(() =>
  donations.value.reduce((sum, d) => sum + d.amount, 0)
)

const campaignsSupported = computed(() =>
  new Set(donations.value.map((d) => d.campaignId)).size
)

const progressPercent = (campaign) =>
  Math.min(Math.round((campaign.raised / campaign.goal) * 100), 100)

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="donee-page">

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

    <div v-else class="donee-container">

      <!-- Page Title -->
      <div class="dashboard-header">
        <h1>Donee Dashboard</h1>
        <p>Discover campaigns and make a difference</p>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-green">💵</div>
          <div class="stat-info">
            <p class="stat-label">Total Donated</p>
            <p class="stat-value">${{ totalDonated.toLocaleString() }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-blue">📈</div>
          <div class="stat-info">
            <p class="stat-label">Campaigns Supported</p>
            <p class="stat-value">{{ campaignsSupported }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-purple">♥</div>
          <div class="stat-info">
            <p class="stat-label">Favorites</p>
            <p class="stat-value">{{ favorites.length }}</p>
          </div>
        </div>

      </div>

      <!-- Quick Action Cards -->
      <div class="action-grid">

        <a href="#" class="action-card action-blue" @click.prevent="emit('go-search')">
          <span class="action-icon">⌕</span>
          <h3>Browse Campaigns</h3>
          <p>Discover new causes to support</p>
        </a>

        <a href="#" class="action-card action-purple" @click.prevent="emit('go-favorites')">
          <span class="action-icon">♥</span>
          <h3>My Favorites</h3>
          <p>View saved campaigns</p>
        </a>

        <a href="#" class="action-card action-green" @click.prevent="emit('go-history')">
          <span class="action-icon">💵</span>
          <h3>Donation History</h3>
          <p>Track your contributions</p>
        </a>

      </div>

      <!-- Featured Campaigns -->
      <div class="section-header">
        <h2>Featured Campaigns</h2>
        <a href="#" class="view-all-link" @click.prevent="emit('go-search')">View all</a>
      </div>

      <div v-if="campaigns.length === 0" class="empty-state">
        <p>No active campaigns available</p>
      </div>

      <div v-else class="campaigns-grid">
        <div
          v-for="campaign in campaigns"
          :key="campaign.id"
          class="campaign-card"
          @click="emit('go-campaign', campaign)"
        >
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

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.donee-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.donee-container {
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
  margin: 0 0 4px;
  color: #111;
  text-align: left;
}

.dashboard-header p {
  color: #666;
  margin: 0;
  text-align: left;
}

/* ── Stat Cards ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}

.stat-icon-wrap {
  font-size: 1.4rem;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.stat-icon-green  { background: #dcfce7; }
.stat-icon-blue   { background: #dbeafe; }
.stat-icon-purple { background: #f3e8ff; }

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0 0 4px;
  font-weight: 500;
  text-align: left;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  text-align: left;
}

/* ── Action Cards ── */
.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 36px;
}

.action-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-radius: 12px;
  text-decoration: none;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transition: box-shadow 0.2s, transform 0.2s;
}

.action-card:hover {
  box-shadow: 0 8px 20px rgba(0,0,0,0.18);
  transform: translateY(-2px);
}

.action-blue   { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.action-purple { background: linear-gradient(135deg, #a855f7, #9333ea); }
.action-green  { background: linear-gradient(135deg, #22c55e, #16a34a); }

.action-icon {
  font-size: 1.8rem;
  margin-bottom: 12px;
}

.action-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 6px;
}

.action-card p {
  font-size: 0.85rem;
  margin: 0;
  opacity: 0.85;
}

/* ── Section Header ── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #111;
}

.view-all-link {
  font-size: 0.9rem;
  color: #2563eb;
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}

/* ── Empty State ── */
.empty-state {
  background: #fff;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  color: #666;
  font-size: 1rem;
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