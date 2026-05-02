<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="logo">🤝</span>
        <span class="brand-name">FundBridge</span>
      </div>
      <nav class="nav">
        <a v-for="item in navItems" :key="item.label"
          :class="['nav-item', { active: item.label === 'Platform' }]" href="#">
          <span>{{ item.icon }}</span> {{ item.label }}
        </a>
      </nav>
      <div class="sidebar-badge">Platform Manager</div>
    </aside>

    <main class="main">
      <div class="page-header">
        <div>
          <h2>Platform Management</h2>
          <p class="subtitle">Review and approve fundraising campaigns</p>
        </div>
        <div class="header-stats">
          <div class="hstat"><span class="hstat-val">{{ pendingCount }}</span><span class="hstat-lbl">Pending Review</span></div>
          <div class="hstat"><span class="hstat-val">{{ flaggedCount }}</span><span class="hstat-lbl">Flagged</span></div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab" :class="['tab', { active: activeTab === tab }]" @click="activeTab = tab">
          {{ tab }}
          <span class="tab-count" v-if="tabCounts[tab]">{{ tabCounts[tab] }}</span>
        </button>
      </div>

      <!-- Filters -->
      <div class="toolbar">
        <div class="search-wrap">
          <span>🔍</span>
          <input v-model="searchQuery" type="text" placeholder="Search campaigns…" />
        </div>
        <select v-model="filterCategory">
          <option value="">All Categories</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <!-- Campaign List -->
      <div class="campaign-list">
        <div class="campaign-row" v-for="c in filteredCampaigns" :key="c.id">
          <div class="campaign-left">
            <img :src="c.image" class="campaign-thumb" :alt="c.title" />
            <div class="campaign-info">
              <div class="campaign-title">{{ c.title }}</div>
              <div class="campaign-meta">
                <span>{{ c.organizer }}</span>
                <span class="dot">·</span>
                <span>{{ c.category }}</span>
                <span class="dot">·</span>
                <span>Goal: ${{ c.goal.toLocaleString() }}</span>
                <span class="dot">·</span>
                <span>Submitted {{ c.submitted }}</span>
              </div>
              <p class="campaign-desc">{{ c.description }}</p>
              <div class="campaign-flags" v-if="c.flags && c.flags.length">
                <span class="flag-chip" v-for="f in c.flags" :key="f">⚠️ {{ f }}</span>
              </div>
            </div>
          </div>

          <div class="campaign-right">
            <span :class="['status-badge', c.status]">{{ c.status }}</span>
            <div class="action-buttons">
              <button class="btn-detail" @click="openDetail(c)">View Details</button>
              <button v-if="c.status === 'pending'" class="btn-approve" @click="approve(c)">✓ Approve</button>
              <button v-if="c.status === 'pending'" class="btn-reject" @click="reject(c)">✕ Reject</button>
              <button v-if="c.status === 'active'" class="btn-flag" @click="flag(c)">⚠️ Flag</button>
              <button v-if="c.status === 'active'" class="btn-reject" @click="suspend(c)">⏸ Suspend</button>
            </div>
          </div>
        </div>

        <div v-if="filteredCampaigns.length === 0" class="empty-state">
          <div>📭</div>
          <p>No campaigns in this category.</p>
        </div>
      </div>
    </main>

    <!-- Detail Drawer -->
    <div class="drawer-overlay" v-if="selectedCampaign" @click.self="selectedCampaign = null">
      <div class="drawer">
        <div class="drawer-header">
          <h3>{{ selectedCampaign.title }}</h3>
          <button class="drawer-close" @click="selectedCampaign = null">✕</button>
        </div>
        <div class="drawer-body">
          <img :src="selectedCampaign.image" class="drawer-img" />
          <div class="drawer-section">
            <div class="dl"><span class="dt">Organizer</span><span class="dd">{{ selectedCampaign.organizer }}</span></div>
            <div class="dl"><span class="dt">Category</span><span class="dd">{{ selectedCampaign.category }}</span></div>
            <div class="dl"><span class="dt">Goal</span><span class="dd">${{ selectedCampaign.goal?.toLocaleString() }}</span></div>
            <div class="dl"><span class="dt">Submitted</span><span class="dd">{{ selectedCampaign.submitted }}</span></div>
            <div class="dl"><span class="dt">Status</span><span class="dd"><span :class="['status-badge', selectedCampaign.status]">{{ selectedCampaign.status }}</span></span></div>
          </div>
          <div class="drawer-desc">
            <h4>Description</h4>
            <p>{{ selectedCampaign.description }}</p>
          </div>
          <div class="drawer-actions" v-if="selectedCampaign.status === 'pending'">
            <button class="btn-approve" @click="approve(selectedCampaign); selectedCampaign = null">✓ Approve</button>
            <button class="btn-reject" @click="reject(selectedCampaign); selectedCampaign = null">✕ Reject</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('Pending')
const searchQuery = ref('')
const filterCategory = ref('')
const selectedCampaign = ref(null)

const tabs = ['Pending', 'Active', 'Rejected', 'Flagged', 'All']
const categories = ['Education', 'Healthcare', 'Environment', 'Disaster Relief', 'Community']

const navItems = [
  { icon: '🏠', label: 'Dashboard' }, { icon: '📋', label: 'Campaigns' },
  { icon: '🔍', label: 'Search' }, { icon: '📊', label: 'Reports' },
  { icon: '🛡️', label: 'Platform' },
]

const campaigns = ref([
  { id: 1, title: 'Solar Panels for Remote Villages', organizer: 'EcoFund SG', category: 'Environment', goal: 25000, status: 'pending', submitted: '2 days ago', description: 'Installing solar panels in 10 off-grid villages to provide clean electricity to 500+ families.', image: 'https://placehold.co/80x60/d8f3dc/2d6a4f?text=Solar', flags: [] },
  { id: 2, title: 'Free Coding Bootcamp for Youth', organizer: 'TechBridge', category: 'Education', goal: 12000, status: 'pending', submitted: '1 day ago', description: 'A 3-month intensive coding program for underprivileged youth aged 16-24.', image: 'https://placehold.co/80x60/ebf8ff/2b6cb0?text=Code', flags: [] },
  { id: 3, title: 'Flood Relief Nairobi', organizer: 'GlobalAid', category: 'Disaster Relief', goal: 50000, status: 'pending', submitted: '5 hours ago', description: 'Emergency shelter and food for 1,200 families displaced by severe flooding.', image: 'https://placehold.co/80x60/fffbeb/b7791f?text=Relief', flags: ['Unverified organizer'] },
  { id: 4, title: 'Clean Water Initiative', organizer: 'Jane Doe', category: 'Education', goal: 10000, status: 'active', submitted: '2 weeks ago', description: 'Installing water filtration in 5 rural schools to benefit over 2,000 students.', image: 'https://placehold.co/80x60/d8f3dc/2d6a4f?text=Water', flags: [] },
  { id: 5, title: 'Suspicious Fundraiser XYZ', organizer: 'Unknown', category: 'Community', goal: 99999, status: 'flagged', submitted: '3 days ago', description: 'Vague description with no verifiable information about fund usage.', image: 'https://placehold.co/80x60/fff5f5/c53030?text=Flag', flags: ['Duplicate campaign', 'No beneficiary info'] },
  { id: 6, title: 'Pet Shelter Renovation', organizer: 'PawsCare', category: 'Community', goal: 8000, status: 'rejected', submitted: '1 week ago', description: 'Renovating our animal shelter to accommodate 50 more rescued pets.', image: 'https://placehold.co/80x60/fefcbf/b7791f?text=Pets', flags: [] },
])

const tabCounts = computed(() => ({
  Pending: campaigns.value.filter(c => c.status === 'pending').length,
  Active: campaigns.value.filter(c => c.status === 'active').length,
  Rejected: campaigns.value.filter(c => c.status === 'rejected').length,
  Flagged: campaigns.value.filter(c => c.status === 'flagged').length,
  All: campaigns.value.length,
}))

const pendingCount = computed(() => tabCounts.value.Pending)
const flaggedCount = computed(() => tabCounts.value.Flagged)

const filteredCampaigns = computed(() => {
  let result = campaigns.value
  if (activeTab.value !== 'All') result = result.filter(c => c.status === activeTab.value.toLowerCase())
  if (searchQuery.value) result = result.filter(c => c.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
  if (filterCategory.value) result = result.filter(c => c.category === filterCategory.value)
  return result
})

function openDetail(c) { selectedCampaign.value = c }
function approve(c) { c.status = 'active' }
function reject(c) { c.status = 'rejected' }
function flag(c) { c.status = 'flagged' }
function suspend(c) { c.status = 'rejected' }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@700&display=swap');
* { box-sizing: border-box; }
.layout { display: flex; min-height: 100vh; font-family: 'DM Sans', sans-serif; background: #f5f4f0; }
.sidebar { width: 220px; background: #fff; border-right: 1px solid #e2e0db; display: flex; flex-direction: column; padding: 24px 0; position: fixed; height: 100vh; }
.sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 0 20px 24px; border-bottom: 1px solid #f0ede8; }
.logo { font-size: 1.4rem; } .brand-name { font-family: 'Fraunces', serif; font-size: 1.1rem; color: #1a1a1a; }
.nav { padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; text-decoration: none; font-size: 0.88rem; color: #555; font-weight: 500; transition: background 0.15s; }
.nav-item:hover { background: #f5f4f0; } .nav-item.active { background: #e8f5ee; color: #2d6a4f; font-weight: 600; }
.sidebar-badge { margin: 0 20px 16px; background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 6px; padding: 5px 10px; font-size: 0.72rem; font-weight: 700; color: #2b6cb0; text-align: center; }

.main { margin-left: 220px; flex: 1; padding: 32px 36px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; }
.page-header h2 { font-family: 'Fraunces', serif; font-size: 1.5rem; color: #1a1a1a; }
.subtitle { font-size: 0.85rem; color: #888; margin-top: 2px; }
.header-stats { display: flex; gap: 16px; }
.hstat { background: #fff; border: 1px solid #e2e0db; border-radius: 10px; padding: 12px 20px; text-align: center; }
.hstat-val { display: block; font-family: 'Fraunces', serif; font-size: 1.5rem; color: #1a1a1a; }
.hstat-lbl { font-size: 0.72rem; color: #aaa; }

.tabs { display: flex; gap: 0; background: #fff; border: 1px solid #e2e0db; border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
.tab { flex: 1; padding: 11px 10px; background: none; border: none; border-right: 1px solid #e2e0db; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500; color: #888; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.15s, color 0.15s; }
.tab:last-child { border-right: none; }
.tab.active { background: #e8f5ee; color: #2d6a4f; font-weight: 600; }
.tab-count { background: #2d6a4f; color: #fff; border-radius: 10px; padding: 1px 7px; font-size: 0.7rem; font-weight: 700; }

.toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
.search-wrap { display: flex; align-items: center; gap: 8px; background: #fff; border: 1.5px solid #ddd; border-radius: 8px; padding: 8px 14px; flex: 1; }
.search-wrap:focus-within { border-color: #2d6a4f; }
.search-wrap input { border: none; background: transparent; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; width: 100%; }
.search-wrap input:focus { outline: none; }
.toolbar select { border: 1.5px solid #ddd; border-radius: 8px; padding: 8px 12px; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; background: #fff; }

.campaign-list { display: flex; flex-direction: column; gap: 12px; }
.campaign-row { background: #fff; border: 1px solid #e2e0db; border-radius: 12px; padding: 18px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; transition: box-shadow 0.2s; }
.campaign-row:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.campaign-left { display: flex; gap: 14px; flex: 1; }
.campaign-thumb { width: 80px; height: 60px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
.campaign-title { font-weight: 700; color: #1a1a1a; font-size: 0.95rem; margin-bottom: 4px; }
.campaign-meta { font-size: 0.78rem; color: #aaa; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-bottom: 6px; }
.dot { color: #ccc; }
.campaign-desc { font-size: 0.83rem; color: #666; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.campaign-flags { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
.flag-chip { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; padding: 2px 8px; font-size: 0.72rem; color: #c53030; font-weight: 600; }

.campaign-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
.status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: capitalize; }
.status-badge.active { background: #e8f5ee; color: #2d6a4f; }
.status-badge.pending { background: #fffbeb; color: #b7791f; }
.status-badge.rejected { background: #fff5f5; color: #c53030; }
.status-badge.flagged { background: #fff5f5; color: #c53030; }
.action-buttons { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.btn-detail { border: 1.5px solid #ddd; background: #fff; border-radius: 7px; padding: 6px 12px; font-size: 0.8rem; font-family: 'DM Sans', sans-serif; cursor: pointer; }
.btn-detail:hover { border-color: #aaa; }
.btn-approve { border: none; background: #2d6a4f; color: #fff; border-radius: 7px; padding: 6px 12px; font-size: 0.8rem; font-family: 'DM Sans', sans-serif; cursor: pointer; font-weight: 600; }
.btn-approve:hover { background: #1f4d38; }
.btn-reject { border: none; background: #fff5f5; color: #c53030; border: 1px solid #fed7d7; border-radius: 7px; padding: 6px 12px; font-size: 0.8rem; font-family: 'DM Sans', sans-serif; cursor: pointer; font-weight: 600; }
.btn-reject:hover { background: #fed7d7; }
.btn-flag { border: 1px solid #f6e05e; background: #fffbeb; color: #b7791f; border-radius: 7px; padding: 6px 12px; font-size: 0.8rem; font-family: 'DM Sans', sans-serif; cursor: pointer; font-weight: 600; }

.empty-state { text-align: center; padding: 48px; color: #aaa; font-size: 1.5rem; }
.empty-state p { font-size: 0.88rem; margin-top: 8px; }

.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 100; display: flex; justify-content: flex-end; }
.drawer { width: 420px; background: #fff; height: 100vh; overflow-y: auto; box-shadow: -4px 0 32px rgba(0,0,0,0.12); display: flex; flex-direction: column; }
.drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f0ede8; }
.drawer-header h3 { font-size: 1rem; font-weight: 700; color: #1a1a1a; }
.drawer-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #aaa; }
.drawer-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.drawer-img { width: 100%; height: 160px; object-fit: cover; border-radius: 10px; }
.drawer-section { display: flex; flex-direction: column; gap: 10px; }
.dl { display: flex; gap: 12px; }
.dt { font-size: 0.78rem; color: #aaa; font-weight: 600; min-width: 80px; text-transform: uppercase; }
.dd { font-size: 0.88rem; color: #1a1a1a; }
.drawer-desc h4 { font-size: 0.88rem; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }
.drawer-desc p { font-size: 0.88rem; color: #555; line-height: 1.6; }
.drawer-actions { display: flex; gap: 10px; }
.drawer-actions .btn-approve, .drawer-actions .btn-reject { flex: 1; padding: 10px; font-size: 0.88rem; }
</style>
