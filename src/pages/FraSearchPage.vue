<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="logo">🤝</span>
        <span class="brand-name">FundBridge</span>
      </div>
      <nav class="nav">
        <a v-for="item in navItems" :key="item.label"
          :class="['nav-item', { active: item.label === 'Search' }]" href="#">
          <span>{{ item.icon }}</span> {{ item.label }}
        </a>
      </nav>
    </aside>

    <main class="main">
      <div class="page-header">
        <h2>Search Campaigns</h2>
        <p class="subtitle">Find campaigns to support</p>
      </div>

      <!-- Search Bar -->
      <div class="search-bar-wrap">
        <span class="search-icon">🔍</span>
        <input v-model="query" class="search-input" type="text" placeholder="Search by title, category, or organizer…" @input="runSearch" />
        <button v-if="query" class="clear-btn" @click="query = ''; runSearch()">✕</button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <label>Category</label>
          <select v-model="filters.category" @change="runSearch">
            <option value="">All Categories</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.status" @change="runSearch">
            <option value="">Any Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Sort By</label>
          <select v-model="filters.sort" @change="runSearch">
            <option value="recent">Most Recent</option>
            <option value="funded">Most Funded</option>
            <option value="ending">Ending Soon</option>
          </select>
        </div>
        <button class="btn-clear-filters" @click="clearFilters">Clear Filters</button>
      </div>

      <!-- Results count -->
      <div class="results-meta">
        <span>{{ filteredCampaigns.length }} campaign{{ filteredCampaigns.length !== 1 ? 's' : '' }} found</span>
      </div>

      <!-- Campaign Cards -->
      <div class="campaigns-grid" v-if="filteredCampaigns.length > 0">
        <div class="campaign-card" v-for="c in filteredCampaigns" :key="c.id">
          <div class="card-img-wrap">
            <img :src="c.image" :alt="c.title" class="card-img" />
            <span :class="['badge', c.status]">{{ c.status }}</span>
          </div>
          <div class="card-body">
            <div class="card-category">{{ c.category }}</div>
            <h4 class="card-title">{{ c.title }}</h4>
            <p class="card-desc">{{ c.description }}</p>
            <div class="card-progress">
              <div class="progress-bar"><div class="progress-fill" :style="{ width: (c.raised/c.goal*100) + '%' }"></div></div>
              <div class="progress-info">
                <span>${{ c.raised.toLocaleString() }} raised</span>
                <span>{{ Math.round(c.raised/c.goal*100) }}% of ${{ c.goal.toLocaleString() }}</span>
              </div>
            </div>
            <div class="card-footer">
              <span class="organizer">by {{ c.organizer }}</span>
              <a href="#" class="btn-view">View →</a>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🔎</div>
        <h3>No campaigns found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const query = ref('')
const categories = ['Education', 'Healthcare', 'Environment', 'Disaster Relief', 'Community', 'Arts & Culture']
const filters = ref({ category: '', status: '', sort: 'recent' })

const allCampaigns = [
  { id: 1, title: 'Clean Water for Rural Schools', organizer: 'Jane Doe', category: 'Education', status: 'active', description: 'Installing water filtration in 5 rural schools to benefit over 2,000 students.', goal: 10000, raised: 7400, image: 'https://placehold.co/400x200/d8f3dc/2d6a4f?text=Clean+Water' },
  { id: 2, title: 'School Supplies Drive', organizer: 'Mark Tan', category: 'Education', status: 'completed', description: 'Providing essential school supplies to underprivileged children.', goal: 5000, raised: 5000, image: 'https://placehold.co/400x200/ebf8ff/2b6cb0?text=Supplies' },
  { id: 3, title: 'Medical Aid Fund', organizer: 'Dr. Sarah Lim', category: 'Healthcare', status: 'active', description: 'Supporting low-income families with medical expenses they cannot afford.', goal: 20000, raised: 9200, image: 'https://placehold.co/400x200/fff5f5/c53030?text=Medical+Aid' },
  { id: 4, title: 'Reforestation Project', organizer: 'GreenEarth SG', category: 'Environment', status: 'active', description: 'Planting 10,000 trees across deforested areas in Southeast Asia.', goal: 15000, raised: 4800, image: 'https://placehold.co/400x200/f0fff4/276749?text=Reforestation' },
  { id: 5, title: 'Elderly Care Program', organizer: 'Community Hearts', category: 'Community', status: 'pending', description: 'Providing daily meals and companionship visits to isolated elderly.', goal: 8000, raised: 1200, image: 'https://placehold.co/400x200/fffbeb/b7791f?text=Elderly+Care' },
  { id: 6, title: 'Flood Relief Fund', organizer: 'RedHand SG', category: 'Disaster Relief', status: 'active', description: 'Emergency aid for families affected by recent flooding.', goal: 30000, raised: 22000, image: 'https://placehold.co/400x200/ebf8ff/2c5282?text=Flood+Relief' },
]

const filteredCampaigns = computed(() => {
  let result = [...allCampaigns]
  if (query.value) {
    const q = query.value.toLowerCase()
    result = result.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.organizer.toLowerCase().includes(q)
    )
  }
  if (filters.value.category) result = result.filter(c => c.category === filters.value.category)
  if (filters.value.status) result = result.filter(c => c.status === filters.value.status)
  if (filters.value.sort === 'funded') result.sort((a,b) => (b.raised/b.goal) - (a.raised/a.goal))
  return result
})

function runSearch() {}
function clearFilters() { filters.value = { category: '', status: '', sort: 'recent' }; query.value = '' }

const navItems = [
  { icon: '🏠', label: 'Dashboard' }, { icon: '📋', label: 'Campaigns' },
  { icon: '🔍', label: 'Search' }, { icon: '📊', label: 'Reports' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@700&display=swap');

* { box-sizing: border-box; }
.layout { display: flex; min-height: 100vh; font-family: 'DM Sans', sans-serif; background: #f5f4f0; }
.sidebar { width: 220px; background: #fff; border-right: 1px solid #e2e0db; display: flex; flex-direction: column; padding: 24px 0; position: fixed; height: 100vh; }
.sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 0 20px 24px; border-bottom: 1px solid #f0ede8; }
.logo { font-size: 1.4rem; } .brand-name { font-family: 'Fraunces', serif; font-size: 1.1rem; color: #1a1a1a; }
.nav { padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; text-decoration: none; font-size: 0.88rem; color: #555; font-weight: 500; transition: background 0.15s; }
.nav-item:hover { background: #f5f4f0; } .nav-item.active { background: #e8f5ee; color: #2d6a4f; font-weight: 600; }

.main { margin-left: 220px; flex: 1; padding: 32px 36px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { font-family: 'Fraunces', serif; font-size: 1.5rem; color: #1a1a1a; }
.subtitle { font-size: 0.85rem; color: #888; margin-top: 2px; }

.search-bar-wrap { display: flex; align-items: center; gap: 10px; background: #fff; border: 1.5px solid #ddd; border-radius: 10px; padding: 10px 16px; margin-bottom: 16px; transition: border-color 0.2s; }
.search-bar-wrap:focus-within { border-color: #2d6a4f; }
.search-icon { font-size: 1rem; }
.search-input { flex: 1; border: none; background: transparent; font-size: 0.95rem; font-family: 'DM Sans', sans-serif; color: #1a1a1a; }
.search-input:focus { outline: none; }
.clear-btn { background: none; border: none; cursor: pointer; color: #aaa; font-size: 0.9rem; }

.filters { display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-end; margin-bottom: 16px; }
.filter-group { display: flex; flex-direction: column; gap: 4px; }
.filter-group label { font-size: 0.75rem; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
.filter-group select { border: 1.5px solid #ddd; border-radius: 8px; padding: 8px 12px; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; background: #fff; color: #333; cursor: pointer; }
.filter-group select:focus { outline: none; border-color: #2d6a4f; }
.btn-clear-filters { background: none; border: 1.5px solid #ddd; border-radius: 8px; padding: 8px 14px; font-size: 0.82rem; font-family: 'DM Sans', sans-serif; color: #888; cursor: pointer; align-self: flex-end; }
.btn-clear-filters:hover { border-color: #aaa; color: #555; }

.results-meta { font-size: 0.82rem; color: #888; margin-bottom: 16px; }

.campaigns-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }

.campaign-card { background: #fff; border: 1px solid #e2e0db; border-radius: 12px; overflow: hidden; transition: box-shadow 0.2s; }
.campaign-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }

.card-img-wrap { position: relative; }
.card-img { width: 100%; height: 160px; object-fit: cover; display: block; }
.badge { position: absolute; top: 10px; left: 10px; display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.badge.active { background: #2d6a4f; color: #fff; }
.badge.completed { background: #2b6cb0; color: #fff; }
.badge.pending { background: #b7791f; color: #fff; }

.card-body { padding: 16px; }
.card-category { font-size: 0.72rem; color: #2d6a4f; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.card-title { font-size: 0.98rem; font-weight: 700; color: #1a1a1a; margin: 0 0 6px; line-height: 1.3; }
.card-desc { font-size: 0.83rem; color: #666; line-height: 1.55; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.card-progress { margin-bottom: 14px; }
.progress-bar { height: 5px; background: #eee; border-radius: 4px; overflow: hidden; margin-bottom: 5px; }
.progress-fill { height: 100%; background: #2d6a4f; border-radius: 4px; }
.progress-info { display: flex; justify-content: space-between; font-size: 0.75rem; color: #888; }

.card-footer { display: flex; justify-content: space-between; align-items: center; }
.organizer { font-size: 0.78rem; color: #aaa; }
.btn-view { font-size: 0.82rem; font-weight: 600; color: #2d6a4f; text-decoration: none; }
.btn-view:hover { text-decoration: underline; }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 3rem; margin-bottom: 12px; }
.empty-state h3 { font-size: 1.1rem; color: #1a1a1a; margin: 0 0 6px; }
.empty-state p { font-size: 0.88rem; color: #888; }
</style>
