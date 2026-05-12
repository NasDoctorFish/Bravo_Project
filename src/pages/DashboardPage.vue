<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient.ts'
import { getStoryData } from '../controllers/StoryController.ts'

const totalRaised = ref<number>(0)
const activeCampaigns = ref<number>(0)
const totalViews = ref<number>(0)
const goalsReached = ref<number>(0)
const campaigns = ref<any[]>([])
const activity = ref<any[]>([])
const story = ref<any>(null)

// Date filter
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

function formatTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} mins ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

// Helper to get the first FundRaisingActivity ID
async function getFirstFraId(): Promise<string | null> {
  const { data, error } = await supabase
    .from('FundRaisingActivity')
    .select('id')
    .limit(1)
    .single()
  if (error || !data) return null
  return data.id
}

// Update dashboard
async function updateDashboard(): Promise<void> {
  const fraId = await getFirstFraId()
  if (!fraId) return

  // Optional: log VIEW
  const storyData = await getStoryData(fraId, "VIEW")
  story.value = storyData

  // Total views
  totalViews.value = 0 //use the version from feature/dashboard_totalviews

  // Get all campaigns
  const { data, error } = await supabase.from('FundRaisingActivity').select('*')
  if (error || !data) {
    console.error(error)
    return
  }

  // Filter campaigns by date if filter applied
  const filtered = data.filter(c =>
    new Date(c.created_at) >= new Date(startDate.value) &&
    new Date(c.created_at) <= new Date(endDate.value)
  )

  totalRaised.value = filtered.reduce((sum, fra) => sum + fra.currentAmount, 0)
  activeCampaigns.value = filtered.filter(fra => fra.status === 'active').length
  goalsReached.value = filtered.filter(fra => fra.currentAmount >= fra.targetAmount).length
  campaigns.value = filtered.map(fra => ({
    name: fra.title,
    goal: fra.targetAmount,
    raised: fra.currentAmount,
    status: fra.status
  }))
}

onMounted(() => updateDashboard())

const emit = defineEmits(['go-home', 'go-logout', 'go-search', 'go-create'])
</script>

<template>
  <div class="dashboard-page">

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

      <!-- Date Filter Section -->
      <section class="dashboard-section date-filter">
        <div class="section-header">
          <h3>Filter by Date</h3>
        </div>
        <div class="date-inputs">
          <label>
            Start Date:
            <input type="date" v-model="startDate" @change="updateDashboard" />
          </label>
          <label>
            End Date:
            <input type="date" v-model="endDate" @change="updateDashboard" />
          </label>
        </div>
      </section>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-value">${{ totalRaised.toLocaleString() }}</div>
          <div class="stat-label">Total Raised</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-value">{{ activeCampaigns }}</div>
          <div class="stat-label">Active Campaigns</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">👁️</div>
          <div class="stat-value">{{ totalViews }}</div>
          <div class="stat-label">Total Views</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value">{{ goalsReached }}</div>
          <div class="stat-label">Goals Reached</div>
        </div>
      </div>

      <!-- Recent Campaigns -->
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