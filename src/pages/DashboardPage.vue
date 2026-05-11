<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTotalViews, getFirstFraId } from '../controllers/StoryController'
import { supabase } from '../lib/supabaseClient'

function formatTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime()

  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} mins ago`

  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hours ago`

  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

async function loadDashboard(): Promise<void> {
  const fraId = await getFirstFraId()
  if (!fraId) return
  totalViews.value = await getTotalViews(fraId)


  const { data, error } = await supabase
    .from('FundRaisingActivity')
    .select('*')

  if (error || !data) {
    console.error(error)
    return
  }
  
  totalRaised.value = data.reduce(
    (sum, fra) => sum + fra.currentAmount,
    0
  )
 
  activeCampaigns.value = data.filter(
    fra => fra.status === 'active'
  ).length

  goalsReached.value = data.filter(
    fra => fra.currentAmount >= fra.targetAmount
  ).length

  campaigns.value = data.map(fra => ({
  name: fra.title,
  goal: fra.targetAmount,
  raised: fra.currentAmount,
  status: fra.status
}))
}

onMounted(() => {
  loadDashboard()
})


const emit = defineEmits(['go-home', 'go-logout', 'go-search', 'go-create'])


const totalRaised = ref<number>(0)
const activeCampaigns = ref<number>(0)
const totalViews = ref<number>(0)
const goalsReached = ref<number>(0)


const campaigns = ref<any[]>([])


const activity = ref<any[]>([])

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
        <a href="#" class="nav-link logout-link" @click.prevent="emit('go-logout')">
          <span class="logout-icon">⇢</span> Logout
        </a>
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


      <!-- Stats Grid -->
      <div class="stats-grid">


  <div class="stat-card">
    <div class="stat-icon">💰</div>
    <div class="stat-value">
      ${{ totalRaised.toLocaleString() }}
    </div>
    <div class="stat-label">Total Raised</div>
  </div>


  <div class="stat-card">
    <div class="stat-icon">📋</div>
    <div class="stat-value">
      {{ activeCampaigns }}
    </div>
    <div class="stat-label">Active Campaigns</div>
  </div>


  <div class="stat-card">
    <div class="stat-icon">👁️</div>
    <div class="stat-value">
      {{ totalViews }}
    </div>
    <div class="stat-label">Total Views</div>
  </div>


  <div class="stat-card">
    <div class="stat-icon">✅</div>
    <div class="stat-value">
      {{ goalsReached }}
    </div>
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
                      <div class="progress-fill"
                        :style="{ width: (c.raised / c.goal * 100) + '%' }">
                      </div>
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


<style scoped>
/* ── Page Layout ── */
.dashboard-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}


/* ── Main Content ── */
.dash-main {
  flex: 1;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 32px 24px 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}


/* ── Topbar ── */
.dash-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}


.dash-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: #111;
  text-align: left;
}


.dash-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}


.btn-create {
  padding: 8px 20px;
  max-width: 200px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
  white-space: normal;   /* allow text to wrap inside the box */
  text-align: center;
}
.btn-create:hover {
  background: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}


/* ── Stats Grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}


.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 4px;
}


.stat-icon  { font-size: 1.4rem; margin-bottom: 6px; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: #111; }
.stat-label { font-size: 0.8rem; color: #6b7280; font-weight: 500; }


.stat-change { font-size: 0.75rem; font-weight: 600; margin-top: 4px; }
.stat-change.up   { color: #16a34a; }
.stat-change.down { color: #dc2626; }


/* ── Section Card ── */
.dashboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}


.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}


.section-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin: 0;
}


.view-all {
  font-size: 0.82rem;
  font-weight: 600;
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.15s;
}
.view-all:hover { color: #1d4ed8; text-decoration: underline; }


/* ── Table ── */
.table-wrap { overflow-x: auto; }


.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}


.table thead tr { border-bottom: 1px solid #e5e7eb; }


.table th {
  text-align: center;
  padding: 8px 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9ca3af;
  white-space: nowrap;
}


.table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.12s;
}
.table tbody tr:last-child { border-bottom: none; }
.table tbody tr:hover { background: #f9fafb; }


.table td {
  padding: 12px;
  color: #374151;
  vertical-align: middle;
}


.td-name {
  font-weight: 600;
  color: #111;
  white-space: nowrap;
  text-align: left;
}


/* ── Progress ── */
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}


.progress-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}


.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  border-radius: 99px;
  transition: width 0.4s;
}


.progress-pct {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
}


/* ── Badges ── */
.badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 99px;
  letter-spacing: 0.04em;
}


.badge-active    { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.badge-completed { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.badge-pending   { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }


/* ── Activity ── */
.activity-list { display: flex; flex-direction: column; }


.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
}
.activity-item:last-child { border-bottom: none; }


.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}


.activity-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}


.activity-text {
  font-size: 0.88rem;
  color: #374151;
  font-weight: 500;
  line-height: 1.4;
}


.activity-time { font-size: 0.75rem; color: #9ca3af; }


/* ── Responsive ── */
@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}


@media (max-width: 600px) {
  .dash-main { padding: 20px 16px 40px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .dash-topbar { flex-wrap: wrap; }
}
</style>