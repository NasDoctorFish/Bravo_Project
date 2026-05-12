<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getViewDataByDateRange, calculateImpact } from '../controllers/StoryController'
import { supabase } from '../lib/supabaseClient'

const emit = defineEmits(['go-home', 'go-logout', 'go-search', 'go-create'])

// ── Date range ──
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const impactStatus = ref<Record<string, number>>({})

// ── Stats ──
const totalViews = ref<number>(0)
const totalRaised = ref<number>(0)
const activeCampaigns = ref<number>(0)
const goalsReached = ref<number>(0)

// ── Campaigns & Activity ──
const campaigns = ref<any[]>([])
const activity = ref<any[]>([])

async function updateDashboard() {
  const avls = await getViewDataByDateRange(startDate.value, endDate.value)
  impactStatus.value = calculateImpact(avls)
  totalViews.value = Object.values(impactStatus.value).reduce((a, b) => a + b, 0)

  const { data, error } = await supabase.from('FundRaisingActivity').select('*')
  if (data) {
    totalRaised.value = data.reduce((sum, c) => sum + c.currentAmount, 0)
    activeCampaigns.value = data.filter(c => c.status === 'active').length
    goalsReached.value = data.filter(c => c.currentAmount >= c.targetAmount).length
    campaigns.value = data.map(c => ({
      name: c.title,
      goal: c.targetAmount,
      raised: c.currentAmount,
      status: c.status
    }))
  }
}

onMounted(() => {
  updateDashboard()
})
</script>

<template>
  <div class="dashboard-page">

    <!-- Header -->
    <header class="header">
      <a href="#" class="brand" @click.prevent="emit('go-home')">
        <span class="logo">♥</span> FundRise
      </a>
      <nav class="nav">
        <a href="#" class="nav-link" @click.prevent="emit('go-search')">⌕ Donate</a>
        <a href="#" class="nav-link">Fundraising</a>
      </nav>
      <nav class="nav-actions">
        <a href="#" class="nav-link" @click.prevent="emit('go-home')">Home</a>
        <a href="#" class="nav-link logout-link" @click.prevent="emit('go-logout')">⇢ Logout</a>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="dash-main">

      <!-- Topbar -->
      <div class="dash-topbar">
        <div>
          <h2 class="dash-title">Dashboard</h2>
          <p class="dash-subtitle">Welcome back, Jane 👋</p>
        </div>
        <button class="btn-create" @click="emit('go-create')">+ New Campaign</button>
      </div>

      <!-- Date Range -->
      <div class="date-range">
        <label>
          Start Date:
          <input type="date" v-model="startDate" @change="updateDashboard" />
        </label>
        <label>
          End Date:
          <input type="date" v-model="endDate" @change="updateDashboard" />
        </label>
      </div>

      <!-- Impact per Campaign -->
      <div class="impact-cards">
        <div v-for="(count, campaignId) in impactStatus" :key="campaignId" class="impact-card">
          Campaign {{ campaignId }} — Views: {{ count }}
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👁️</div>
          <div class="stat-value">{{ totalViews }}</div>
          <div class="stat-label">Total Views</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-value">{{ totalRaised }}</div>
          <div class="stat-label">Total Raised</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-value">{{ activeCampaigns }}</div>
          <div class="stat-label">Active Campaigns</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value">{{ goalsReached }}</div>
          <div class="stat-label">Goals Reached</div>
        </div>
      </div>

      <!-- Recent Campaigns Table -->
      <section class="dashboard-section">
        <div class="section-header">
          <h3>Recent Campaigns</h3>
          <a href="#" class="view-all" @click.prevent="emit('go-search')">View all →</a>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Goal</th>
                <th>Raised</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in campaigns" :key="c.name">
                <td class="td-name">{{ c.name }}</td>
                <td>${{ c.goal.toLocaleString() }}</td>
                <td>${{ c.raised.toLocaleString() }}</td>
                <td>
                  <div class="progress-wrap">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: (c.raised / c.goal * 100) + '%' }"></div>
                    </div>
                    <span class="progress-pct">{{ Math.round(c.raised / c.goal * 100) }}%</span>
                  </div>
                </td>
                <td>
                  <span :class="['badge', 'badge-' + c.status]">{{ c.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="dashboard-section">
        <div class="section-header">
          <h3>Recent Activity</h3>
        </div>
        <div class="activity-list">
          <div class="activity-item" v-for="act in activity" :key="act.text">
            <div class="activity-icon">{{ act.icon }}</div>
            <div class="activity-body">
              <span class="activity-text">{{ act.text }}</span>
              <span class="activity-time">{{ act.time }}</span>
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>

  </div>
</template>