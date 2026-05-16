<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
const { isLoggedIn, userId, userRole, sessionReady, signOut } = useAuth()
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'
// import categoryController
import { create, type CategoryData } from '../controllers/categoryController'

const router = useRouter()
const emit = defineEmits(['go-home', 'go-logout', 'go-search', 'go-login', 'go-signup'])

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

const activeTab = ref('Pending')
const searchQuery = ref('')
const filterCategory = ref('')

const tabs = ['Pending', 'Active', 'Rejected', 'Flagged', 'All']
const categories = ['Education', 'Healthcare', 'Environment', 'Disaster Relief', 'Community']


type CampaignStatus = 'pending' | 'active' | 'rejected' | 'flagged'

type Campaign = {
  id: number
  title: string
  organizer: string
  category: string
  goal: number
  status: CampaignStatus
  submitted: string
  description: string
  image: string
  flags: string[]
}

const selectedCampaign = ref<Campaign | null>(null)

const campaigns = ref<Campaign[]>([
  { id: 1, title: 'Solar Panels for Remote Villages', organizer: 'EcoFund SG', category: 'Environment', goal: 25000, status: 'pending', submitted: '2 days ago', description: 'Installing solar panels in 10 off-grid villages to provide clean electricity to 500+ families.', image: 'https://placehold.co/80x60/d8f3dc/2d6a4f?text=Solar', flags: [] },
  { id: 2, title: 'Free Coding Bootcamp for Youth', organizer: 'TechBridge', category: 'Education', goal: 12000, status: 'pending', submitted: '1 day ago', description: 'A 3-month intensive coding program for underprivileged youth aged 16-24.', image: 'https://placehold.co/80x60/ebf8ff/2b6cb0?text=Code', flags: [] },
  { id: 3, title: 'Flood Relief Nairobi', organizer: 'GlobalAid', category: 'Disaster Relief', goal: 50000, status: 'pending', submitted: '5 hours ago', description: 'Emergency shelter and food for 1,200 families displaced by severe flooding.', image: 'https://placehold.co/80x60/fffbeb/b7791f?text=Relief', flags: ['Unverified organizer'] },
  { id: 4, title: 'Clean Water Initiative', organizer: 'Jane Doe', category: 'Education', goal: 10000, status: 'active', submitted: '2 weeks ago', description: 'Installing water filtration in 5 rural schools to benefit over 2,000 students.', image: 'https://placehold.co/80x60/d8f3dc/2d6a4f?text=Water', flags: [] },
  { id: 5, title: 'Suspicious Fundraiser XYZ', organizer: 'Unknown', category: 'Community', goal: 99999, status: 'flagged', submitted: '3 days ago', description: 'Vague description with no verifiable information about fund usage.', image: 'https://placehold.co/80x60/fff5f5/c53030?text=Flag', flags: ['Duplicate campaign', 'No beneficiary info'] },
  { id: 6, title: 'Pet Shelter Renovation', organizer: 'PawsCare', category: 'Community', goal: 8000, status: 'rejected', submitted: '1 week ago', description: 'Renovating our animal shelter to accommodate 50 more rescued pets.', image: 'https://placehold.co/80x60/fefcbf/b7791f?text=Pets', flags: [] },
])
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





function openDetail(c: Campaign)  { selectedCampaign.value = c }
function approve(c: Campaign)     { c.status = 'active' }
function reject(c: Campaign)      { c.status = 'rejected' }
function flag(c: Campaign)        { c.status = 'flagged' }
function suspend(c: Campaign)     { c.status = 'rejected' }


// DEV PM-7-01
// function enterCategoryTitle(title: string) {
//   console.log('Hello')
// }

// function entercategorydescription(description: string) {
//   console.log("Description")
// }

const showForm = ref(false)

const newCategory = ref({
  categoryname: '',
  categorydescription: ''
})

const errorMessage = ref('')

function openForm() {
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function submitCategory() {
  const categoryData: CategoryData = {
    categoryname: newCategory.value.categoryname.trim(),
    categorydescription: newCategory.value.categorydescription.trim()
  }

  await handleCreateCategory(categoryData)
}

const notificationMessage = ref('')
const showNotification = ref(false)

async function handleCreateCategory(categoryData: CategoryData) {
  console.log('Category Data:', categoryData)

  try {
    const result = await create(
      categoryData.categoryname,
      categoryData.categorydescription
    )

    console.log('Created category:', result)

    displayCategoryMessage('Category created successfully')

    newCategory.value.categoryname = ''
    newCategory.value.categorydescription = ''
    errorMessage.value = ''
    closeForm()
  } catch (error) {
    console.error(error)

    if (error instanceof Error) {
      errorMessage.value = error.message
      displayCategoryMessage(error.message)
    } else {
      errorMessage.value = 'Failed to create category'
      displayCategoryMessage('Failed to create category')
    }
  }
}

function displayCategoryMessage(message: string) {
  notificationMessage.value = message
  showNotification.value = true

  setTimeout(() => {
    showNotification.value = false
    notificationMessage.value = ''
  }, 3000)
}


// DEV END PM-7-01

// PM-1-07
const searchType = ref('campaign');
const doneeRegistrations = ref([
  { donee_reg_id: 1, userid: 101, status: 'PENDING', submittedat: '2026-05-01' },
  { donee_reg_id: 2, userid: 105, status: 'PENDING', submittedat: '2026-05-02 ' }
]);
const doneeProfiles = ref([
  { 
    userid: 101, 
    org_name: 'Hope Kitchen', 
    bio: 'Local community kitchen providing meals for the elderly.', 
    bankaccount: 'SG00-000-001' 
  },
  { 
    userid: 105, 
    org_name: 'EduYouth', 
    bio: 'Educational outreach program for underprivileged youth.', 
    bankaccount: 'SG88-111-222' 
  }
]);

const selectedProfile = ref(null); // To store which profile is being viewed in a modal/drawer

const viewProfile = (reg: any) => {
  const profile = doneeProfiles.value.find(p => p.userid === reg.userid);
  if (profile) {
    selectedProfile.value = profile;
    alert(`View Profile for: ${profile.org_name}\nBio: ${profile.bio}`);
  }
};

const handleSearch = () => {
  if (searchType.value === 'donee') {
    console.log("System filtering Donee results..."); // Step 4
  }
};

const approveDonee = (reg: any) => {
  reg.status = 'ACTIVE';
  reg.reviewedat = new Date().toISOString();
  alert(`Registration ${reg.donee_reg_id} approved.`);
};

const rejectDonee = (reg: any) => {
  const reason = prompt("Enter rejection reason:"); // Alternative Flow 6a
  if (reason) {
    reg.status = 'REJECTED';
    reg.notes = reason;
    reg.reviewedat = new Date().toISOString();
    alert(`Registration ${reg.donee_reg_id} rejected.`);
  }
};

const filteredDonees = computed(() => {
  return doneeRegistrations.value.filter(reg => {
    const profile = doneeProfiles.value.find(p => p.userid === reg.userid);
    
    const bioText = profile ? profile.bio.toLowerCase() : '';
    const query = searchQuery.value.toLowerCase();

    return bioText.includes(query) || reg.donee_reg_id.toString().includes(query);
  });
});
</script>

<template>
  <div class="pm-page">

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
        <RouterLink to="/" class="nav-link" @click="emit('go-home')">Home</RouterLink>
        <span class="user-info">Platform Manager</span>
        <RouterLink to="/" class="nav-link logout-link" @click="emit('go-logout')">
          <span class="logout-icon">⇢</span> Logout
        </RouterLink>
      </nav>
    </header>

    <div class="pm-container">

      <!-- Page Title -->
      <div class="dashboard-header">
        <div>
          <h1>Platform Management</h1>
          <p>{{ searchType === 'donee' 
                ? 'Review and approve donee registrations' 
                : 'Review and approve fundraising campaigns' }}
          </p>
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

      <section class="dashboard-section category-management">
        <div class="section-title-row">
          <div>
            <h2>Category Management</h2>
            <p>Create categories used by campaign search and campaign setup.</p>
          </div>
          <button class="toolbar-btn" @click="openForm">New Category</button>
        </div>

        <div class="category-grid">
          <div v-for="c in categories" :key="c" class="category-card">
            <span class="category-name">{{ c }}</span>
            <span class="category-meta">Active category</span>
          </div>
        </div>

        <p v-if="showNotification" class="notification-message">
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
          <button class="toolbar-btn" @click="openForm">
            New Category
          </button>
          
          <!-- Dropdown to sort between campaigns and donees -->
          <select v-model="searchType" class="form-select toolbar-select">
            <option value="campaign">Campaigns</option>
            <option value="donee">Donee Registrations</option>
          </select>

          <!-- DEV PM-7-01 -->
          <div class="search-pill">
            <span class="search-icon">⌕</span>
            <input v-model="searchQuery" type="text" :placeholder="searchType === 'donee' ? 'Search registrations...' : 'Search campaigns...'" />
          </div>

          <select v-if="searchType === 'campaign'" v-model="filterCategory" class="form-select toolbar-select">
            <option value="">All Categories</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <!-- Campaign List -->
        <div class="campaign-list">

  
          <template v-if="searchType === 'donee'">
            <div v-if="filteredDonees.length === 0" class="empty-state">
              <div class="empty-icon">👥</div>
              <p>No pending donee registrations found.</p>
            </div>

            <div v-for="reg in filteredDonees" :key="reg.donee_reg_id" class="campaign-row">
              <div class="campaign-left">
                <div class="campaign-thumb">👤</div>
                <div class="campaign-info">
                  <p class="campaign-title">
                    Registration #{{ reg.donee_reg_id }} (User ID: {{ reg.userid }})
                  </p>
                  <div class="campaign-meta">
                    Bank: {{ doneeProfiles.find(p => p.userid === reg.userid)?.bankaccount || 'N/A' }}
                    <span class="dot">·</span>
                    <span>Submitted: {{ reg.submittedat }}</span>
                  </div>
                  <p class="campaign-desc">{{ reg.any }}</p>
                </div>
              </div>

              <div class="campaign-right">
                <span class="status-badge status-pending">{{ reg.status }}</span>
                <div class="action-buttons" v-if="reg.status === 'PENDING'">
                  <button class="btn btn-detail" @click="viewProfile(reg)">View Profile</button>
                  <button class="btn btn-approve" @click="approveDonee(reg)">✓ Approve</button>
                  <button class="btn btn-reject" @click="rejectDonee(reg)">✕ Reject</button>
                </div>
              </div>
            </div>
          </template>

        
          <template v-else>
            <div v-if="filteredCampaigns.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>No campaigns in this category.</p>
            </div>

            <div
              v-for="c in filteredCampaigns"
              :key="c.id"
              class="campaign-row"
            >
             <!-- Left: image + info -->
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

              <!-- Right: status + actions -->
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
.logo { color: #ef4444; font-size: 1.2rem; }
.nav { display: flex; align-items: center; gap: 16px; }
.nav-actions { display: flex; align-items: center; gap: 16px; margin-left: auto; }
.nav-link { font-size: 0.88rem; color: #555; text-decoration: none; font-weight: 500; }
.nav-link:hover { color: #111; }
.user-info { font-size: 0.82rem; color: #6b7280; }
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

/* ── Shared Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 8px 14px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.85rem;
}
.form-select {
  padding: 9px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.88rem;
  color: #111;
  background: #fff;
}

/* --- Modal Overlay --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-box {
  width: 420px;
  background: white;
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-box h2 {
  margin-bottom: 16px;
}

.modal-input,
.modal-textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
}

.modal-textarea {
  min-height: 100px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: #e5e7eb;
  cursor: pointer;
}

.submit-btn {
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}


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
  padding: 40px 24px;
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
}

.dashboard-header p {
  color: #666;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.hstat {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 10px;
  padding: 12px 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  min-width: 90px;
}

.hstat-val {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
}

.hstat-orange { color: #ea580c; }
.hstat-red    { color: #dc2626; }

.hstat-lbl {
  font-size: 0.75rem;
  color: #888;
  margin-top: 4px;
  text-align: center;
}

/* ── Section ── */
.dashboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 24px;
}

.section-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-title-row h2 {
  margin: 0 0 4px;
  color: #111827;
  font-size: 1.05rem;
}

.section-title-row p {
  margin: 0;
  color: #6b7280;
  font-size: 0.88rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.category-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-name {
  color: #111827;
  font-weight: 700;
}

.category-meta {
  color: #6b7280;
  font-size: 0.78rem;
}

.notification-message {
  margin: 14px 0 0;
  color: #15803d;
  font-size: 0.88rem;
}

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  font-size: 0.88rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-btn:hover {
  background: #f0f4ff;
  border-color: #c7d2fe;
  color: #3730a3;
}

.tab-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.tab-count {
  background: rgba(0,0,0,0.12);
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 7px;
}

.tab-btn.active .tab-count {
  background: rgba(255,255,255,0.25);
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 14px;
}

.search-pill input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  padding: 10px 0;
  font-size: 0.9rem;
  color: #111;
}

.toolbar-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 999px;
  background: #111827;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.search-icon {
  color: #9ca3af;
  font-size: 1rem;
}

.toolbar-select {
  width: auto;
  min-width: 160px;
  padding: 8px 12px;
}

/* ── Campaign List ── */
.campaign-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.campaign-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fafafa;
  transition: background 0.15s;
  flex-wrap: wrap;
}

.campaign-row:hover {
  background: #f0f5ff;
  border-color: #c7d2fe;
}

.campaign-left {
  display: flex;
  gap: 14px;
  flex: 1;
  min-width: 0;
  text-align: left;
}

.campaign-thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.campaign-info {
  flex: 1;
  min-width: 0;
}

.campaign-title {
  font-weight: 700;
  color: #111;
  margin: 0 0 4px;
  font-size: 0.95rem;
  text-align: left;
}

.campaign-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 0.78rem;
  color: #6b7280;
  margin-bottom: 6px;
  text-align: left;
}

.dot {
  color: #d1d5db;
}

.campaign-desc {
  font-size: 0.82rem;
  color: #555;
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.campaign-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.flag-chip {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 99px;
}

/* ── Campaign Right ── */
.campaign-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

/* ── Status Badge ── */
.status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 12px;
  border-radius: 99px;
  letter-spacing: 0.04em;
}

.status-pending  { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.status-active   { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.status-rejected { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.status-flagged  { background: #fefce8; color: #a16207; border: 1px solid #fde68a; }

/* ── Action Buttons ── */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.btn-detail  { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
.btn-approve { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.btn-reject  { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.btn-flag    { background: #fefce8; color: #a16207; border: 1px solid #fde68a; }

.btn-detail:hover  { background: #e5e7eb; }
.btn-approve:hover { background: #dcfce7; }
.btn-reject:hover  { background: #fee2e2; }
.btn-flag:hover    { background: #fef9c3; }

/* ── Empty State ── */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

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
  width: 420px;
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
  flex: 1;
  padding-right: 12px;
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

.drawer-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 10px;
}

.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
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

.drawer-desc h4,
.drawer-flags h4 {
  font-size: 0.88rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 8px;
}

.drawer-desc p {
  font-size: 0.85rem;
  color: #555;
  margin: 0;
  line-height: 1.6;
}

.drawer-actions {
  display: flex;
  gap: 10px;
  padding-top: 8px;
}

.drawer-actions .btn {
  flex: 1;
  justify-content: center;
  padding: 10px;
}
</style>
