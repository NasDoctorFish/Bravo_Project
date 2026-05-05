<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['go-home', 'go-login', 'go-logout', 'go-search', 'go-favorites', 'go-history', 'go-campaigndetail'])

const campaigns = ref([])
const donations = ref([])
const favorites = ref([])
const loading = ref(true)

const selectedCategory = ref('')
const startDate = ref('')
const endDate = ref('')
const query = ref('')
const filters = ref({ category: '', status: '', sort: 'recent' })

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const accessToken = ref(localStorage.getItem('accessToken') || '')

const fetchData = async () => {
  try {
    const [campaignsRes, donationsRes, favoritesRes] = await Promise.all([
      fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9d90081/campaigns`,
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
      campaigns.value = data.campaigns
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

const categories = computed(() =>
  [...new Set(campaigns.value.map(c => c.category))]
)

const filteredDonations = computed(() => {
  let result = [...donations.value]

  // Search filter
  if (query.value) {
    const q = query.value.toLowerCase()
    result = result.filter(donation => {
      const campaign = campaigns.value.find(c => c.id === donation.campaignId)
      return campaign && (
        campaign.title.toLowerCase().includes(q) ||
        campaign.category.toLowerCase().includes(q) ||
        campaign.organizer?.toLowerCase().includes(q)
      )
    })
  }

  // Category filter
  if (filters.value.category) {
    result = result.filter(donation => {
      const campaign = campaigns.value.find(c => c.id === donation.campaignId)
      return campaign && campaign.category === filters.value.category
    })
  }

  // Status filter
  if (filters.value.status) {
    result = result.filter(donation => {
      const campaign = campaigns.value.find(c => c.id === donation.campaignId)
      return campaign && campaign.status === filters.value.status
    })
  }

  // Date range filter
  if (startDate.value) {
    result = result.filter(donation => new Date(donation.date) >= new Date(startDate.value))
  }
  if (endDate.value) {
    result = result.filter(donation => new Date(donation.date) <= new Date(endDate.value))
  }

  // Sort
  if (filters.value.sort === 'amount') {
    result.sort((a, b) => b.amount - a.amount)
  } else if (filters.value.sort === 'recent') {
    result.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  return result
})

const progressPercent = (campaign) =>
  Math.min(Math.round((campaign.raised / campaign.goal) * 100), 100)

const getCampaign = (campaignId) => campaigns.value.find(c => c.id === campaignId)

function clearFilters() {
  filters.value = { category: '', status: '', sort: 'recent' }
  query.value = ''
  startDate.value = ''
  endDate.value = ''
}

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
        <h1>Donation History</h1>
        <p>View your past donations</p>
      </div>

      <!-- Search Bar -->
      <div class="search-bar-wrap">
        <span class="search-icon">⌕</span>
        <input
          v-model="query"
          type="text"
          class="search-input"
          placeholder="Search by campaign title, category, or organizer…"
        />
        <button v-if="query" class="clear-btn" @click="query = ''">✕</button>
      </div>

      <!-- Filters -->
      <section class="dashboard-section filters-section">
        <div class="filters-row">
          <div class="form-group">
            <label>Category</label>
            <select v-model="filters.category" class="form-select">
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="filters.status" class="form-select">
              <option value="">Any Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div class="form-group">
            <label>Sort By</label>
            <select v-model="filters.sort" class="form-select">
              <option value="recent">Most Recent</option>
              <option value="amount">Highest Amount</option>
            </select>
          </div>

          <div class="form-group">
            <label>Start Date</label>
            <input type="date" v-model="startDate" class="form-select">
          </div>

          <div class="form-group">
            <label>End Date</label>
            <input type="date" v-model="endDate" class="form-select">
          </div>

          <div class="form-group filter-btn-group">
            <label>&nbsp;</label>
            <button class="btn btn-cancel" @click="clearFilters">Clear Filters</button>
          </div>
        </div>
      </section>

      <!-- Results Count -->
      <p class="results-count">
        {{ filteredDonations.length }} donation{{ filteredDonations.length !== 1 ? 's' : '' }} found
      </p>

      <!-- Donation History -->
      <div v-if="filteredDonations.length === 0" class="empty-state">
        <p>No donations found matching the filters</p>
      </div>

      <div v-else class="donations-list">
        <div
          v-for="donation in filteredDonations"
          :key="donation.id"
          class="donation-item"
        >
          <div class="donation-header">
            <div class="donation-image-wrap">
              <img
                v-if="getCampaign(donation.campaignId)?.imageUrl"
                :src="getCampaign(donation.campaignId).imageUrl"
                :alt="getCampaign(donation.campaignId).title"
                class="donation-image"
              />
              <div v-else class="donation-image-placeholder">🎯</div>
            </div>
            <div class="donation-details">
              <h4 class="donation-title">{{ getCampaign(donation.campaignId)?.title }}</h4>
              <p class="donation-category">{{ getCampaign(donation.campaignId)?.category }}</p>
              <p class="donation-amount">Donated: ${{ donation.amount.toLocaleString() }}</p>
              <p class="donation-date">Date: {{ new Date(donation.date).toLocaleDateString() }}</p>
            </div>
          </div>
          <div class="campaign-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progressPercent(getCampaign(donation.campaignId)) + '%' }"
              ></div>
            </div>
            <div class="progress-labels">
              <span class="progress-raised">${{ getCampaign(donation.campaignId)?.raised?.toLocaleString() }} raised</span>
              <span class="progress-pct">{{ progressPercent(getCampaign(donation.campaignId)) }}%</span>
            </div>
            <p class="campaign-goal">Goal: ${{ getCampaign(donation.campaignId)?.goal?.toLocaleString() }}</p>
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

/* ── Filters ── */
.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

/* ── Search Bar ── */
.search-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.search-icon {
  color: #9ca3af;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 14px 0;
  font-size: 0.95rem;
  color: #111;
}

.search-input::placeholder {
  color: #b0b7c3;
}

.clear-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background 0.15s;
}

.clear-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

/* ── Filters Section ── */
.dashboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 16px;
}

.filters-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filters-row .form-group {
  flex: 1;
  min-width: 140px;
  margin-bottom: 0;
}

.filter-btn-group {
  flex: 0 0 auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fff;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

/* ── Results Count ── */
.results-count {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 16px;
}

/* ── Donations List ── */
.donations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.donation-item {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}

.donation-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.donation-image-wrap {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.donation-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.donation-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: #f3f4f6;
}

.donation-details {
  flex: 1;
}

.donation-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 4px;
}

.donation-category {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 8px;
  text-transform: uppercase;
  font-weight: 600;
}

.donation-amount {
  font-size: 1rem;
  font-weight: 600;
  color: #16a34a;
  margin: 0 0 4px;
}

.donation-date {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.campaign-progress {
  margin-top: 16px;
}
</style>