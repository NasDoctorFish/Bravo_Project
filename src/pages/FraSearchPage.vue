// FraSearchPage.vue
<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
const { isLoggedIn, userId, userRole, sessionReady } = useAuth()
import { ref, onMounted } from 'vue'
import type { FundRaisingActivity } from '../models/FundRaisingActivity'
import { searchFraByFilter } from '../controllers/fraController'

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

const query = ref<string>('')

const selectedCategory = ref<string>('')

const results = ref<FundRaisingActivity[]>([])

async function handleSearch(): Promise<void> {
  results.value = await searchFraByFilter(
    selectedCategory.value,
    query.value,
    filters.value.status
  )
  console.debug('[FraSearchPage] handleSearch -> results:', results.value.length)
}

onMounted(() => {
  handleSearch()
})

const emit = defineEmits(['go-home', 'go-login', 'go-logout', 'go-signup', 'go-create', 'go-campaigndetail'])

const filters = ref({ 
  category: '', 
  status: '', 
  sort: 'recent' 
})

const categories = ['Education', 'Healthcare', 'Environment', 'Disaster Relief', 'Community', 'Arts & Culture']

async function clearFilters() {
  filters.value = { category: '', status: '', sort: 'recent' }
  selectedCategory.value = ''
  query.value = ''
  await handleSearch()
}

const progressPercent = (c: FundRaisingActivity): number =>
  Math.min(
    Math.round((c.currentAmount / c.targetAmount) * 100),
    100
  )

</script>

<template>
  <div class="search-page">

    <!-- Header -->
    <header class="header">
      <RouterLink to="/" class="brand" @click="emit('go-home')">
        <span class="logo">♥</span>
        <span>FundRise</span>
      </RouterLink>

      <nav class="nav">
        <RouterLink to="/fra/search" class="nav-link">⌕ Donate</RouterLink>
        <RouterLink to="/fra/create" class="nav-link" @click="emit('go-create')">Fundraising</RouterLink>
      </nav>

      <nav class="nav-actions">
        <RouterLink to="/" class="nav-link" @click="emit('go-home')">Home</RouterLink>
        <RouterLink to="/fra/create" class="btn btn-primary" @click="emit('go-create')">Start Campaign</RouterLink>
      </nav>
    </header>

    <div class="search-container">

      <!-- Page Title -->
      <div class="dashboard-header">
        <h1>Search Campaigns</h1>
        <p>Find and support causes that matter to you</p>
      </div>

      <!-- Search Bar -->
      <div class="search-bar-wrap">
        <span class="search-icon">⌕</span>
        <input
          v-model="query"
          type="text"
          class="search-input"
          placeholder="Search by title, category, or organizer…"
          @keyup.enter="handleSearch"
        />
        <button v-if="query" class="clear-btn" @click="query = ''">✕</button>
        <button class="btn btn-primary" @click="handleSearch">Search</button>
      </div>

      <section class="dashboard-section filters-section">
        <div class="filters-row">
          <div class="form-group">
            <label>Category</label>
            <select v-model="selectedCategory" @change="handleSearch" class="form-select">
              <option value="">All Categories</option>
              <option v-for="(c, idx) in categories" :key="c" :value="String(idx + 1)">{{ c }}</option>
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
              <option value="funded">Most Funded</option>
              <option value="ending">Ending Soon</option>
            </select>
          </div>

          <div class="form-group filter-btn-group">
            <label>&nbsp;</label>
            <button class="btn btn-cancel" @click="clearFilters">Clear Filters</button>
          </div>
        </div>
      </section>

      <!-- Results Count -->
      <p class="results-count">
        {{ results.length }} campaign{{ results.length !== 1 ? 's' : '' }} found
      </p>

      <!-- Campaign Cards -->
      <div v-if="results.length > 0" class="campaigns-grid">
        <div
          v-for="c in results"
          :key="c.fraId"
          class="campaign-card"
          @click="emit('go-campaigndetail', c); $router.push(`/fra/${c.fraId}`)"
        >
          <!-- Image -->
          <div class="campaign-image-wrap">
            <img :src="c.image" :alt="c.title" class="campaign-image" />
            <span :class="['status-badge-img', 'status-' + c.status]">{{ c.status }}</span>
          </div>

          <!-- Body -->
          <div class="campaign-body">
            <span class="campaign-category">{{ c.categoryId}}</span>
            <h4 class="campaign-title">{{ c.title }}</h4>
            <p class="campaign-desc">{{ c.description }}</p>

            <div class="campaign-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercent(c) + '%' }"></div>
              </div>
              <div class="progress-labels">
                <span class="progress-raised">${{ c.currentAmount.toLocaleString() }} raised</span>
                <span class="progress-pct">{{ progressPercent(c) }}% of ${{ c.targetAmount.toLocaleString() }}</span>
              </div>
            </div>

            <div class="campaign-footer">
              <span class="campaign-organizer">by {{ c.createdBy}}</span>
              <span class="view-link">View →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🔎</div>
        <h3>No campaigns found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>

    </div>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>

  </div>
</template>

<style scoped>
/* ── Shared Header / Nav / Footer ── */
.header {
  display: flex;
  align-items: center;
  padding: 0 32px;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  gap: 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.1rem;
  color: #111;
}
.logo { color: #ef4444; font-size: 1.2rem; }
.nav { display: flex; align-items: center; gap: 16px; }
.nav-actions { display: flex; align-items: center; gap: 16px; margin-left: auto; }
.nav-link { font-size: 0.88rem; color: #555; text-decoration: none; font-weight: 500; }
.nav-link:hover { color: #111; }
.footer {
  text-align: center;
  padding: 24px;
  font-size: 0.8rem;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

/* ── Shared Form / Button ── */
.form-group { margin-bottom: 0; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 0.82rem; color: #374151; }
.form-select {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.88rem;
  color: #111;
  background: #fff;
  box-sizing: border-box;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 9px 16px;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.88rem;
}
.btn-primary { background: #2563eb; color: #fff; }
.btn-cancel { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
.btn-cancel:hover { background: #e5e7eb; }

/* ── Layout ── */
.search-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.search-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

/* ── Page Title ── */
.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 12px;
}

.dashboard-header p {
  color: #666;
  margin: 0;
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

/* ── Filters ── */
.dashboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
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

/* ── Results Count ── */
.results-count {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 16px;
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
}

.campaign-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge-img {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 99px;
  letter-spacing: 0.04em;
}

.status-active    { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.status-completed { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.status-pending   { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }

.campaign-body {
  padding: 16px;
}

.campaign-category {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.06em;
}

.campaign-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin: 6px 0;
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
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.76rem;
  color: #6b7280;
  margin-bottom: 12px;
}

.progress-raised {
  font-weight: 600;
  color: #16a34a;
}

.campaign-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.campaign-organizer {
  font-size: 0.78rem;
  color: #9ca3af;
}

.view-link {
  font-size: 0.82rem;
  font-weight: 600;
  color: #3b82f6;
}

/* ── Empty State ── */
.empty-state {
  background: #fff;
  border-radius: 12px;
  padding: 64px 24px;
  text-align: center;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty-state h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 6px;
}

.empty-state p {
  font-size: 0.88rem;
  color: #9ca3af;
  margin: 0;
}
</style>
