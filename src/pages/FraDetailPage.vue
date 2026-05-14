// FraDetailPage.vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fraController } from '../controllers/fraController'
//import { useAuth } from '../composables/useAuth' // useAuth
import type { FundRaisingActivity } from '../models/FundRaisingActivity'

const emit = defineEmits(['go-home', 'go-logout', 'go-search', 'go-edit'])

// Auth & Route

const route = useRoute()
const fraId = Number(route.params.id)
const userId = ref<number | null>(null)

// Data & State
const campaign   = ref<FundRaisingActivity | null>(null)
const loading    = ref(true)
const fetchError = ref('')

const activeTab    = ref('About')
const donateAmount = ref(50)
const message      = ref('')
const donating     = ref(false)
const copied       = ref(false)
const favoriteMessage = ref('')

// Owner status toggle
const updatingStatus = ref(false)
const statusError    = ref('')

const tabs = ['About', 'Updates', 'Donors']

/*
  Temporary static campaign data
  Will be replaced by the fetched campaign data once the controller is implemented.

const campaign = {
  id: 1,
  title: 'Clean Water for Rural Schools',
  organizer: 'Jane Doe',
  category: 'Education',
  status: 'active',
  endDate: '30 Jun 2026',
  goal: 10000,
  raised: 7400,
  description: 'Thousands of children in rural schools lack access to clean drinking water, leading to preventable illnesses and school absences. This campaign aims to install water filtration systems in 5 schools, benefiting over 2,000 students.',
  impact: [
    '5 schools to receive clean water filtration systems',
    'Over 2,000 students will benefit',
    'Expected to reduce waterborne illnesses by 60%',
    'Maintenance training provided to school staff',
  ],
  tiers: [25, 50, 100, 250],
  updates: [
    { date: 'Apr 28, 2026', text: 'We have reached 70% of our goal! Thank you to all our amazing donors. First installation begins next month.' },
    { date: 'Mar 15, 2026', text: 'Campaign launched! We are excited to start this journey with your support.' },
  ],
  donors: [
    { name: 'Michael T.', amount: 250, time: '2 mins ago' },
    { name: 'Sara L.', amount: 100, time: '1 hour ago' },
    { name: 'Anonymous', amount: 50, time: '3 hours ago' },
    { name: 'David K.', amount: 500, time: 'Yesterday' },
  ],
}

const pct = computed(() => Math.round((campaign.raised / campaign.goal) * 100))
const daysLeft = computed(() => 60)
*/

// Fetch campaign on mount
onMounted(async () => {
  try {
    const controller = new fraController()
    campaign.value = await controller.getFraById(fraId)
  } catch (err: any) {
    fetchError.value = err.message || 'Failed to load campaign.'
  } finally {
    loading.value = false
  }
})

// Computed
const pct      = computed(() => campaign.value
  ? Math.round((campaign.value.currentAmount / campaign.value.targetAmount) * 100)
  : 0
)
const isOwner  = computed(() =>
  !!campaign.value && !!userId.value && campaign.value.userId === userId.value
)
const isCompleted = computed(() =>
  campaign.value?.status?.toUpperCase() === 'COMPLETED'
)

// Favourites
const FAVORITES_KEY = 'fundrise-favorites'

const getSavedFavorites = () => {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]') }
  catch { return [] }
}

const favoriteList = ref(getSavedFavorites())

const saveFavorites = (list: any[]) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list))
}

const isFavorited = computed(() =>
  favoriteList.value.some((item: any) => item.fraId === fraId)
)

function toggleFavorite() {
  const exists = favoriteList.value.some((item: any) => item.fraId === fraId)
  const updated = exists
    ? favoriteList.value.filter((item: any) => item.fraId !== fraId)
    : [...favoriteList.value, campaign.value]

  saveFavorites(updated)
  favoriteList.value = updated
  favoriteMessage.value = exists ? 'Removed from favourites' : 'Saved to favourites'
  setTimeout(() => { favoriteMessage.value = '' }, 2200)
}

// Donate
async function handleDonate() {
  if (!donateAmount.value) return
  donating.value = true
  await new Promise(r => setTimeout(r, 1200))
  donating.value = false
}

// Share
function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// FR-2-08: Mark as Completed
async function handleMarkAsCompleted() {
  if (!campaign.value || isCompleted.value) return
  statusError.value    = ''
  updatingStatus.value = true

  try {
    const controller = new fraController()
    await controller.updateFraStatus(fraId, 'COMPLETED')
    campaign.value.status = 'COMPLETED'
  } catch (err: any) {
    statusError.value = err.message || 'Failed to update campaign status.'
  } finally {
    updatingStatus.value = false
  }
}

// FR-2-02: Go to edit
function handleEditFra() {
  emit('go-edit', fraId)
}
</script>

<template>
  <div class="detail-page">

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

    <div class="detail-container">

      <!-- Back link -->
      <a href="#" class="back-link" @click.prevent="emit('go-search')">← Back to Campaigns</a>

      <!-- ── Loading State ── -->
      <div v-if="loading" class="state-box">
        <span class="spinner"></span>
        <p>Loading campaign…</p>
      </div>

      <!-- ── Fetch Error State ── -->
      <div v-else-if="fetchError" class="error-banner">
        ⚠️ {{ fetchError }}
      </div>

      <!-- ── Campaign Content ── -->
      <template v-else-if="campaign">

        <!-- Hero Banner -->
        <div class="hero">
          <img
            src="https://placehold.co/1100x320/d8f3dc/2d6a4f?text=Campaign+Banner"
            alt="Campaign Banner"
            class="hero-img"
          />
          <div class="hero-overlay">
            <span :class="['status-badge', 'status-' + campaign.status?.toLowerCase()]">
              {{ campaign.status }}
            </span>
            <button
              class="favorite-btn"
              :class="{ saved: isFavorited }"
              type="button"
              @click="toggleFavorite"
            >
              <span class="favorite-icon">{{ isFavorited ? '♥' : '♡' }}</span>
              {{ isFavorited ? 'Saved' : 'Save' }}
            </button>
            <h1>{{ campaign.title }}</h1>
            <p class="hero-meta">
              By <strong>{{ campaign.name || campaign.createdBy }}</strong>
              · Ends —
            </p>
            <p v-if="favoriteMessage" class="favorite-message">{{ favoriteMessage }}</p>
          </div>
        </div>

        <!-- Owner Controls -->
        <div v-if="isOwner" class="owner-controls">
          <span class="owner-badge">👤 You own this campaign</span>

          <div class="owner-actions">
            <button class="btn btn-edit" @click="handleEditFra">
              ✏️ Edit Campaign
            </button>
            <button
              class="btn btn-complete"
              :disabled="isCompleted || updatingStatus"
              @click="handleMarkAsCompleted"
            >
              <span v-if="updatingStatus" class="spinner spinner-dark"></span>
              {{ isCompleted ? '✅ Completed' : updatingStatus ? 'Updating…' : '🏁 Mark as Completed' }}
            </button>
          </div>

          <p v-if="statusError" class="status-error">⚠️ {{ statusError }}</p>
        </div>

        <!-- Content Grid -->
        <div class="content-grid">

          <!-- Left: Tabs -->
          <div class="detail-left">
            <section class="dashboard-section">

              <div class="tabs">
                <button
                  v-for="tab in tabs"
                  :key="tab"
                  :class="['tab-btn', { active: activeTab === tab }]"
                  @click="activeTab = tab"
                >
                  {{ tab }}
                </button>
              </div>

              <!-- About -->
              <div v-if="activeTab === 'About'" class="tab-content">
                <h3>About This Campaign</h3>
                <p class="tab-text">{{ campaign.description }}</p>
              </div>

              <!-- Updates (static for now — extend when updates model exists) -->
              <div v-if="activeTab === 'Updates'" class="tab-content">
                <p class="empty-state">No updates yet.</p>
              </div>

              <!-- Donors (static for now — extend when donations model is fetched) -->
              <div v-if="activeTab === 'Donors'" class="tab-content">
                <p class="empty-state">No donor information available.</p>
              </div>

            </section>
          </div>

          <!-- Right: Donate + Share -->
          <div class="detail-right">

            <!-- Donate Card -->
            <section class="dashboard-section donate-card">
              <div class="progress-section">
                <p class="raised-amount">${{ campaign.currentAmount.toLocaleString() }}</p>
                <p class="goal-text">raised of ${{ campaign.targetAmount.toLocaleString() }} goal</p>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: Math.min(pct, 100) + '%' }"></div>
                </div>
                <div class="progress-stats">
                  <div class="pstat">
                    <span class="pstat-val">—</span>
                    <span class="pstat-lbl">donors</span>
                  </div>
                  <div class="pstat">
                    <span class="pstat-val">—</span>
                    <span class="pstat-lbl">days left</span>
                  </div>
                  <div class="pstat">
                    <span class="pstat-val">{{ pct }}%</span>
                    <span class="pstat-lbl">funded</span>
                  </div>
                </div>
              </div>

              <div class="divider"></div>

              <div class="donate-section">
                <h4>Make a Donation</h4>

                <div class="tier-options">
                  <button
                    v-for="t in [25, 50, 100, 250]"
                    :key="t"
                    :class="['tier-btn', { selected: donateAmount === t }]"
                    @click="donateAmount = t"
                  >
                    ${{ t }}
                  </button>
                </div>

                <div class="form-group">
                  <label>Custom Amount</label>
                  <div class="input-prefix-wrap">
                    <span class="input-prefix">$</span>
                    <input
                      v-model.number="donateAmount"
                      type="number"
                      min="1"
                      placeholder="Enter amount"
                      class="form-input prefix-input"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>Message <span class="optional">(optional)</span></label>
                  <textarea
                    v-model="message"
                    rows="2"
                    placeholder="Leave a message…"
                    class="form-textarea"
                  ></textarea>
                </div>

                <div class="form-actions">
                  <button
                    class="btn btn-create donate-btn"
                    @click="handleDonate"
                    :disabled="donating || !donateAmount"
                  >
                    <span v-if="donating" class="spinner"></span>
                    {{ donating ? 'Processing…' : `Donate $${donateAmount || '—'}` }}
                  </button>
                </div>

                <p class="secure-note">🔒 Secure payment · 100% goes to the cause</p>
              </div>
            </section>

            <!-- Share Card -->
            <section class="dashboard-section share-card">
              <h4>Share This Campaign</h4>
              <div class="share-buttons">
                <button class="btn share-btn">📕 Instagram</button>
                <button class="btn share-btn">📘 Facebook</button>
                <button class="btn share-btn" @click="copyLink">🔗 Copy Link</button>
              </div>
              <span v-if="copied" class="copied-msg">✅ Link copied!</span>
            </section>

          </div>
        </div>

      </template>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>

  </div>
</template>

<style scoped>
/* ── Layout ── */
.detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}
.detail-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 24px 48px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

/* ── Back Link ── */
.back-link {
  display: block;
  text-align: left;
  font-size: 0.88rem;
  color: #3b82f6;
  text-decoration: none;
  margin-bottom: 16px;
  font-weight: 500;
}
.back-link:hover { text-decoration: underline; }

/* ── Loading / Error States ── */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 80px 0;
  color: #6b7280;
  font-size: 0.9rem;
}
.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 8px;
  padding: 14px 18px;
  font-size: 0.88rem;
  font-weight: 500;
  margin-bottom: 20px;
}

/* ── Owner Controls ── */
.owner-controls {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.owner-badge {
  font-size: 0.82rem;
  font-weight: 600;
  color: #92400e;
}
.owner-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
  flex-wrap: wrap;
}
.btn-edit {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-edit:hover { background: #f0f4ff; border-color: #93c5fd; color: #1d4ed8; }

.btn-complete {
  background: #16a34a;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-complete:hover:not(:disabled) { background: #15803d; }
.btn-complete:disabled { opacity: 0.6; cursor: not-allowed; }

.status-error {
  width: 100%;
  font-size: 0.82rem;
  color: #b91c1c;
  margin: 6px 0 0;
}

/* ── Hero ── */
.hero {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 28px;
}
.hero-img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  display: block;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.65) 60%, transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  text-align: center;
  padding: 28px;
}
.hero-overlay .status-badge {
  position: absolute;
  bottom: 28px;
  left: 28px;
}
.hero-overlay h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin: 8px 0 6px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.hero-meta { font-size: 0.88rem; color: rgba(255,255,255,0.85); margin: 0; }

/* ── Status Badge ── */
.status-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 12px;
  border-radius: 99px;
  letter-spacing: 0.04em;
  width: fit-content;
}
.status-active    { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.status-completed { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.status-pending   { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.status-draft     { background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; }
.status-paused    { background: #fdf4ff; color: #7e22ce; border: 1px solid #e9d5ff; }
.status-cancelled { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.status-rejected  { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.status-pending_approval { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }

/* ── Content Grid ── */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}
@media (max-width: 800px) {
  .content-grid { grid-template-columns: 1fr; }
}

/* ── Section Card ── */
.dashboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* ── Empty State ── */
.empty-state {
  font-size: 0.88rem;
  color: #9ca3af;
  text-align: center;
  padding: 32px 0;
}

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}
.tab-btn {
  padding: 8px 18px;
  border: none;
  background: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
}
.tab-btn:hover { color: #3b82f6; }
.tab-btn.active { color: #3b82f6; border-bottom-color: #3b82f6; font-weight: 700; }

/* ── Tab Content ── */
.tab-content { text-align: left; }
.tab-content h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 10px;
}
.tab-text {
  font-size: 0.88rem;
  color: #555;
  line-height: 1.7;
  margin: 0 0 20px;
}

/* ── Donate Card ── */
.donate-card { margin-bottom: 16px; }
.progress-section { margin-bottom: 16px; }
.raised-amount { font-size: 1.8rem; font-weight: 700; color: #111; margin: 0 0 2px; }
.goal-text { font-size: 0.82rem; color: #6b7280; margin: 0 0 10px; }
.progress-bar {
  background: #e5e7eb;
  border-radius: 99px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}
.progress-fill {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s;
}
.progress-stats { display: flex; justify-content: space-between; }
.pstat { display: flex; flex-direction: column; align-items: center; }
.pstat-val { font-size: 1rem; font-weight: 700; color: #111; }
.pstat-lbl { font-size: 0.72rem; color: #9ca3af; }

.divider { height: 1px; background: #e5e7eb; margin: 16px 0; }

.donate-section h4 { font-size: 1rem; font-weight: 700; color: #111; margin: 0 0 14px; }

/* ── Tier Buttons ── */
.tier-options { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.tier-btn {
  flex: 1;
  min-width: 52px;
  padding: 8px 4px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  font-size: 0.88rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}
.tier-btn:hover { border-color: #3b82f6; color: #3b82f6; }
.tier-btn.selected { background: #3b82f6; border-color: #3b82f6; color: #fff; }

/* ── Form ── */
.form-group { margin-bottom: 14px; }
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #374151;
}
.form-input, .form-textarea {
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
.input-prefix-wrap {
  display: flex;
  align-items: stretch;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}
.input-prefix {
  padding: 0 12px;
  background: #f3f4f6;
  color: #555;
  font-weight: 600;
  font-size: 0.9rem;
  border-right: 1px solid #ddd;
  display: flex;
  align-items: center;
}
.prefix-input { border: none !important; border-radius: 0 !important; flex: 1; margin: 0 !important; }
.optional { font-size: 0.75rem; color: #9ca3af; font-weight: 400; }

.form-actions { margin-top: 14px; }
.donate-btn { width: 100%; justify-content: center; font-size: 1rem; }
.secure-note { text-align: center; font-size: 0.75rem; color: #9ca3af; margin: 10px 0 0; }

/* ── Share Card ── */
.share-card h4 { font-size: 0.95rem; font-weight: 700; color: #111; margin: 0 0 14px; }
.share-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
.share-btn {
  flex: 1;
  font-size: 0.8rem;
  padding: 8px 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
}
.share-btn:hover { background: #f0f4ff; border-color: #c7d2fe; }
.copied-msg { display: block; margin-top: 10px; font-size: 0.82rem; color: #16a34a; font-weight: 600; }

/* ── Buttons ── */
.btn { border: none; cursor: pointer; }
.btn-create {
  background: #3b82f6;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}
.btn-create:hover:not(:disabled) { background: #2563eb; }
.btn-create:disabled { opacity: 0.55; cursor: not-allowed; }

/* ── Spinner ── */
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}
.spinner-dark {
  border-color: rgba(0,0,0,0.15);
  border-top-color: #374151;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Favourite Button ── */
.favorite-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 999px;
  background: rgba(255,255,255,0.18);
  color: #fff;
  backdrop-filter: blur(10px);
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 700;
  transition: transform 0.15s, background 0.15s;
}
.favorite-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.26); }
.favorite-btn.saved { background: rgba(220,38,38,0.92); border-color: rgba(220,38,38,0.92); }
.favorite-icon { font-size: 1rem; }
.favorite-message { color: #d1fae5; margin-top: 10px; font-size: 0.88rem; }

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
.footer {
  text-align: center;
  padding: 24px;
  font-size: 0.8rem;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}
</style>