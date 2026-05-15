<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['go-home', 'go-login', 'go-logout', 'go-search', 'go-favorites', 'go-favourites', 'go-history', 'go-campaigndetail'])

const donations = ref([
  { donationId: 'D001', fsaName: 'Clean Water Initiative',  category: 'Environment', amount: 150, donatedAt: '2026-04-01', progress: 74,  fsaStatus: 'active'    },
  { donationId: 'D002', fsaName: 'School Supplies Drive',   category: 'Education',   amount: 200, donatedAt: '2026-03-15', progress: 100, fsaStatus: 'completed' },
  { donationId: 'D003', fsaName: 'Medical Aid Fund',        category: 'Health',      amount: 500, donatedAt: '2026-02-20', progress: 46,  fsaStatus: 'active'    },
  { donationId: 'D004', fsaName: 'Elderly Care Program',    category: 'Social',      amount: 100, donatedAt: '2026-01-10', progress: 15,  fsaStatus: 'pending'   },
  { donationId: 'D005', fsaName: 'Food Bank Support',       category: 'Social',      amount: 75,  donatedAt: '2026-03-28', progress: 60,  fsaStatus: 'active'    },
  { donationId: 'D006', fsaName: 'Tree Planting Project',   category: 'Environment', amount: 250, donatedAt: '2026-04-05', progress: 88,  fsaStatus: 'active'    },
  { donationId: 'D007', fsaName: 'Scholarship Fund',        category: 'Education',   amount: 300, donatedAt: '2026-02-01', progress: 100, fsaStatus: 'completed' },
])

const searchKeyword   = ref('')
const selectedCategory = ref('')
const startDate       = ref('')
const endDate         = ref('')
const sortBy          = ref('date-desc')
const selectedDonation = ref(null)

const categories = computed(() => [...new Set(donations.value.map(d => d.category))])
const totalAmount = computed(() => donations.value.reduce((sum, d) => sum + d.amount, 0))
const completedCount = computed(() => donations.value.filter(d => d.fsaStatus === 'completed').length)

const filteredDonations = computed(() => {
  let result = [...donations.value]

  if (searchKeyword.value)
    result = result.filter(d => d.fsaName.toLowerCase().includes(searchKeyword.value.toLowerCase()))
  if (selectedCategory.value)
    result = result.filter(d => d.category === selectedCategory.value)
  if (startDate.value)
    result = result.filter(d => d.donatedAt >= startDate.value)
  if (endDate.value)
    result = result.filter(d => d.donatedAt <= endDate.value)

  result.sort((a, b) => {
    if (sortBy.value === 'date-desc')   return b.donatedAt.localeCompare(a.donatedAt)
    if (sortBy.value === 'date-asc')    return a.donatedAt.localeCompare(b.donatedAt)
    if (sortBy.value === 'amount-desc') return b.amount - a.amount
    if (sortBy.value === 'amount-asc')  return a.amount - b.amount
    return 0
  })

  return result
})

function resetFilters() {
  searchKeyword.value    = ''
  selectedCategory.value = ''
  startDate.value        = ''
  endDate.value          = ''
  sortBy.value           = 'date-desc'
}

function selectDonation(d) { selectedDonation.value = d }

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="history-page">

    <!-- Header -->
    <header class="header">
      <RouterLink to="/" class="brand" @click="emit('go-home')">
        <span class="logo">♥</span>
        <span>FundRise</span>
      </RouterLink>

      <nav class="nav">
        <RouterLink to="/fra/search" class="nav-link" @click="emit('go-search')">⌕ Donate</RouterLink>
        <RouterLink to="/fra/create" class="nav-link">Fundraising</RouterLink>
      </nav>

      <nav class="nav-actions">
        <RouterLink to="/favourites" class="nav-link" @click="emit('go-favourites')">♥ Favourites</RouterLink>
        <RouterLink to="/" class="nav-link" @click="emit('go-home')">Home</RouterLink>
        <RouterLink to="/" class="nav-link logout-link" @click="emit('go-logout')">
          <span class="logout-icon">⇢</span> Logout
        </RouterLink>
      </nav>
    </header>

    <div class="history-container">

      <!-- Page Title -->
      <div class="dashboard-header">
        <h1>Donation History</h1>
        <p>Track all your past donations</p>
      </div>

      <!-- Summary Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-green">💰</div>
          <div class="stat-info">
            <p class="stat-label">Total Donated</p>
            <p class="stat-value">${{ totalAmount.toLocaleString() }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-blue">📋</div>
          <div class="stat-info">
            <p class="stat-label">Total Donations</p>
            <p class="stat-value">{{ donations.length }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-purple">🏆</div>
          <div class="stat-info">
            <p class="stat-label">Completed FSAs</p>
            <p class="stat-value">{{ completedCount }}</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <section class="dashboard-section filters-section">
        <div class="filters-row">

          <div class="search-pill search-pill-filter">
            <span class="search-icon">⌕</span>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="Search donations…"
            />
          </div>

          <select v-model="selectedCategory" class="form-select filter-select">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>

          <input v-model="startDate" type="date" class="form-input date-input" />
          <span class="date-sep">to</span>
          <input v-model="endDate" type="date" class="form-input date-input" />

          <select v-model="sortBy" class="form-select filter-select">
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (Highest)</option>
            <option value="amount-asc">Amount (Lowest)</option>
          </select>

          <button class="btn btn-cancel" @click="resetFilters">Reset</button>
        </div>
      </section>

      <!-- Donations Table -->
      <section class="dashboard-section">
        <div class="section-title-row">
          <h2>Donations ({{ filteredDonations.length }})</h2>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>FSA Name</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredDonations.length === 0">
                <td colspan="7" class="empty-row">No records found.</td>
              </tr>
              <tr
                v-for="d in filteredDonations"
                :key="d.donationId"
                class="clickable-row"
                @click="selectDonation(d)"
              >
                <td class="td-name">{{ d.fsaName }}</td>
                <td><span class="cat-tag">{{ d.category }}</span></td>
                <td class="td-green">${{ d.amount.toLocaleString() }}</td>
                <td>{{ formatDate(d.donatedAt) }}</td>
                <td>
                  <div class="mini-progress-wrap">
                    <div class="mini-progress">
                      <div class="mini-fill" :style="{ width: d.progress + '%' }"></div>
                    </div>
                    <span class="mini-pct">{{ d.progress }}%</span>
                  </div>
                </td>
                <td>
                  <span :class="['status-badge', 'status-' + d.fsaStatus]">{{ d.fsaStatus }}</span>
                </td>
                <td>
                  <button class="btn btn-detail" @click.stop="selectDonation(d)">View</button>
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

    <!-- Detail Modal -->
    <div v-if="selectedDonation" class="drawer-overlay" @click.self="selectedDonation = null">
      <div class="drawer">
        <div class="drawer-header">
          <h3>Donation Detail</h3>
          <button class="drawer-close" @click="selectedDonation = null">✕</button>
        </div>
        <div class="drawer-body">

          <div class="drawer-section">
            <div class="dl"><span class="dt">FSA Name</span><span class="dd">{{ selectedDonation.fsaName }}</span></div>
            <div class="dl"><span class="dt">Category</span><span class="dd">{{ selectedDonation.category }}</span></div>
            <div class="dl"><span class="dt">Amount Donated</span><span class="dd td-green">${{ selectedDonation.amount.toLocaleString() }}</span></div>
            <div class="dl"><span class="dt">Date</span><span class="dd">{{ formatDate(selectedDonation.donatedAt) }}</span></div>
            <div class="dl">
              <span class="dt">Status</span>
              <span class="dd"><span :class="['status-badge', 'status-' + selectedDonation.fsaStatus]">{{ selectedDonation.fsaStatus }}</span></span>
            </div>
          </div>

          <div class="drawer-section">
            <p class="dt" style="margin-bottom: 8px;">FSA Progress</p>
            <div class="mini-progress-wrap">
              <div class="mini-progress mini-progress-lg">
                <div class="mini-fill" :style="{ width: selectedDonation.progress + '%' }"></div>
              </div>
              <span class="mini-pct">{{ selectedDonation.progress }}%</span>
            </div>
          </div>

        </div>
      </div>
    </div>

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
.logo { color: #ef4444; font-size: 1.2rem; }
.nav { display: flex; align-items: center; gap: 16px; }
.nav-actions { display: flex; align-items: center; gap: 16px; margin-left: auto; }
.nav-link { font-size: 0.88rem; color: #555; text-decoration: none; font-weight: 500; }
.nav-link:hover { color: #111; }
.logout-link { color: #ef4444; }
.logout-icon { margin-right: 4px; }
.footer {
  text-align: center;
  padding: 24px;
  font-size: 0.8rem;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

/* ── Shared Form/Button ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 9px 16px;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.88rem;
}
.btn-cancel { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
.btn-cancel:hover { background: #e5e7eb; }
.form-input {
  padding: 9px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.88rem;
  color: #111;
  background: #fff;
  box-sizing: border-box;
}
.form-select {
  padding: 9px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.88rem;
  color: #111;
  background: #fff;
  box-sizing: border-box;
}

/* ── Layout ── */
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

/* ── Page Title ── */
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

/* ── Stat Cards ── */
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
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
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

.stat-icon-green  { background: #dcfce7; }
.stat-icon-blue   { background: #dbeafe; }
.stat-icon-purple { background: #f3e8ff; }

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0 0 4px;
  font-weight: 500;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* ── Section Card ── */
.dashboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 20px;
}

/* ── Filters ── */
.filters-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.search-pill-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 180px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 14px;
}

.search-pill-filter input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  padding: 10px 0;
  font-size: 0.88rem;
  color: #111;
}

.search-icon { color: #9ca3af; font-size: 1rem; }

.filter-select { width: auto; min-width: 140px; padding: 8px 12px; }

.date-input { width: 140px; padding: 8px 12px; }

.date-sep {
  font-size: 0.85rem;
  color: #6b7280;
  flex-shrink: 0;
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

.clickable-row { cursor: pointer; transition: background 0.15s; }
.clickable-row:hover { background: #f9fafb; }

.td-name  { font-weight: 600; color: #111; }
.td-green { color: #16a34a; font-weight: 600; }

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 32px !important;
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

/* ── Status Badge ── */
.status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 99px;
  letter-spacing: 0.04em;
}

.status-active    { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.status-completed { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.status-pending   { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }

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

.mini-progress-lg { height: 10px; }

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

/* ── Detail Button ── */
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

.btn-detail:hover { background: #e5e7eb; }

/* ── Drawer ── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
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
  box-shadow: -4px 0 24px rgba(0,0,0,0.15);
  animation: slideIn 0.22s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
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

.drawer-close:hover { background: #f3f4f6; }

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
</style>
