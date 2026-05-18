<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
const { isLoggedIn, userId, userRole, sessionReady, signOut } = useAuth()
import { useRouter } from 'vue-router'
import { ref, computed, watch, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { exportReportAsDocx } from '../controllers/reportController'

import {
  Chart as ChartJS, Title, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const router = useRouter()
const emit = defineEmits(['go-home', 'go-login', 'go-signup', 'go-search', 'go-logout'])

if (isLoggedIn.value) {
  console.log('Logged in as...\n', 'userid: ', userId.value, '\nRole: ', userRole.value)
} else {
  console.log('Logged Out')
}

watch(sessionReady, (ready) => {
  if (!ready) return
  if (!isLoggedIn.value) router.push('/login')
  else if (userRole.value !== 'PM') router.push('/')
}, { immediate: true })

// ── Types ──────────────────────────────────────────────────────────────────
type PeriodType = 'DAILY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'

type Report = {
  reportid?:     number
  targetid:      string
  targettype:    string
  periodtype:    PeriodType
  startdate:     string
  enddate:       string
  reportsummary: string
  reportcontent: string
  created_at?:   string
  chartdata?:    any
}

type ReportChartPoint = {
  period:      string
  totalLogs:   number
  totalViews:  number
  totalClicks: number
  uniqueUsers: number
}

type KpiItem = { icon: string; value: string; label: string }

// ── Live KPI State ─────────────────────────────────────────────────────────
const period           = ref('30')
const liveKpis         = ref({ raised: 0, active: 0, donors: 0, completion: 0 })
const weeklyChartData  = ref<{ label: string; value: number }[]>([])
const categoryBreakdown = ref<{ name: string; pct: number; amount: number; color: string }[]>([])
const campaignReport   = ref<any[]>([])
const isLoadingLive    = ref(false)

const CATEGORY_COLORS = ['#2d6a4f','#2b6cb0','#276749','#b7791f','#6b46c1','#c53030','#2c7a7b']

async function loadLiveDashboard() {
  isLoadingLive.value = true
  const days = Number(period.value)
  const since = new Date(Date.now() - days * 86400000).toISOString()

  // Campaigns
  const { data: fraData } = await supabase
    .from('fundraisingactivity')
    .select('fraid, title, targetamount, currentamount, status, createdat, categoryid, category(categoryname)')
    .gte('createdat', since)

  const fra = fraData ?? []

  liveKpis.value.raised     = fra.reduce((s, c) => s + Number(c.currentamount ?? 0), 0)
  liveKpis.value.active     = fra.filter(c => c.status?.toUpperCase() === 'ACTIVE').length
  liveKpis.value.completion = fra.length
    ? Math.round(fra.filter(c => Number(c.currentamount) >= Number(c.targetamount)).length / fra.length * 100)
    : 0

  // Donors (unique)
  const { data: donorData } = await supabase
    .from('donation')
    .select('userid')
    .gte('donatedat', since)
  liveKpis.value.donors = new Set((donorData ?? []).map(d => d.userid)).size

  // Weekly chart — group donations by week
  const { data: weekData } = await supabase
    .from('donation')
    .select('amount, donatedat')
    .gte('donatedat', since)
    .order('donatedat')

  const weekMap: Record<string, number> = {}
  ;(weekData ?? []).forEach(d => {
    const date  = new Date(d.donatedat)
    const wk    = `W${Math.ceil(date.getDate() / 7)}-${date.getMonth() + 1}`
    weekMap[wk] = (weekMap[wk] ?? 0) + Number(d.amount ?? 0)
  })
  weeklyChartData.value = Object.entries(weekMap).map(([label, value]) => ({ label, value }))

  // Category breakdown
  const catMap: Record<string, number> = {}
  fra.forEach(c => {
    const name = (c.category as any)?.categoryname ?? 'Other'
    catMap[name] = (catMap[name] ?? 0) + Number(c.currentamount ?? 0)
  })
  const total = Object.values(catMap).reduce((s, v) => s + v, 0) || 1
  categoryBreakdown.value = Object.entries(catMap).map(([name, amount], i) => ({
    name, amount,
    pct:   Math.round(amount / total * 100),
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }))

  // Campaign performance table
  campaignReport.value = fra.slice(0, 10).map(c => ({
    name:     c.title,
    category: (c.category as any)?.categoryname ?? '—',
    raised:   Number(c.currentamount ?? 0),
    goal:     Number(c.targetamount  ?? 0),
    donors:   0,
    trend:    0,
  }))

  isLoadingLive.value = false
}

const maxBar = computed(() => Math.max(...weeklyChartData.value.map(d => d.value), 1))

const staticKpis = computed(() => [
  { icon: '💰', value: `$${liveKpis.value.raised.toLocaleString()}`,  label: 'Total Raised',         change: '', positive: true },
  { icon: '📋', value: String(liveKpis.value.active),                  label: 'Active Campaigns',      change: '', positive: true },
  { icon: '👥', value: String(liveKpis.value.donors),                  label: 'Total Donors',          change: '', positive: true },
  { icon: '🎯', value: `${liveKpis.value.completion}%`,                label: 'Avg. Completion Rate',  change: '', positive: true },
])

// ── Report Generation ──────────────────────────────────────────────────────
const periodType  = ref<PeriodType>('MONTHLY')
const startDate   = ref('')
const endDate     = ref('')
const targetId    = ref('PLATFORM')
const targetType  = ref('platform')

const isLoading           = ref(false)
const errorMessage        = ref('')
const selectedReport      = ref<Report | null>(null)
const reportSummaryText   = ref('')
const reportDetailsVisible = ref(false)
const reports             = ref<Report[]>([])

const periodOptions = [
  { value: 'DAILY',   label: 'Daily'   },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY',  label: 'Yearly'  },
  { value: 'CUSTOM',  label: 'Custom'  },
]

// Load existing reports from Supabase
async function loadReports() {
  const { data, error } = await supabase
    .from('report')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) { console.error(error); return }
  reports.value = data ?? []
}

// Generate report from activityviewlog
async function handleGenerateReport() {
  if (!startDate.value || !endDate.value) {
    errorMessage.value = 'Please select a start and end date.'
    return
  }
  errorMessage.value        = ''
  reportDetailsVisible.value = false
  isLoading.value           = true

  try {
    // Fetch activity logs for the period
    let query = supabase
      .from('activityviewlog')
      .select('*')
      .gte('timestamp', startDate.value)
      .lte('timestamp', endDate.value + 'T23:59:59')

    if (targetType.value !== 'platform') {
      query = query.eq('targetid', Number(targetId.value))
    }

    const { data: logs, error: logsError } = await query
    if (logsError) throw logsError

    const logList = logs ?? []

    // Build summary
    const totalLogs   = logList.length
    const totalViews  = logList.filter(l => l.eventtype === 'VIEW').length
    const totalClicks = logList.filter(l => l.eventtype === 'CLICK').length
    const uniqueUsers = new Set(logList.map(l => l.userid)).size

    const summary = [
      `Total Activity Logs: ${totalLogs}`,
      `Total Views: ${totalViews}`,
      `Total Clicks: ${totalClicks}`,
      `Unique Users: ${uniqueUsers}`,
    ].join('\n')

    const content = `Report generated for ${targetType.value} (${targetId.value})\nPeriod: ${startDate.value} to ${endDate.value}\n\n${summary}`

    // Build chart data grouped by period
    const periodMap: Record<string, ReportChartPoint> = {}
    logList.forEach(l => {
      const key = periodType.value === 'DAILY'
        ? l.timestamp?.split('T')[0]
        : periodType.value === 'MONTHLY'
          ? l.timestamp?.substring(0, 7)
          : l.timestamp?.substring(0, 4)

      if (!key) return
      if (!periodMap[key]) periodMap[key] = { period: key, totalLogs: 0, totalViews: 0, totalClicks: 0, uniqueUsers: 0 }
      periodMap[key].totalLogs++
      if (l.eventtype === 'VIEW')  periodMap[key].totalViews++
      if (l.eventtype === 'CLICK') periodMap[key].totalClicks++
    })
    const chartPoints = Object.values(periodMap).sort((a, b) => a.period.localeCompare(b.period))

    // Save to Supabase
    const { data: saved, error: saveError } = await supabase
      .from('report')
      .insert({
        targetid:      targetId.value,
        targettype:    targetType.value,
        periodtype:    periodType.value,
        startdate:     startDate.value,
        enddate:       endDate.value,
        reportsummary: summary,
        reportcontent: content,
        chartdata:     chartPoints,
      })
      .select()
      .single()

    if (saveError) throw saveError

    chartData.value       = chartPoints
    selectedReport.value  = saved
    reportSummaryText.value = summary
    reports.value.unshift(saved)

  } catch (e: any) {
    errorMessage.value = e.message || 'Failed to generate report.'
  } finally {
    isLoading.value = false
  }
}

// Chart data for report section
const chartData = ref<ReportChartPoint[]>([])

const chartDisplayData = computed(() => ({
  labels: chartData.value.map(d => d.period),
  datasets: [
    { label: 'Total Views',  data: chartData.value.map(d => d.totalViews)  },
    { label: 'Total Clicks', data: chartData.value.map(d => d.totalClicks) },
    { label: 'Unique Users', data: chartData.value.map(d => d.uniqueUsers) },
  ]
}))

const chartOptions = { responsive: true, maintainAspectRatio: false }

const kpis = computed<KpiItem[]>(() => {
  if (!selectedReport.value) return [
    { icon: '📊', value: '-', label: 'Total Activity Logs' },
    { icon: '👁️', value: '-', label: 'Total Views'         },
    { icon: '🖱️', value: '-', label: 'Total Clicks'        },
    { icon: '👥', value: '-', label: 'Unique Users'         },
  ]
  const s = selectedReport.value.reportsummary ?? ''
  const extract = (label: string) => {
    const line = s.split('\n').find(l => l.toLowerCase().includes(label.toLowerCase()))
    return line?.split(':')[1]?.trim() ?? '-'
  }
  return [
    { icon: '📊', value: extract('Total Activity Logs'), label: 'Total Activity Logs' },
    { icon: '👁️', value: extract('Total Views'),         label: 'Total Views'         },
    { icon: '🖱️', value: extract('Total Clicks'),        label: 'Total Clicks'        },
    { icon: '👥', value: extract('Unique Users'),         label: 'Unique Users'        },
  ]
})

function viewReportDetails(report: Report) {
  selectedReport.value      = report
  reportSummaryText.value   = report.reportsummary
  chartData.value           = report.chartdata ?? []
  reportDetailsVisible.value = true
}

async function exportReport() {
  if (!selectedReport.value) { errorMessage.value = 'No report selected.'; return }
  await exportReportAsDocx(selectedReport.value)
}

async function downloadReport(report: Report) {
  selectedReport.value = report
  await exportReport()
}

function exportCSV() {
  const rows = [
    ['Campaign', 'Category', 'Raised', 'Goal', '% Funded'],
    ...campaignReport.value.map(c => [
      c.name, c.category, c.raised, c.goal,
      Math.round(c.raised / (c.goal || 1) * 100) + '%',
    ])
  ]
  const csv  = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'report.csv'; a.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  await Promise.all([loadLiveDashboard(), loadReports()])
})

watch(period, loadLiveDashboard)
</script>

<template>
  <div class="report-page">


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
        <div class="kpi-card" v-for="kpi in staticKpis" :key="kpi.label">
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
            <div class="bar-group" v-for="(bar, i) in weeklyChartData" :key="i">
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
          <RouterLink to="/fra/search" class="view-all-link" @click="emit('go-search')">View all →</RouterLink>
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

      <!-- ── Activity Report Generation (from ReportMgntDEV) ── -->

      <!-- Page Sub-Title -->
      <div class="dashboard-header" style="margin-top: 40px;">
        <div>
          <h1>Overall Platform Performance Report</h1>
          <p>Generate and review platform-wide performance reports.</p>
        </div>

        <button class="btn btn-cancel export-btn" :disabled="!selectedReport" @click="exportReport">
          ↓ Export Report
        </button>
      </div>

      <!-- Generate Report Form -->
      <section class="dashboard-section report-form-section">
        <h2>Generate Report</h2>

        <div class="form-grid">
          <div class="form-group">
            <label>Period Type</label>
            <select v-model="periodType" class="form-select">
              <option v-for="option in periodOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Start Date</label>
            <input v-model="startDate" type="date" class="form-input" />
          </div>

          <div class="form-group">
            <label>End Date</label>
            <input v-model="endDate" type="date" class="form-input" />
          </div>

          <div class="form-group">
            <label>Target ID</label>
            <input v-model="targetId" type="text" class="form-input" placeholder="PLATFORM"
              title="Enter 'PLATFORM' or blank for platform-wise report, else leave it as blank or input specific Id for specific reports." />
          </div>

          <div class="form-group">
            <label>Target Type</label>
            <select v-model="targetType" class="form-select" title="e.g. 'fra', 'platform', 'story', donation'">
              <option value="platform">Platform</option>
              <option value="fra">Fund Raising Activity</option>
              <option value="story">Story</option>
              <option value="donation">Donation</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn generate-btn" :disabled="isLoading" @click="handleGenerateReport">
            {{ isLoading ? 'Generating...' : 'Generate Report' }}
          </button>
        </div>

        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>
      </section>

      <!-- Charts -->
      <section class="dashboard-section">
        <h2>Report Chart</h2>

        <div v-if="chartDisplayData.labels.length > 0" style="height: 360px;">
          <Bar :data="chartDisplayData" :options="chartOptions" />
        </div>

        <div v-else class="empty-state">
          No chart data available.
        </div>
      </section>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card" v-for="kpi in kpis" :key="kpi.label">
          <div class="kpi-icon">{{ kpi.icon }}</div>
          <div class="kpi-value">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
        </div>
      </div>

      <!-- Report Summary -->
      <section class="dashboard-section">
        <div class="section-title-row">
          <h2>Report Summary</h2>
        </div>

        <div v-if="reportSummaryText" class="summary-box">
          <pre>{{ reportSummaryText }}</pre>
        </div>

        <div v-else class="empty-state">
          No report generated yet.
        </div>
      </section>

      <!-- Generated Report List -->
      <section class="dashboard-section">
        <div class="section-title-row">
          <h2>Generated Reports</h2>
        </div>

        <div v-if="reports.length === 0" class="empty-state">
          No generated reports available.
        </div>

        <div v-else class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Target ID</th>
                <th>Target Type</th>
                <th>Period Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="report in reports" :key="report.reportid">
                <td>{{ report.reportid || '-' }}</td>
                <td>{{ report.targetid }}</td>
                <td>
                  <span class="cat-tag">{{ report.targettype }}</span>
                </td>
                <td>{{ report.periodtype }}</td>
                <td>{{ report.startdate }}</td>
                <td>{{ report.enddate }}</td>
                <td>{{ report.created_at || '-' }}</td>
                <td>
                  <div class="action-btns">
                    <button class="detail-btn" @click="viewReportDetails(report)">
                      View Details
                    </button>
                    <button class="detail-btn download-btn" @click="downloadReport(report)">
                      Download
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Report Details -->
      <section v-if="reportDetailsVisible && selectedReport" class="dashboard-section">
        <div class="section-title-row">
          <h2>Report Details</h2>
        </div>

        <div class="details-box">
          <pre>{{ selectedReport.reportcontent }}</pre>
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

.logo {
  color: #ef4444;
  font-size: 1.2rem;
}

.nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.nav-link {
  font-size: 0.88rem;
  color: #555;
  text-decoration: none;
  font-weight: 500;
}

.nav-link:hover {
  color: #111;
}

.user-info {
  font-size: 0.82rem;
  color: #6b7280;
}

.logout-link {
  color: #ef4444;
}

.logout-icon {
  margin-right: 4px;
}

.footer {
  text-align: center;
  padding: 24px;
  font-size: 0.8rem;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

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

.period-select {
  width: auto;
  padding: 8px 12px;
}

.export-btn {
  white-space: nowrap;
}

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
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-icon {
  font-size: 1.6rem;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #111;
}

.kpi-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.kpi-change {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 4px;
}

.kpi-up {
  color: #16a34a;
}

.kpi-down {
  color: #dc2626;
}

/* ── Charts Grid ── */
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 750px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
  }

  .form-actions {
    justify-content: stretch;
  }

  .generate-btn {
    width: 100%;
  }
}

/* ── Section Card ── */
.dashboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.dashboard-section h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 18px;
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

/* ── Bar Chart (static) ── */
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

.cat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cat-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.cat-pct {
  font-size: 0.82rem;
  font-weight: 700;
  color: #111;
}

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

.view-all-link:hover {
  text-decoration: underline;
}

/* ── Table ── */
.table-wrapper {
  overflow-x: auto;
}

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

.data-table tbody tr:hover {
  background: #f9fafb;
}

.data-table td {
  padding: 12px 16px;
  font-size: 0.88rem;
  color: #555;
  text-align: center;
}

.td-name {
  font-weight: 600;
  color: #111;
}

.td-green {
  color: #16a34a;
  font-weight: 600;
}

.td-muted {
  color: #9ca3af;
}

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
.trend-cell {
  font-weight: 700;
  font-size: 0.82rem;
}

.trend-up {
  color: #16a34a;
}

.trend-down {
  color: #dc2626;
}

/* ── Generate Report Form ── */
.report-form-section {
  margin-bottom: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #374151;
}

.form-input,
.form-select {
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #fff;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 9px 16px;
  font-weight: 700;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.generate-btn {
  background: #2563eb;
  color: #fff;
}

.error-message {
  margin-top: 12px;
  color: #dc2626;
  font-size: 0.88rem;
  font-weight: 600;
}

/* ── Summary / Details Box ── */
.summary-box,
.details-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  overflow-x: auto;
}

.summary-box pre,
.details-box pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.6;
}

/* ── Empty State ── */
.empty-state {
  padding: 20px;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 10px;
  text-align: center;
  font-size: 0.9rem;
}

/* ── Detail Button ── */
.detail-btn {
  border: none;
  background: #eef2ff;
  color: #2563eb;
  padding: 6px 10px;
  border-radius: 7px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.detail-btn:hover {
  background: #dbeafe;
}

/* Download button — same shape as detail-btn, green tint */
.download-btn {
  background: #f0fdf4;
  color: #16a34a;
}

.download-btn:hover {
  background: #dcfce7;
}

/* Wrapper for action buttons in a table cell */
.action-btns {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
