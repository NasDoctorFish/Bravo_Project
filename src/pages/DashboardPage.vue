<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="logo">🤝</span>
        <span class="brand-name">FundBridge</span>
      </div>
      <nav class="nav">
        <a v-for="item in navItems" :key="item.label"
           :class="['nav-item', { active: activeNav === item.label }]"
           @click="activeNav = item.label" href="#">
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.label }}
        </a>
      </nav>
      <div class="sidebar-user">
        <div class="avatar">JD</div>
        <div class="user-info">
          <span class="user-name">Jane Doe</span>
          <span class="user-role">Fund Raiser</span>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <main class="main">
      <header class="topbar">
        <div>
          <h2>Dashboard</h2>
          <p class="subtitle">Welcome back, Jane 👋</p>
        </div>
        <button class="btn-create">+ New Campaign</button>
      </header>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.label">
          <div class="stat-icon">{{ stat.icon }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div :class="['stat-change', stat.positive ? 'up' : 'down']">
            {{ stat.positive ? '▲' : '▼' }} {{ stat.change }}
          </div>
        </div>
      </div>

      <!-- Recent Campaigns -->
      <section class="section">
        <div class="section-header">
          <h3>Recent Campaigns</h3>
          <a href="#" class="view-all">View all →</a>
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
                      <div class="progress-fill" :style="{ width: (c.raised/c.goal*100) + '%' }"></div>
                    </div>
                    <span class="progress-pct">{{ Math.round(c.raised/c.goal*100) }}%</span>
                  </div>
                </td>
                <td><span :class="['badge', c.status]">{{ c.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="section">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeNav = ref('Dashboard')

const navItems = [
  { icon: '🏠', label: 'Dashboard' },
  { icon: '📋', label: 'Campaigns' },
  { icon: '🔍', label: 'Search' },
  { icon: '📊', label: 'Reports' },
  { icon: '⚙️', label: 'Settings' },
]

const stats = [
  { icon: '💰', value: '$48,200', label: 'Total Raised', change: '12% this month', positive: true },
  { icon: '📋', value: '7', label: 'Active Campaigns', change: '2 new', positive: true },
  { icon: '👥', value: '324', label: 'Total Donors', change: '8% this month', positive: true },
  { icon: '✅', value: '3', label: 'Goals Reached', change: '1 this week', positive: true },
]

const campaigns = [
  { name: 'Clean Water Initiative', goal: 10000, raised: 7400, status: 'active' },
  { name: 'School Supplies Drive', goal: 5000, raised: 5000, status: 'completed' },
  { name: 'Medical Aid Fund', goal: 20000, raised: 9200, status: 'active' },
  { name: 'Elderly Care Program', goal: 8000, raised: 1200, status: 'pending' },
]

const activity = [
  { icon: '💳', text: 'New donation of $250 received for Clean Water Initiative', time: '2 mins ago' },
  { icon: '✅', text: 'School Supplies Drive reached its goal!', time: '1 hour ago' },
  { icon: '👤', text: 'New donor registered: michael.t@gmail.com', time: '3 hours ago' },
  { icon: '📋', text: 'Medical Aid Fund campaign approved', time: 'Yesterday' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.layout {
  display: flex;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: #f5f4f0;
}

/* Sidebar */
.sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e2e0db;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  position: fixed;
  height: 100vh;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 24px;
  border-bottom: 1px solid #f0ede8;
}

.logo { font-size: 1.4rem; }
.brand-name { font-family: 'Fraunces', serif; font-size: 1.1rem; color: #1a1a1a; }

.nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.88rem;
  color: #555;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover { background: #f5f4f0; color: #1a1a1a; }
.nav-item.active { background: #e8f5ee; color: #2d6a4f; font-weight: 600; }
.nav-icon { font-size: 1rem; }

.sidebar-user {
  padding: 16px 20px;
  border-top: 1px solid #f0ede8;
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  background: #2d6a4f;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 0.85rem; font-weight: 600; color: #1a1a1a; }
.user-role { font-size: 0.75rem; color: #888; }

/* Main */
.main { margin-left: 220px; flex: 1; padding: 32px 36px; }

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.topbar h2 { font-family: 'Fraunces', serif; font-size: 1.6rem; color: #1a1a1a; }
.subtitle { font-size: 0.88rem; color: #888; margin-top: 2px; }

.btn-create {
  background: #2d6a4f;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-create:hover { background: #1f4d38; }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  background: #fff;
  border: 1px solid #e2e0db;
  border-radius: 12px;
  padding: 20px;
}

.stat-icon { font-size: 1.4rem; margin-bottom: 8px; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
.stat-label { font-size: 0.8rem; color: #888; margin-bottom: 8px; }
.stat-change { font-size: 0.78rem; font-weight: 500; }
.stat-change.up { color: #2d6a4f; }
.stat-change.down { color: #e53e3e; }

/* Sections */
.section { margin-bottom: 28px; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-header h3 { font-size: 1rem; font-weight: 600; color: #1a1a1a; }
.view-all { font-size: 0.82rem; color: #2d6a4f; text-decoration: none; font-weight: 500; }
.view-all:hover { text-decoration: underline; }

/* Table */
.table-wrap { background: #fff; border: 1px solid #e2e0db; border-radius: 12px; overflow: hidden; }

.table { width: 100%; border-collapse: collapse; font-size: 0.87rem; }

.table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #fafaf9;
  border-bottom: 1px solid #e2e0db;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0ede8;
  color: #333;
}

.table tr:last-child td { border-bottom: none; }
.td-name { font-weight: 500; color: #1a1a1a; }

.progress-wrap { display: flex; align-items: center; gap: 8px; }
.progress-bar { flex: 1; height: 6px; background: #eee; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: #2d6a4f; border-radius: 4px; }
.progress-pct { font-size: 0.78rem; color: #888; min-width: 36px; }

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}
.badge.active { background: #e8f5ee; color: #2d6a4f; }
.badge.completed { background: #ebf8ff; color: #2b6cb0; }
.badge.pending { background: #fffbeb; color: #b7791f; }

/* Activity */
.activity-list { background: #fff; border: 1px solid #e2e0db; border-radius: 12px; overflow: hidden; }
.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f0ede8;
}
.activity-item:last-child { border-bottom: none; }
.activity-icon { font-size: 1.1rem; margin-top: 1px; }
.activity-body { display: flex; flex-direction: column; gap: 2px; }
.activity-text { font-size: 0.87rem; color: #333; }
.activity-time { font-size: 0.75rem; color: #aaa; }
</style>
