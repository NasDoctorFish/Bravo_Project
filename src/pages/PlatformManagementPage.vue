<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
const { isLoggedIn, userId, userRole, sessionReady } = useAuth()
import { useRouter } from 'vue-router'
import { ref, computed, watch, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { create, type CategoryData } from '../controllers/categoryController'

const router = useRouter()
const emit = defineEmits(['go-home', 'go-logout', 'go-search', 'go-login', 'go-signup', 'go-create'])

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

// State
const activeTab      = ref('Pending')
const searchQuery    = ref('')
const filterCategory = ref('')
const searchType     = ref('campaign')
const tabs           = ['Pending', 'Active', 'Rejected', 'Flagged', 'All']

// Categories
const categories          = ref<string[]>([])
const showForm            = ref(false)
const newCategory         = ref({ categoryname: '', categorydescription: '' })
const errorMessage        = ref('')
const notificationMessage = ref('')
const showNotification    = ref(false)

async function fetchCategories() {
  const { data, error } = await supabase
    .from('category')
    .select('categoryname')
    .order('categoryname')
  if (error) console.error('fetchCategories error:', error.message)
  categories.value = (data ?? []).map((r: any) => r.categoryname)
}

async function submitCategory() {
  const categoryData: CategoryData = {
    categoryname:        newCategory.value.categoryname.trim(),
    categorydescription: newCategory.value.categorydescription.trim(),
  }
  try {
    await create(categoryData.categoryname, categoryData.categorydescription)
    displayCategoryMessage('Category created successfully')
    newCategory.value = { categoryname: '', categorydescription: '' }
    errorMessage.value = ''
    showForm.value = false
    await fetchCategories()
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to create category'
    displayCategoryMessage(errorMessage.value)
  }
}

function displayCategoryMessage(message: string) {
  notificationMessage.value = message
  showNotification.value    = true
  setTimeout(() => { showNotification.value = false }, 3000)
}

// Campaigns
type CampaignStatus = 'pending' | 'active' | 'rejected' | 'flagged'
type Campaign = {
  id:          number
  title:       string
  organizer:   string
  category:    string
  goal:        number
  status:      CampaignStatus
  submitted:   string
  description: string
  image:       string
  flags:       string[]
}

const campaigns          = ref<Campaign[]>([])
const isLoadingCampaigns = ref(true)
const selectedCampaign   = ref<Campaign | null>(null)

async function fetchCampaigns() {
  isLoadingCampaigns.value = true
  const { data, error } = await supabase
    .from('fundraisingactivity')
    .select('*, category(categoryname)')
    .order('createdat', { ascending: false })

  if (error) {
    console.error('fetchCampaigns error:', error.message)
    isLoadingCampaigns.value = false
    return
  }

  campaigns.value = (data ?? []).map((row: any) => ({
    id:          row.fraid,
    title:       row.title     ?? 'Untitled',
    organizer:   row.createdby ?? 'Unknown',
    category:    row.category?.categoryname ?? 'Uncategorised',
    goal:        Number(row.targetamount ?? 0),
    status:      (row.status ?? 'pending').toLowerCase() as CampaignStatus,
    submitted:   row.createdat
      ? new Date(row.createdat).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—',
    description: row.description ?? '',
    image:       row.image || 'https://placehold.co/80x60/d8f3dc/2d6a4f?text=Campaign',
    flags:       [],
  }))

  isLoadingCampaigns.value = false
}

async function approve(c: Campaign) {
  const { error } = await supabase
    .from('fundraisingactivity')
    .update({ status: 'ACTIVE' })
    .eq('fraid', c.id)
  if (error) { console.error(error.message); return }
  c.status = 'active'
}

async function reject(c: Campaign) {
  const { error } = await supabase
    .from('fundraisingactivity')
    .update({ status: 'REJECTED' })
    .eq('fraid', c.id)
  if (error) { console.error(error.message); return }
  c.status = 'rejected'
}

async function flag(c: Campaign) {
  const { error } = await supabase
    .from('fundraisingactivity')
    .update({ status: 'FLAGGED' })
    .eq('fraid', c.id)
  if (error) { console.error(error.message); return }
  c.status = 'flagged'
}

async function suspend(c: Campaign) {
  const { error } = await supabase
    .from('fundraisingactivity')
    .update({ status: 'REJECTED' })
    .eq('fraid', c.id)
  if (error) { console.error(error.message); return }
  c.status = 'rejected'
}

function openDetail(c: Campaign) { selectedCampaign.value = c }

// Donee Registrations
const doneeRegistrations = ref<any[]>([])
const isLoadingDonees    = ref(true)
const selectedProfile    = ref<any>(null)

async function fetchDoneeRegistrations() {
  isLoadingDonees.value = true
  const { data, error } = await supabase
    .from('doneeregistration')
    .select('donee_reg_id, userid, bio, bankaccount, status, submittedat, notes')
    .order('submittedat', { ascending: false })

  if (error) {
    console.error('fetchDoneeRegistrations error:', error.message)
    isLoadingDonees.value = false
    return
  }
  doneeRegistrations.value = data ?? []
  isLoadingDonees.value    = false
}

async function approveDonee(reg: any) {
  const { error } = await supabase
    .from('doneeregistration')
    .update({ status: 'ACTIVE', reviewedby: String(userId.value), reviewedat: new Date().toISOString() })
    .eq('donee_reg_id', reg.donee_reg_id)
  if (error) { console.error(error.message); return }
  reg.status = 'ACTIVE'
}

async function rejectDonee(reg: any) {
  const reason = prompt('Enter rejection reason:')
  if (!reason) return
  const { error } = await supabase
    .from('doneeregistration')
    .update({ status: 'REJECTED', notes: reason, reviewedby: String(userId.value), reviewedat: new Date().toISOString() })
    .eq('donee_reg_id', reg.donee_reg_id)
  if (error) { console.error(error.message); return }
  reg.status = 'REJECTED'
  reg.notes  = reason
}

function viewProfile(reg: any) { selectedProfile.value = reg }

// Computed
const tabCounts = computed(() => ({
  Pending:  campaigns.value.filter(c => c.status === 'pending').length,
  Active:   campaigns.value.filter(c => c.status === 'active').length,
  Rejected: campaigns.value.filter(c => c.status === 'rejected').length,
  Flagged:  campaigns.value.filter(c => c.status === 'flagged').length,
  All:      campaigns.value.length,
}))

const pendingCount = computed(() => tabCounts.value.Pending)
const flaggedCount = computed(() => tabCounts.value.Flagged)

const filteredCampaigns = computed(() => {
  let result = campaigns.value
  if (activeTab.value !== 'All')
    result = result.filter(c => c.status === activeTab.value.toLowerCase())
  if (searchQuery.value)
    result = result.filter(c => c.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
  if (filterCategory.value)
    result = result.filter(c => c.category === filterCategory.value)
  return result
})

const filteredDonees = computed(() =>
  doneeRegistrations.value.filter(reg => {
    const query = searchQuery.value.toLowerCase()
    return (
      reg.donee_reg_id.toString().includes(query) ||
      reg.userid.toString().includes(query) ||
      (reg.bio ?? '').toLowerCase().includes(query)
    )
  })
)

// Init
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchCampaigns(), fetchDoneeRegistrations()])
})
</script>

<template>
  <div class="pm-page">


    <div class="pm-container">

      <!-- Page Title -->
      <div class="dashboard-header">
        <div>
          <h1>Platform Management</h1>
          <p>{{ searchType === 'donee'
                ? 'Review and approve donee registrations'
                : 'Review and approve fundraising campaigns' }}</p>
        </div>
        <div class="header-stats">
          <div class="hstat">
            <span class="hstat-val hstat-orange">{{ pendingCount }}</span>
            <span class="hstat-lbl">Pending Review</span>
          </div>
          <div class="hstat">
            <span class="hstat-val hstat-red">{{ flaggedCount }}</span>
            <span class="hstat-lbl">Flagged</span>
          </div>
        </div>
      </div>

      <!-- Category Management -->
      <section class="dashboard-section category-management">
        <div class="section-title-row">
          <div>
            <h2>Category Management</h2>
            <p>Create categories used by campaign search and campaign setup.</p>
          </div>
          <button class="toolbar-btn" @click="showForm = true">+ New Category</button>
        </div>

        <div class="category-grid">
          <div v-for="c in categories" :key="c" class="category-card">
            <span class="category-name">{{ c }}</span>
            <span class="category-meta">Active category</span>
          </div>
        </div>

        <p v-if="showNotification" :class="['notification-message', errorMessage ? 'notification-error' : 'notification-success']">
          {{ notificationMessage }}
        </p>
      </section>

      <!-- Main Section -->
      <section class="dashboard-section">

        <!-- Tabs -->
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab"
            :class="['tab-btn', { active: activeTab === tab }]"
            @click="activeTab = tab"
          >
            {{ tab }}
            <span v-if="tabCounts[tab]" class="tab-count">{{ tabCounts[tab] }}</span>
          </button>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
          <select v-model="searchType" class="form-select toolbar-select">
            <option value="campaign">Campaigns</option>
            <option value="donee">Donee Registrations</option>
          </select>

          <div class="search-pill">
            <span class="search-icon">⌕</span>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="searchType === 'donee' ? 'Search registrations...' : 'Search campaigns...'"
            />
          </div>

          <select v-if="searchType === 'campaign'" v-model="filterCategory" class="form-select toolbar-select">
            <option value="">All Categories</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <!-- Campaign List -->
        <div class="campaign-list">

          <!-- Donee Registrations -->
          <template v-if="searchType === 'donee'">
            <div v-if="isLoadingDonees" class="loading-state">Loading registrations…</div>

            <div v-else-if="filteredDonees.length === 0" class="empty-state">
              <div class="empty-icon">👥</div>
              <p>No donee registrations found.</p>
            </div>

            <div v-for="reg in filteredDonees" :key="reg.donee_reg_id" class="campaign-row">
              <div class="campaign-left">
                <div class="campaign-thumb-icon">👤</div>
                <div class="campaign-info">
                  <p class="campaign-title">
                    Registration #{{ reg.donee_reg_id }} (User ID: {{ reg.userid }})
                  </p>
                  <div class="campaign-meta">
                    <span>Bank: {{ reg.bankaccount || 'N/A' }}</span>
                    <span class="dot">·</span>
                    <span>Submitted: {{ reg.submittedat ? new Date(reg.submittedat).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' }}</span>
                  </div>
                  <p class="campaign-desc">{{ reg.bio ?? '—' }}</p>
                  <p v-if="reg.notes" class="campaign-desc" style="color:#b91c1c; margin-top:4px;">
                    Note: {{ reg.notes }}
                  </p>
                </div>
              </div>

              <div class="campaign-right">
                <span :class="['status-badge', 'status-' + reg.status?.toLowerCase()]">{{ reg.status }}</span>
                <div class="action-buttons" v-if="reg.status === 'PENDING'">
                  <button class="btn btn-detail" @click="viewProfile(reg)">View Profile</button>
                  <button class="btn btn-approve" @click="approveDonee(reg)">✓ Approve</button>
                  <button class="btn btn-reject" @click="rejectDonee(reg)">✕ Reject</button>
                </div>
              </div>
            </div>
          </template>

          <!-- Campaigns -->
          <template v-else>
            <div v-if="isLoadingCampaigns" class="loading-state">Loading campaigns…</div>

            <div v-else-if="filteredCampaigns.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>No campaigns in this category.</p>
            </div>

            <div
              v-for="c in filteredCampaigns"
              :key="c.id"
              class="campaign-row"
            >
              <div class="campaign-left">
                <img :src="c.image" :alt="c.title" class="campaign-thumb" />
                <div class="campaign-info">
                  <p class="campaign-title">{{ c.title }}</p>
                  <div class="campaign-meta">
                    <span>{{ c.organizer }}</span>
                    <span class="dot">·</span>
                    <span>{{ c.category }}</span>
                    <span class="dot">·</span>
                    <span>Goal: ${{ c.goal.toLocaleString() }}</span>
                    <span class="dot">·</span>
                    <span>Submitted {{ c.submitted }}</span>
                  </div>
                  <p class="campaign-desc">{{ c.description }}</p>
                  <div v-if="c.flags && c.flags.length" class="campaign-flags">
                    <span v-for="f in c.flags" :key="f" class="flag-chip">⚠️ {{ f }}</span>
                  </div>
                </div>
              </div>

              <div class="campaign-right">
                <span :class="['status-badge', 'status-' + c.status]">{{ c.status }}</span>
                <div class="action-buttons">
                  <button class="btn btn-detail" @click="openDetail(c)">View Details</button>
                  <button v-if="c.status === 'pending'" class="btn btn-approve" @click="approve(c)">✓ Approve</button>
                  <button v-if="c.status === 'pending'" class="btn btn-reject" @click="reject(c)">✕ Reject</button>
                  <button v-if="c.status === 'active'" class="btn btn-flag" @click="flag(c)">⚠️ Flag</button>
                  <button v-if="c.status === 'active'" class="btn btn-reject" @click="suspend(c)">⏸ Suspend</button>
                </div>
              </div>
            </div>
          </template>

        </div>
      </section>
    </div>

    <!-- Campaign Detail Drawer -->
    <div v-if="selectedCampaign" class="drawer-overlay" @click.self="selectedCampaign = null">
      <div class="drawer">
        <div class="drawer-header">
          <h3>Campaign Details</h3>
          <button class="drawer-close" @click="selectedCampaign = null">✕</button>
        </div>
        <div class="drawer-body">
          <img v-if="selectedCampaign.image" :src="selectedCampaign.image" class="drawer-img" :alt="selectedCampaign.title" />
          <div class="drawer-section">
            <h4>{{ selectedCampaign.title }}</h4>
            <p>by {{ selectedCampaign.organizer }}</p>
          </div>
          <div class="drawer-section">
            <p><strong>Category:</strong> {{ selectedCampaign.category }}</p>
            <p><strong>Goal:</strong> ${{ selectedCampaign.goal.toLocaleString() }}</p>
            <p><strong>Status:</strong> {{ selectedCampaign.status }}</p>
            <p><strong>Submitted:</strong> {{ selectedCampaign.submitted }}</p>
          </div>
          <div class="drawer-desc" v-if="selectedCampaign.description">
            <h4>Description</h4>
            <p>{{ selectedCampaign.description }}</p>
          </div>
          <div class="drawer-flags" v-if="selectedCampaign.flags && selectedCampaign.flags.length">
            <h4>Flags</h4>
            <p v-for="flag in selectedCampaign.flags" :key="flag" style="color:#ef4444">⚑ {{ flag }}</p>
          </div>
          <div class="drawer-actions">
            <button class="btn btn-approve" @click="approve(selectedCampaign); selectedCampaign = null">Approve</button>
            <button class="btn btn-reject" @click="reject(selectedCampaign); selectedCampaign = null">Reject</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>

    <!-- ── Campaign Detail Drawer ── -->
    <Teleport to="body">
      <div v-if="selectedCampaign" class="drawer-overlay" @click.self="selectedCampaign = null">
        <div class="drawer">
          <div class="drawer-header">
            <h3>Campaign Detail</h3>
            <button class="drawer-close" @click="selectedCampaign = null">✕</button>
          </div>
          <div class="drawer-body">

            <img
              :src="selectedCampaign.image"
              :alt="selectedCampaign.title"
              class="drawer-img"
            />

            <div class="drawer-section">
              <div class="dl"><span class="dt">Title</span><span class="dd">{{ selectedCampaign.title }}</span></div>
              <div class="dl"><span class="dt">Organizer</span><span class="dd">{{ selectedCampaign.organizer }}</span></div>
              <div class="dl"><span class="dt">Category</span><span class="dd">{{ selectedCampaign.category }}</span></div>
              <div class="dl"><span class="dt">Goal</span><span class="dd">${{ selectedCampaign.goal.toLocaleString() }}</span></div>
              <div class="dl"><span class="dt">Submitted</span><span class="dd">{{ selectedCampaign.submitted }}</span></div>
              <div class="dl">
                <span class="dt">Status</span>
                <span class="dd">
                  <span :class="['status-badge', 'status-' + selectedCampaign.status]">{{ selectedCampaign.status }}</span>
                </span>
              </div>
            </div>

            <div class="drawer-section">
              <p class="dt" style="margin-bottom:8px;">Description</p>
              <p class="drawer-desc">{{ selectedCampaign.description }}</p>
            </div>

            <div v-if="selectedCampaign.flags?.length" class="drawer-section">
              <p class="dt" style="margin-bottom:8px;">Flags</p>
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <span v-for="f in selectedCampaign.flags" :key="f" class="flag-chip">⚠️ {{ f }}</span>
              </div>
            </div>

            <div class="drawer-section drawer-actions">
              <button
                v-if="selectedCampaign.status === 'pending'"
                class="btn btn-approve"
                @click="approve(selectedCampaign); selectedCampaign = null"
              >✓ Approve</button>
              <button
                v-if="selectedCampaign.status === 'pending'"
                class="btn btn-reject"
                @click="reject(selectedCampaign); selectedCampaign = null"
              >✕ Reject</button>
              <button
                v-if="selectedCampaign.status === 'active'"
                class="btn btn-flag"
                @click="flag(selectedCampaign); selectedCampaign = null"
              >⚠️ Flag</button>
              <button
                v-if="selectedCampaign.status === 'active'"
                class="btn btn-reject"
                @click="suspend(selectedCampaign); selectedCampaign = null"
              >⏸ Suspend</button>
            </div>

          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Donee Profile Drawer ── -->
    <Teleport to="body">
      <div v-if="selectedProfile" class="drawer-overlay" @click.self="selectedProfile = null">
        <div class="drawer">
          <div class="drawer-header">
            <h3>Donee Profile</h3>
            <button class="drawer-close" @click="selectedProfile = null">✕</button>
          </div>
          <div class="drawer-body">
            <div class="drawer-section">
              <div class="dl"><span class="dt">Registration ID</span><span class="dd">#{{ selectedProfile.donee_reg_id }}</span></div>
              <div class="dl"><span class="dt">User ID</span><span class="dd">{{ selectedProfile.userid }}</span></div>
              <div class="dl"><span class="dt">Bank Account</span><span class="dd">{{ selectedProfile.bankaccount || 'N/A' }}</span></div>
              <div class="dl"><span class="dt">Status</span>
                <span class="dd">
                  <span :class="['status-badge', 'status-' + selectedProfile.status?.toLowerCase()]">{{ selectedProfile.status }}</span>
                </span>
              </div>
              <div class="dl">
                <span class="dt">Submitted</span>
                <span class="dd">{{ selectedProfile.submittedat ? new Date(selectedProfile.submittedat).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' }}</span>
              </div>
            </div>
            <div class="drawer-section">
              <p class="dt" style="margin-bottom:8px;">Bio</p>
              <p class="drawer-desc">{{ selectedProfile.bio ?? 'No bio provided.' }}</p>
            </div>
            <div v-if="selectedProfile.notes" class="drawer-section">
              <p class="dt" style="margin-bottom:8px;">Notes</p>
              <p class="drawer-desc" style="color:#b91c1c;">{{ selectedProfile.notes }}</p>
            </div>
            <div v-if="selectedProfile.status === 'PENDING'" class="drawer-section drawer-actions">
              <button class="btn btn-approve" @click="approveDonee(selectedProfile); selectedProfile = null">✓ Approve</button>
              <button class="btn btn-reject" @click="rejectDonee(selectedProfile); selectedProfile = null">✕ Reject</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── New Category Form Modal ── -->
    <Teleport to="body">
      <div v-if="showForm" class="drawer-overlay" @click.self="showForm = false">
        <div class="drawer">
          <div class="drawer-header">
            <h3>New Category</h3>
            <button class="drawer-close" @click="showForm = false">✕</button>
          </div>
          <div class="drawer-body">
            <div class="form-group">
              <label>Category Name <span class="required">*</span></label>
              <input
                v-model="newCategory.categoryname"
                type="text"
                class="form-input"
                placeholder="e.g. Environment"
              />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea
                v-model="newCategory.categorydescription"
                rows="3"
                class="form-textarea"
                placeholder="Describe this category…"
              ></textarea>
            </div>
            <div v-if="errorMessage" class="error-banner">⚠️ {{ errorMessage }}</div>
            <div class="drawer-section drawer-actions">
              <button class="btn btn-cancel" @click="showForm = false">Cancel</button>
              <button
                class="btn btn-approve"
                :disabled="!newCategory.categoryname.trim()"
                @click="submitCategory"
              >Create Category</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
/* ── Layout ── */
.pm-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}
.pm-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 24px 48px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

/* ── Header / Footer ── */
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
.nav, .nav-actions { display: flex; align-items: center; gap: 16px; }
.nav-actions { margin-left: auto; }
.nav-link { font-size: 0.88rem; color: #555; text-decoration: none; font-weight: 500; }
.nav-link:hover { color: #111; }
.logout-link { color: #ef4444; }
.logout-icon { margin-right: 4px; }
.user-info { font-size: 0.82rem; color: #6b7280; font-weight: 500; }
.footer {
  text-align: center;
  padding: 24px;
  font-size: 0.8rem;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

/* ── Dashboard Header ── */
.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}
.dashboard-header h1 { font-size: 1.6rem; font-weight: 800; color: #111; margin: 0 0 4px; }
.dashboard-header p  { font-size: 0.88rem; color: #6b7280; margin: 0; }

.header-stats { display: flex; gap: 24px; }
.hstat { display: flex; flex-direction: column; align-items: center; }
.hstat-val { font-size: 1.6rem; font-weight: 800; }
.hstat-lbl { font-size: 0.72rem; color: #9ca3af; }
.hstat-orange { color: #f97316; }
.hstat-red    { color: #ef4444; }

/* ── Section Card ── */
.dashboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 20px;
}
.section-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}
.section-title-row h2 { font-size: 1rem; font-weight: 700; color: #111; margin: 0 0 4px; text-align: left; }
.section-title-row p  { font-size: 0.82rem; color: #6b7280; margin: 0; }

/* ── Category Grid ── */
.category-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}
.category-card {
  display: flex;
  flex-direction: column;
  padding: 10px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-width: 120px;
}
.category-name { font-size: 0.88rem; font-weight: 600; color: #111; }
.category-meta { font-size: 0.72rem; color: #9ca3af; margin-top: 2px; }

/* ── Notification ── */
.notification-message {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}
.notification-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.notification-error   { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 16px;
}
.tab-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  font-size: 0.88rem;
  font-weight: 600;
  color: #9ca3af;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
}
.tab-btn:hover { color: #3b82f6; }
.tab-btn.active { color: #3b82f6; border-bottom-color: #3b82f6; }
.tab-count {
  background: #e0e7ff;
  color: #3730a3;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 99px;
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.toolbar-btn {
  padding: 8px 14px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.toolbar-btn:hover { background: #2563eb; }
.toolbar-select { font-size: 0.85rem; padding: 8px 10px; }

.search-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 6px 12px;
  flex: 1;
  min-width: 180px;
}
.search-pill input {
  border: none;
  background: none;
  outline: none;
  font-size: 0.88rem;
  color: #111;
  width: 100%;
}
.search-icon { color: #9ca3af; font-size: 1rem; }

/* ── Campaign Row ── */
.campaign-list { display: flex; flex-direction: column; gap: 12px; }
.campaign-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  background: #fafafa;
  transition: border-color 0.15s;
}
.campaign-row:hover { border-color: #d1d5db; }

.campaign-left { display: flex; gap: 14px; flex: 1; min-width: 0; text-align: left;}
.campaign-thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.campaign-thumb-icon {
  width: 60px;
  height: 60px;
  background: #e0e7ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  flex-shrink: 0;
}
.campaign-info { flex: 1; min-width: 0; }
.campaign-title { font-size: 0.95rem; font-weight: 700; color: #111; margin: 0 0 4px; }
.campaign-meta {
  font-size: 0.78rem;
  color: #9ca3af;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.dot { color: #d1d5db; }
.campaign-desc {
  font-size: 0.82rem;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 500px;
  margin: 0;
}
.campaign-flags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.flag-chip {
  font-size: 0.72rem;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  border-radius: 99px;
  padding: 2px 8px;
}

.campaign-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  flex-shrink: 0;
}
.action-buttons { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

/* ── Status Badges ── */
.status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 99px;
  letter-spacing: 0.04em;
}
.status-active    { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.status-pending   { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.status-rejected  { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.status-flagged   { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
.status-completed { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

/* ── Buttons ── */
.btn { border: none; cursor: pointer; border-radius: 7px; font-size: 0.82rem; font-weight: 600; padding: 7px 12px; transition: all 0.15s; }
.btn-detail   { background: #f3f4f6; color: #374151; }
.btn-detail:hover { background: #e5e7eb; }
.btn-approve  { background: #16a34a; color: #fff; }
.btn-approve:hover:not(:disabled) { background: #15803d; }
.btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-reject   { background: #dc2626; color: #fff; }
.btn-reject:hover { background: #b91c1c; }
.btn-flag     { background: #f59e0b; color: #fff; }
.btn-flag:hover { background: #d97706; }
.btn-cancel   { background: #f3f4f6; color: #374151; }
.btn-cancel:hover { background: #e5e7eb; }

/* ── Loading / Empty ── */
.loading-state { padding: 40px; text-align: center; color: #6b7280; font-size: 0.9rem; }
.empty-state   { padding: 48px; text-align: center; color: #9ca3af; }
.empty-icon    { font-size: 2.5rem; margin-bottom: 12px; }
.empty-state p { font-size: 0.9rem; }

/* ── Error Banner ── */
.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 12px;
}

/* ── Form ── */
.form-group { margin-bottom: 14px; }
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #374151;
}
.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.88rem;
  color: #111;
  background: #fff;
  box-sizing: border-box;
}
.form-textarea { resize: vertical; }
.required { color: #ef4444; }

/* ── Drawer ── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}
.drawer {
  width: 420px;
  max-width: 95vw;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0,0,0,0.12);
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
  padding: 18px 20px;
  border-bottom: 1px solid #e5e7eb;
}
.drawer-header h3 { font-size: 1rem; font-weight: 700; color: #111; margin: 0; }
.drawer-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}
.drawer-close:hover { background: #f3f4f6; }
.drawer-body { padding: 20px; overflow-y: auto; flex: 1; }
.drawer-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
}
.drawer-section { margin-bottom: 20px; }
.drawer-desc { font-size: 0.88rem; color: #555; line-height: 1.6; margin: 0; }
.drawer-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.dl { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
.dl:last-child { border-bottom: none; }
.dt { font-size: 0.8rem; color: #9ca3af; font-weight: 500; }
.dd { font-size: 0.88rem; color: #111; font-weight: 600; text-align: right; }
</style>