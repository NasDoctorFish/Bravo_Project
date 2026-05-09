<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['go-home', 'go-logout', 'go-search'])

const period = ref('30')

const kpis = [
  { icon: '💰', value: '$86,400', label: 'Total Raised',          change: '18%', positive: true },
  { icon: '📋', value: '24',      label: 'Active Campaigns',      change: '4',   positive: true },
  { icon: '👥', value: '1,248',   label: 'Total Donors',          change: '22%', positive: true },
  { icon: '🎯', value: '68%',     label: 'Avg. Completion Rate',  change: '5%',  positive: true },
]

const chartData = [
  { label: 'W1', value: 4200  }, { label: 'W2', value: 7800  },
  { label: 'W3', value: 5400  }, { label: 'W4', value: 9200  },
  { label: 'W5', value: 6600  }, { label: 'W6', value: 11000 },
  { label: 'W7', value: 8400  }, { label: 'W8', value: 13200 },
]

const maxBar = computed(() => Math.max(...chartData.map(d => d.value)))

const categoryBreakdown = [
  { name: 'Education',      pct: 34, amount: 29376, color: '#2d6a4f' },
  { name: 'Healthcare',     pct: 28, amount: 24192, color: '#2b6cb0' },
  { name: 'Environment',    pct: 18, amount: 15552, color: '#276749' },
  { name: 'Disaster Relief',pct: 12, amount: 10368, color: '#b7791f' },
  { name: 'Community',      pct: 8,  amount: 6912,  color: '#6b46c1' },
]

const campaignReport = [
  { name: 'Clean Water Initiative', category: 'Education',      raised: 7400,  goal: 10000, donors: 88,  trend: 12  },
  { name: 'Medical Aid Fund',       category: 'Healthcare',     raised: 9200,  goal: 20000, donors: 74,  trend: -3  },
  { name: 'Flood Relief Fund',      category: 'Disaster Relief',raised: 22000, goal: 30000, donors: 210, trend: 28  },
  { name: 'Reforestation Project',  category: 'Environment',    raised: 4800,  goal: 15000, donors: 43,  trend: 7   },
]

function exportCSV() {
  const rows = [
    ['Campaign', 'Category', 'Raised', 'Goal', '% Funded', 'Donors', 'Trend'],
    ...campaignReport.map(c => [
      c.name, c.category, c.raised, c.goal,
      Math.round(c.raised / c.goal * 100) + '%',
      c.donors, (c.trend > 0 ? '+' : '') + c.trend + '%'
    ])
  ]
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'report.csv'; a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="report-page">

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
        <span class="user-info">Platform Admin</span>
        <a href="#" class="nav-link logout-link" @click.prevent="emit('go-logout')">
          <span class="logout-icon">⇢</span> Logout
        </a>
      </nav>
    </header>

    <div class="report-container">

      <!-- Page Title -->
      <div class="dashboard-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Platform-wide fundraising insights</p>
        </div>
        <div class="header-actions">
          <select v-model="period" class="form-select period-select">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">This year</option>
          </select>
          <button class="btn btn-cancel export-btn" @click="exportCSV">↓ Export CSV</button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card" v-for="kpi in kpis" :key="kpi.label">
          <div class="kpi-icon">{{ kpi.icon }}</div>
          <div class="kpi-value">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
          <div :class="['kpi-change', kpi.positive ? 'kpi-up' : 'kpi-down']">
            {{ kpi.positive ? '▲' : '▼' }} {{ kpi.change }} vs last period
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-grid">

        <!-- Bar Chart -->
        <section class="dashboard-section chart-wide">
          <div class="chart-header">
            <h2>Donations Over Time</h2>
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
        </section>

        <!-- Category Breakdown -->
        <section class="dashboard-section">
          <div class="chart-header">
            <h2>By Category</h2>
          </div>
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
        </section>

      </div>

      <!-- Campaign Performance Table -->
      <section class="dashboard-section">
        <div class="section-title-row">
          <h2>Campaign Performance</h2>
          <a href="#" class="view-all-link">View all →</a>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
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
                  <div class="mini-progress-wrap">
                    <div class="mini-progress">
                      <div class="mini-fill" :style="{ width: Math.min(c.raised / c.goal * 100, 100) + '%' }"></div>
                    </div>
                    <span class="mini-pct">{{ Math.round(c.raised / c.goal * 100) }}%</span>
                  </div>
                </td>
                <td>{{ c.donors }}</td>
                <td :class="['trend-cell', c.trend > 0 ? 'trend-up' : 'trend-down']">
                  {{ c.trend > 0 ? '▲' : '▼' }} {{ Math.abs(c.trend) }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>

  </div>
</template>

<style scoped>
/* ── Layout ── */
.report-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.report-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 60px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

/* ── Page Title ── */
.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 28px;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 10px;
  color: #111;
  text-align: left;
}

.dashboard-header p {
  color: #666;
  margin: 0;
  text-align: left;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.period-select { width: auto; padding: 8px 12px; }

.export-btn { white-space: nowrap; }

/* ── KPI Cards ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-icon  { font-size: 1.6rem; margin-bottom: 4px; }
.kpi-value { font-size: 1.8rem; font-weight: 700; color: #111; }
.kpi-label { font-size: 0.8rem; color: #6b7280; font-weight: 500; }

.kpi-change {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 4px;
}

.kpi-up   { color: #16a34a; }
.kpi-down { color: #dc2626; }

/* ── Charts Grid ── */
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 750px) {
  .charts-grid { grid-template-columns: 1fr; }
}

/* ── Section Card ── */
.dashboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.dashboard-section + .dashboard-section {
  margin-top: 0;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.chart-header h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111;
  margin: 0;
}

.chart-note {
  font-size: 0.78rem;
  color: #9ca3af;
}

/* ── Bar Chart ── */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 350px;
  padding-top: 30px;
  width: 100%;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  position: relative;
  background-bottom: 0;
}

.bar {
  width: 100%;
  background: linear-gradient(to top, #2563eb, #3b82f6);
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: height 0.3s;
  min-height: 4px;
}

.bar-tip {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.bar-label {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 6px;
  font-weight: 500;
}

/* ── Category Breakdown ── */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cat-item { display: flex; flex-direction: column; gap: 4px; }

.cat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cat-name { font-size: 0.85rem; font-weight: 600; color: #374151; }
.cat-pct  { font-size: 0.82rem; font-weight: 700; color: #111; }

.cat-bar {
  background: #e5e7eb;
  border-radius: 99px;
  height: 7px;
  overflow: hidden;
}

.cat-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s;
}

.cat-amount {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* ── Section Title Row ── */
.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title-row h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111;
  margin: 0;
}

.view-all-link {
  font-size: 0.85rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.view-all-link:hover { text-decoration: underline; }

/* ── Table ── */
.table-wrapper { overflow-x: auto; }

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead tr {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  text-align: center;
  padding: 8px 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9ca3af;
  white-space: nowrap;
}

.data-table tbody tr {
  border-top: 1px solid #f0f0f0;
  transition: background 0.15s;
}

.data-table tbody tr:hover { background: #f9fafb; }

.data-table td { padding: 12px 16px; font-size: 0.88rem; color: #555; }

.td-name  { font-weight: 600; color: #111; }
.td-green { color: #16a34a; font-weight: 600; }
.td-muted { color: #9ca3af; }

/* ── Category Tag ── */
.cat-tag {
  background: #f3f4f6;
  color: #374151;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  white-space: nowrap;
}

/* ── Mini Progress ── */
.mini-progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-progress {
  flex: 1;
  background: #e5e7eb;
  border-radius: 99px;
  height: 6px;
  overflow: hidden;
  min-width: 60px;
}

.mini-fill {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  height: 100%;
  border-radius: 99px;
}

.mini-pct {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

/* ── Trend ── */
.trend-cell { font-weight: 700; font-size: 0.82rem; }
.trend-up   { color: #16a34a; }
.trend-down { color: #dc2626; }
</style>