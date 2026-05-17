<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
const { isLoggedIn, userId, userRole, sessionReady, signOut } = useAuth()
import { readCategory } from '../controllers/categoryController'

import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['go-home', 'go-login', 'go-signup', 'go-search'])

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

import { ref, computed, watch, onMounted } from 'vue'
import { fraHistoryController } from '../controllers/fraController'
import { supabase } from '../lib/supabaseClient'

// Redirect unauthenticated users to login
watch(sessionReady, (ready) => {
  if (ready && !isLoggedIn.value) router.push('/login')
}, { immediate: true })

const selectedFra = ref<any>(null)
const isLoading = ref(false)
const fetchError = ref<string | null>(null)

const fraList = ref<any[]>([])

const selectedCategory = ref('')
// all categories for data search and mapping
const allCategories = ref<{ categoryname: string }[]>([])
onMounted(async () => {
  allCategories.value = await readCategory()
})
const startDate = ref('')
const endDate = ref('')

// FR-5-01 + FR-5-02 + FR-5-05: Fetch completed FRAs from Supabase
async function loadFraList(): Promise<void> {
  isLoading.value = true
  fetchError.value = null
  try {
    const { data, error } = await supabase
      .from('fundraisingactivity')
      .select('*')
      .ilike('status', 'completed')
      .order('enddate', { ascending: false })

    if (error) throw error

    // Load Category Data for fetching name
    const categoryData = await readCategory()

    // Make categoryId -> categoryName map
    const categoryMap = new Map(
      (categoryData ?? []).map((category: any) => [
        category.categoryid,
        category.categoryname
      ])
    )

    fraList.value = (data ?? []).map((row: any) => ({
      fraId: row.fraid,
      title: row.title ?? '',
      category:   categoryMap.get(row.categoryid) ?? 'Other',   // shown in template
      categoryId: categoryMap.get(row.categoryid) ?? 'Other',  // used by fraService filter
      description: row.description ?? '',
      targetAmount: row.targetamount ?? 0,
      raisedAmount: row.currentamount ?? 0,
      completedAt: row.enddate ?? row.createdat ?? '',
      organiser: row.createdby ?? 'Unknown',
      startdate: row.startdate ?? row.createdat,
      enddate: row.enddate
    }))
  } catch (e: any) {
    fetchError.value = e.message
  } finally {
    isLoading.value = false
  }
}

onMounted(loadFraList)




//only category existing in filtered data
const categories = computed(() => [...new Set(fraList.value.map(f => f.category))])
const totalRaised = computed(() => fraList.value.reduce((sum, f) => sum + f.raisedAmount, 0))

// FR-5-01 + FR-5-02: Filter via fraHistoryController -> fraService
const filteredFra = computed(() => {
  return fraHistoryController.searchFraByAllFilters(
    selectedCategory.value,
    startDate.value,
    endDate.value,
    fraList.value
  )
})

function resetFilters() {
  selectedCategory.value = ''
  startDate.value = ''
  endDate.value = ''
}

// FR-5-05: View detail via fraHistoryController -> fraService
function selectFra(f: any) {
  selectedFra.value = fraHistoryController.getFraById(f.fraId, fraList.value)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="history-page">

    <!-- Header -->
    <header class="header">
      <RouterLink to="/" class="brand">
        <span class="logo">♥</span>
        <span>FundRise</span>
      </RouterLink>
      <nav class="nav">
        <RouterLink to="/fra/search" class="nav-link">⌕ Donate</RouterLink>
        <RouterLink to="/fra/create" class="nav-link">Fundraising</RouterLink>
      </nav>
      <nav class="nav-actions">
        <RouterLink to="/" class="nav-link">Home</RouterLink>
        <button class="nav-link logout-link" @click="async () => { await signOut(); router.push('/') }">
          <span class="logout-icon">⇢</span> Logout
        </button>
      </nav>
    </header>

    <div class="history-container">

      <!-- Page Title -->
      <div class="dashboard-header">
        <h1>FRA History</h1>
        <p>View all completed fundraising activities for selected period</p>
      </div>

      <!-- Summary Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-green">✅</div>
          <div class="stat-info">
            <p class="stat-value">{{ fraList.length }}</p>
            <p class="stat-label">Total Completed FRAs</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-blue">💰</div>
          <div class="stat-info">
            <p class="stat-value">${{ totalRaised.toLocaleString() }}</p>
            <p class="stat-label">Total Raised</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-purple">🏆</div>
          <div class="stat-info">
            <p class="stat-value">{{ categories.length }}</p>
            <p class="stat-label">Categories</p>
          </div>
        </div>
      </div>

      <!-- FR-5-01: Filter by Category & FR-5-02: Filter by Date -->
      <section class="dashboard-section filters-section">
        <div class="filters-row">
          <!-- FR-5-01: Filter by Category -->
          <select v-model="selectedCategory" class="form-select filter-select">
            <option value="">All Categories</option>
            <option v-for="category in allCategories" :key="category.categoryname" :value="category.categoryname">
              {{ category.categoryname }}
            </option>
          </select>

          <!-- FR-5-02: Filter by Date Range -->
          <input v-model="startDate" type="date" class="form-input date-input" />
          <span class="date-sep">to</span>
          <input v-model="endDate" type="date" class="form-input date-input" />

          <button class="btn btn-cancel" @click="resetFilters">Reset</button>
        </div>
      </section>

      <!-- FRA Table -->
      <section class="dashboard-section">
        <div class="section-title-row">
          <h2>Completed FRAs ({{ filteredFra.length }})</h2>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>FRA Name</th>
                <th>Category</th>
                <th>Target</th>
                <th>Raised</th>
                <th>Progress</th>
                <th>Completed Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="7" class="empty-row">Loading…</td>
              </tr>
              <tr v-else-if="fetchError">
                <td colspan="7" class="empty-row" style="color:#ef4444">{{ fetchError }}</td>
              </tr>
              <tr v-else-if="filteredFra.length === 0">
                <td colspan="7" class="empty-row">No records found.</td>
              </tr>
              <!-- FR-5-05: View detail on click -->
              <tr v-for="f in (!isLoading && !fetchError ? filteredFra : [])" :key="f.fraId" class="clickable-row"
                @click="selectFra(f)">
                <td class="td-name">{{ f.title }}</td>
                <td><span class="cat-tag">{{ f.category }}</span></td>
                <td>${{ f.targetAmount.toLocaleString() }}</td>
                <td class="td-green">${{ f.raisedAmount.toLocaleString() }}</td>
                <td>
                  <div class="mini-progress-wrap">
                    <div class="mini-progress">
                      <div class="mini-fill" :style="{ width: Math.min(f.raisedAmount / f.targetAmount * 100, 100) + '%' }">
                      </div>
                    </div>
                    <span class="mini-pct">{{ Math.round(f.raisedAmount / f.targetAmount * 100) }}%</span>
                  </div>
                </td>
                <td>{{ formatDate(f.completedAt) }}</td>
                <td>
                  <button class="btn btn-detail" @click.stop="selectFra(f)">View</button>
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

    <!-- FR-5-05: Detail Drawer -->
    <div v-if="selectedFra" class="drawer-overlay" @click.self="selectedFra = null">
      <div class="drawer">
        <div class="drawer-header">
          <h3>FRA Detail</h3>
          <button class="drawer-close" @click="selectedFra = null">✕</button>
        </div>
        <div class="drawer-body">
          <RouterLink :to="`/fra/${selectedFra.fraId}`" class="btn-view-full">View Full Details →</RouterLink>
          <div class="drawer-section">
            <div class="dl"><span class="dt">FRA Name</span><span class="dd">{{ selectedFra.title }}</span></div>
            <div class="dl"><span class="dt">Category</span><span class="dd">{{ selectedFra.category }}</span></div>
            <div class="dl"><span class="dt">Description</span><span class="dd">{{ selectedFra.description }}</span>
            </div>
            <div class="dl"><span class="dt">Target Amount</span><span class="dd">${{
              selectedFra.targetAmount.toLocaleString() }}</span></div>
            <div class="dl"><span class="dt">Amount Raised</span><span class="dd td-green">${{
              selectedFra.raisedAmount.toLocaleString() }}</span></div>
            <div class="dl"><span class="dt">Completed Date</span><span class="dd">{{
              formatDate(selectedFra.completedAt) }}</span></div>
            <div class="dl"><span class="dt">Organiser</span><span class="dd">{{ selectedFra.organiser }}</span></div>
          </div>
          <div class="drawer-section">
            <p class="dt" style="margin-bottom: 8px;">Progress</p>
            <div class="mini-progress-wrap">
              <div class="mini-progress mini-progress-lg">
                <div class="mini-fill"
                  :style="{ width: Math.min(selectedFra.raisedAmount / selectedFra.targetAmount * 100, 100) + '%' }"></div>
              </div>
              <span class="mini-pct">{{ Math.round(selectedFra.raisedAmount / selectedFra.targetAmount * 100) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.history-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.history-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 60px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: #111;
  text-align: left;
}

.dashboard-header p {
  color: #666;
  margin: 0;
  text-align: left;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.stat-icon-wrap {
  font-size: 1.4rem;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.stat-icon-green {
  background: #dcfce7;
}

.stat-icon-blue {
  background: #dbeafe;
}

.stat-icon-purple {
  background: #f3e8ff;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.dashboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.filters-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  width: auto;
  min-width: 140px;
}

.date-input {
  width: 140px;
}

.date-sep {
  font-size: 0.85rem;
  color: #6b7280;
  flex-shrink: 0;
}

.form-select,
.form-input {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.88rem;
  background: #f9fafb;
  color: #111;
  outline: none;
}

.form-select:focus,
.form-input:focus {
  border-color: #3b82f6;
  background: #fff;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

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
  padding: 10px 16px;
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
  font-weight: 600;
}

.data-table td {
  padding: 12px 16px;
  font-size: 0.88rem;
  color: #555;
  border-top: 1px solid #f0f0f0;
}

.clickable-row {
  cursor: pointer;
  transition: background 0.15s;
}

.clickable-row:hover {
  background: #f9fafb;
}

.td-name {
  font-weight: 600;
  color: #111;
}

.td-green {
  color: #16a34a;
  font-weight: 600;
}

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 32px !important;
}

.cat-tag {
  background: #f3f4f6;
  color: #374151;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  white-space: nowrap;
}

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

.mini-progress-lg {
  height: 10px;
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

.btn-detail {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  font-size: 0.78rem;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-detail:hover {
  background: #e5e7eb;
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.drawer {
  width: 400px;
  max-width: 100vw;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.22s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.drawer-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #111;
}

.drawer-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}

.drawer-close:hover {
  background: #f3f4f6;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-view-full {
  display: block;
  text-align: center;
  padding: 10px 16px;
  background: #2563eb;
  color: #fff;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s;
}
.btn-view-full:hover {
  background: #1d4ed8;
}

.drawer-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dl {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.dt {
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 500;
  flex-shrink: 0;
}

.dd {
  font-size: 0.88rem;
  color: #111;
  font-weight: 600;
  text-align: right;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  color: #111;
  text-decoration: none;
}

.logo {
  color: #3b82f6;
  font-size: 1.3rem;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav-link {
  font-size: 0.88rem;
  color: #555;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.nav-link:hover {
  color: #111;
}

.nav-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.logout-link {
  color: #ef4444;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.logout-icon {
  margin-right: 4px;
}

.footer {
  text-align: center;
  padding: 24px;
  font-size: 0.82rem;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}
</style>