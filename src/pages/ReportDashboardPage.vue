<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="logo">🤝</span>
        <span class="brand-name">FundBridge</span>
      </div>
      <nav class="nav">
        <a v-for="item in navItems" :key="item.label"
          :class="['nav-item', { active: item.label === 'Reports' }]" href="#">
          <span>{{ item.icon }}</span> {{ item.label }}
        </a>
      </nav>
    </aside>

    <main class="main">
      <div class="page-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p class="subtitle">Platform-wide fundraising insights</p>
        </div>
        <div class="header-actions">
          <select v-model="period" class="period-select">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">This year</option>
          </select>
          <button class="btn-export">↓ Export CSV</button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card" v-for="kpi in kpis" :key="kpi.label">
          <div class="kpi-icon">{{ kpi.icon }}</div>
          <div class="kpi-value">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
          <div :class="['kpi-change', kpi.positive ? 'up' : 'down']">
            {{ kpi.positive ? '▲' : '▼' }} {{ kpi.change }} vs last period
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <!-- Donations over time (bar chart simulation) -->
        <div class="chart-card wide">
          <div class="chart-header">
            <h3>Donations Over Time</h3>
            <span class="chart-note">SGD raised per week</span>
          </div>
          <div class="bar-chart">
            <div class="bar-group" v-for="(bar, i) in chartData" :key="i">
              <div class="bar-wrap">
                <div class="bar" :style="{ height: (bar.value / maxBar * 100) + '%' }">
                  <span class="bar-tip">${{ bar.value.toLocaleString() }}</span>
                </div>
              </div>
              <div class="bar-label">{{ bar.label }}</div>
            </div>
          </div>
        </div>

        <!-- Category Breakdown -->
        <div class="chart-card">
          <div class="chart-header"><h3>By Category</h3></div>
          <div class="category-list">
            <div class="cat-item" v-for="c in categoryBreakdown" :key="c.name">
              <div class="cat-top">
                <span class="cat-name">{{ c.name }}</span>
                <span class="cat-pct">{{ c.pct }}%</span>
              </div>
              <div class="cat-bar">
                <div class="cat-fill" :style="{ width: c.pct + '%', background: c.color }"></div>
              </div>
              <div class="cat-amount">${{ c.amount.toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Campaign Performance Table -->
      <div class="section">
        <div class="section-header">
          <h3>Campaign Performance</h3>
          <a href="#" class="view-all">View all →</a>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Category</th>
                <th>Raised</th>
                <th>Goal</th>
                <th>% Funded</th>
                <th>Donors</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in campaignReport" :key="c.name">
                <td class="td-name">{{ c.name }}</td>
                <td><span class="cat-tag">{{ c.category }}</span></td>
                <td class="td-green">${{ c.raised.toLocaleString() }}</td>
                <td class="td-muted">${{ c.goal.toLocaleString() }}</td>
                <td>
                  <div class="mini-progress">
                    <div class="mini-fill" :style="{ width: Math.min(c.raised/c.goal*100, 100) + '%' }"></div>
                    <span>{{ Math.round(c.raised/c.goal*100) }}%</span>
                  </div>
                </td>
                <td>{{ c.donors }}</td>
                <td :class="['trend', c.trend > 0 ? 'up' : 'down']">
                  {{ c.trend > 0 ? '▲' : '▼' }} {{ Math.abs(c.trend) }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const period = ref('30')
const navItems = [
  { icon: '🏠', label: 'Dashboard' }, { icon: '📋', label: 'Campaigns' },
  { icon: '🔍', label: 'Search' }, { icon: '📊', label: 'Reports' },
  { icon: '👥', label: 'Admin' },
]

const kpis = [
  { icon: '💰', value: '$86,400', label: 'Total Raised', change: '18%', positive: true },
  { icon: '📋', value: '24', label: 'Active Campaigns', change: '4', positive: true },
  { icon: '👥', value: '1,248', label: 'Total Donors', change: '22%', positive: true },
  { icon: '🎯', value: '68%', label: 'Avg. Completion Rate', change: '5%', positive: true },
]

const chartData = [
  { label: 'W1', value: 4200 }, { label: 'W2', value: 7800 }, { label: 'W3', value: 5400 },
  { label: 'W4', value: 9200 }, { label: 'W5', value: 6600 }, { label: 'W6', value: 11000 },
  { label: 'W7', value: 8400 }, { label: 'W8', value: 13200 },
]

const maxBar = computed(() => Math.max(...chartData.map(d => d.value)))

const categoryBreakdown = [
  { name: 'Education', pct: 34, amount: 29376, color: '#2d6a4f' },
  { name: 'Healthcare', pct: 28, amount: 24192, color: '#2b6cb0' },
  { name: 'Environment', pct: 18, amount: 15552, color: '#276749' },
  { name: 'Disaster Relief', pct: 12, amount: 10368, color: '#b7791f' },
  { name: 'Community', pct: 8, amount: 6912, color: '#6b46c1' },
]

const campaignReport = [
  { name: 'Clean Water Initiative', category: 'Education', raised: 7400, goal: 10000, donors: 88, trend: 12 },
  { name: 'Medical Aid Fund', category: 'Healthcare', raised: 9200, goal: 20000, donors: 74, trend: -3 },
  { name: 'Flood Relief Fund', category: 'Disaster Relief', raised: 22000, goal: 30000, donors: 210, trend: 28 },
  { name: 'Reforestation Project', category: 'Environment', raised: 4800, goal: 15000, donors: 43, trend: 7 },
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
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h2 { font-family: 'Fraunces', serif; font-size: 1.5rem; color: #1a1a1a; }
.subtitle { font-size: 0.85rem; color: #888; margin-top: 2px; }
.header-actions { display: flex; gap: 10px; align-items: center; }
.period-select { border: 1.5px solid #ddd; border-radius: 8px; padding: 8px 12px; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; background: #fff; }
.period-select:focus { outline: none; border-color: #2d6a4f; }
.btn-export { border: 1.5px solid #ddd; background: #fff; border-radius: 8px; padding: 8px 16px; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; cursor: pointer; font-weight: 500; }
.btn-export:hover { border-color: #aaa; }

.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.kpi-card { background: #fff; border: 1px solid #e2e0db; border-radius: 12px; padding: 20px; }
.kpi-icon { font-size: 1.4rem; margin-bottom: 8px; }
.kpi-value { font-family: 'Fraunces', serif; font-size: 1.6rem; color: #1a1a1a; margin-bottom: 2px; }
.kpi-label { font-size: 0.78rem; color: #888; margin-bottom: 8px; }
.kpi-change { font-size: 0.75rem; font-weight: 500; }
.kpi-change.up { color: #2d6a4f; } .kpi-change.down { color: #e53e3e; }

.charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
.chart-card { background: #fff; border: 1px solid #e2e0db; border-radius: 12px; padding: 22px; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.chart-header h3 { font-size: 0.95rem; font-weight: 600; color: #1a1a1a; }
.chart-note { font-size: 0.75rem; color: #aaa; }

.bar-chart { display: flex; align-items: flex-end; gap: 10px; height: 160px; }
.bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
.bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
.bar { width: 100%; background: #2d6a4f; border-radius: 4px 4px 0 0; position: relative; transition: height 0.3s; cursor: pointer; min-height: 4px; }
.bar:hover { background: #1f4d38; }
.bar-tip { display: none; position: absolute; top: -28px; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: #fff; font-size: 0.68rem; padding: 3px 6px; border-radius: 4px; white-space: nowrap; }
.bar:hover .bar-tip { display: block; }
.bar-label { font-size: 0.72rem; color: #aaa; margin-top: 6px; }

.category-list { display: flex; flex-direction: column; gap: 14px; }
.cat-item { display: flex; flex-direction: column; gap: 4px; }
.cat-top { display: flex; justify-content: space-between; }
.cat-name { font-size: 0.85rem; font-weight: 500; color: #333; }
.cat-pct { font-size: 0.82rem; font-weight: 700; color: #1a1a1a; }
.cat-bar { height: 6px; background: #eee; border-radius: 4px; overflow: hidden; }
.cat-fill { height: 100%; border-radius: 4px; }
.cat-amount { font-size: 0.75rem; color: #aaa; }

.section { margin-bottom: 24px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.section-header h3 { font-size: 1rem; font-weight: 600; color: #1a1a1a; }
.view-all { font-size: 0.82rem; color: #2d6a4f; text-decoration: none; font-weight: 500; }

.table-wrap { background: #fff; border: 1px solid #e2e0db; border-radius: 12px; overflow: hidden; }
.table { width: 100%; border-collapse: collapse; font-size: 0.87rem; }
.table th { text-align: left; padding: 12px 14px; font-size: 0.72rem; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.05em; background: #fafaf9; border-bottom: 1px solid #e2e0db; }
.table td { padding: 12px 14px; border-bottom: 1px solid #f0ede8; }
.table tr:last-child td { border-bottom: none; }
.td-name { font-weight: 600; color: #1a1a1a; }
.td-green { color: #2d6a4f; font-weight: 600; }
.td-muted { color: #aaa; }
.cat-tag { background: #f5f4f0; border: 1px solid #e2e0db; border-radius: 6px; padding: 2px 8px; font-size: 0.75rem; font-weight: 600; color: #555; }
.mini-progress { display: flex; align-items: center; gap: 8px; }
.mini-progress span { font-size: 0.78rem; color: #555; min-width: 32px; }
.mini-fill { height: 5px; background: #2d6a4f; border-radius: 4px; }
.trend { font-weight: 700; font-size: 0.82rem; }
.trend.up { color: #2d6a4f; } .trend.down { color: #e53e3e; }
</style>
