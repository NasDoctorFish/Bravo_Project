<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['go-home', 'go-login', 'go-logout'])

const report = ref(null)
const categories = ref([])
const newCategoryName = ref('')
const newCategoryDesc = ref('')
const period = ref('monthly')
const loading = ref(true)
const error = ref('')

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
const accessToken = ref(localStorage.getItem('accessToken') || '')

const fetchData = async () => {
  loading.value = true
  try {
    const [reportRes, categoriesRes] = await Promise.all([
      fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9d90081/reports/overview?period=${period.value}`,
        { headers: { Authorization: `Bearer ${accessToken.value}` } }
      ),
      fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9d90081/categories`,
        { headers: { Authorization: `Bearer ${accessToken.value}` } }
      ),
    ])

    if (reportRes.ok) {
      report.value = await reportRes.json()
    }

    if (categoriesRes.ok) {
      const data = await categoriesRes.json()
      categories.value = data.categories
    }
  } catch (err) {
    console.error('Error fetching data:', err)
  } finally {
    loading.value = false
  }
}

const handleAddCategory = async () => {
  error.value = ''
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-f9d90081/categories`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.value}`,
        },
        body: JSON.stringify({
          name: newCategoryName.value,
          description: newCategoryDesc.value,
        }),
      }
    )

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to add category')
    }

    const data = await response.json()
    categories.value.push(data.category)
    newCategoryName.value = ''
    newCategoryDesc.value = ''
  } catch (err) {
    error.value = err.message
  }
}

const handleDeleteCategory = async (categoryId) => {
  if (!confirm('Are you sure you want to delete this category?')) return

  try {
    await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-f9d90081/categories/${categoryId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken.value}` },
      }
    )
    categories.value = categories.value.filter((c) => c.id !== categoryId)
  } catch (err) {
    console.error('Error deleting category:', err)
  }
}

const periodLabel = (p) => {
  if (p === 'monthly') return 'month'
  if (p === 'weekly') return 'week'
  return 'day'
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString()

onMounted(() => {
  fetchData()
})
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
        <a href="#" class="nav-link">Home</a>
        <span class="user-info">Platform Admin</span>
        <a href="#" class="nav-link logout-link" @click.prevent="emit('go-logout')">
          <span class="logout-icon">⇢</span> Logout
        </a>
      </nav>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="loading-screen">
      <p>Loading...</p>
    </div>

    <div v-else class="dashboard-container">

      <!-- Page Title -->
      <div class="dashboard-header">
        <h1>Platform Admin Dashboard</h1>
        <p>Manage categories and view platform reports</p>
      </div>

      <!-- Platform Overview -->
      <section class="dashboard-section">
        <div class="section-title-row">
          <h2>📊 Platform Overview</h2>
          <select v-model="period" class="form-select period-select" @change="fetchData">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div v-if="report">

          <!-- Stat Cards -->
          <div class="stats-grid">

            <div class="stat-card">
              <div class="stat-icon-wrap stat-icon-blue">👥</div>
              <div class="stat-info">
                <p class="stat-label">Total Campaigns</p>
                <p class="stat-value stat-value-dark">{{ report.totalCampaigns }}</p>
                <p class="stat-sub">+{{ report.periodCampaigns }} this {{ periodLabel(period) }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrap stat-icon-green">💵</div>
              <div class="stat-info">
                <p class="stat-label">Total Raised</p>
                <p class="stat-value stat-value-green">${{ report.totalRaised?.toLocaleString() }}</p>
                <p class="stat-sub">+${{ report.periodRaised?.toLocaleString() }} this {{ periodLabel(period) }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrap stat-icon-purple">📈</div>
              <div class="stat-info">
                <p class="stat-label">Total Donations</p>
                <p class="stat-value stat-value-purple">{{ report.totalDonations }}</p>
                <p class="stat-sub">+{{ report.periodDonations }} this {{ periodLabel(period) }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrap stat-icon-orange">🔥</div>
              <div class="stat-info">
                <p class="stat-label">Active Campaigns</p>
                <p class="stat-value stat-value-orange">{{ report.activeCampaigns }}</p>
                <p class="stat-sub">{{ report.completedCampaigns }} completed</p>
              </div>
            </div>

          </div>

          <!-- Category Statistics Table -->
          <div class="table-card">
            <h3>Category Statistics</h3>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Campaigns</th>
                    <th>Total Raised</th>
                    <th>Total Views</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(stats, category) in report.categoryStats" :key="category">
                    <td class="td-name">{{ category }}</td>
                    <td>{{ stats.count }}</td>
                    <td class="td-green">${{ stats.raised?.toLocaleString() }}</td>
                    <td class="td-blue">{{ stats.views?.toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <div v-else class="empty-state-text">No report data available.</div>
      </section>

      <!-- Manage Categories -->
      <section class="dashboard-section">
        <h2>Manage Categories</h2>

        <div v-if="error" class="error-banner">{{ error }}</div>

        <!-- Add Category Form -->
        <div class="form-card">
          <div class="form-row">
            <div class="form-group">
              <label>Category Name <span class="required">*</span></label>
              <input
                v-model="newCategoryName"
                type="text"
                class="form-input"
                placeholder="e.g., Medical"
                required
              />
            </div>
            <div class="form-group">
              <label>Description</label>
              <input
                v-model="newCategoryDesc"
                type="text"
                class="form-input"
                placeholder="Optional description"
              />
            </div>
          </div>
          <div class="form-actions">
            <button
              type="button"
              class="btn btn-create"
              @click="handleAddCategory"
              :disabled="!newCategoryName"
            >
              <span class="btn-icon">+</span> Add Category
            </button>
          </div>
        </div>

        <!-- Categories List -->
        <div class="categories-list">
          <p v-if="categories.length === 0" class="empty-state-text">No categories yet.</p>

          <div
            v-for="category in categories"
            :key="category.id"
            class="category-item"
          >
            <div class="category-info">
              <h4>{{ category.name }}</h4>
              <p v-if="category.description" class="category-desc">{{ category.description }}</p>
              <p class="category-date">📅 Added {{ formatDate(category.createdAt) }}</p>
            </div>
            <button
              type="button"
              class="btn btn-delete"
              @click="handleDeleteCategory(category.id)"
            >
              🗑
            </button>
          </div>
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
.dashboard-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.dashboard-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

.dashboard-header {
  margin-bottom: 32px;
  text-align: left;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 6px;
  color: black;
}

.dashboard-header p {
  color: #666;
  margin: 0;
}

/* ── Loading ── */
.loading-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #666;
}

/* ── Section ── */
.dashboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  margin-bottom: 28px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.dashboard-section h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 20px;
  color: #111;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.section-title-row h2 {
  margin: 0;
}

.period-select {
  width: auto;
  padding: 6px 20px;
}

/* ── Stat Cards ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}

.stat-icon-wrap {
  font-size: 1.5rem;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.stat-icon-blue   { background: #dbeafe; }
.stat-icon-green  { background: #dcfce7; }
.stat-icon-purple { background: #f3e8ff; }
.stat-icon-orange { background: #ffedd5; }

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.1;
}

.stat-value-dark   { color: #111827; }
.stat-value-green  { color: #16a34a; }
.stat-value-purple { color: #9333ea; }
.stat-value-orange { color: #ea580c; }

.stat-sub {
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 0;
}

/* ── Table ── */
.table-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 4px;
}

.table-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  padding: 16px 20px;
  margin: 0;
  color: #111;
  border-bottom: 1px solid #e5e7eb;
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
  padding: 12px 20px;
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
  font-weight: 600;
}

.data-table tbody tr {
  border-top: 1px solid #f0f0f0;
  transition: background 0.15s;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.data-table td {
  padding: 14px 20px;
  color: #555;
}

.td-name  { font-weight: 600; color: #111827; }
.td-green { color: #16a34a; font-weight: 600; }
.td-blue  { color: #2563eb; }

/* ── Error Banner ── */
.error-banner {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

/* ── Form Card ── */
.form-card {
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

/* ── Categories List ── */
.categories-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  transition: background 0.15s;
}

.category-item:hover {
  background: #f9fafb;
}

.category-info h4 {
  font-weight: 600;
  margin: 0 0 2px;
  color: #111;
}

.category-desc {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 4px;
}

.category-date {
  font-size: 0.75rem;
  color: #aaa;
  margin: 0;
}

.btn-delete {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #dc2626;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.15s;
}

.btn-delete:hover {
  background: #fef2f2;
}

.empty-state-text {
  color: #888;
  text-align: center;
  padding: 20px 0;
}
</style>