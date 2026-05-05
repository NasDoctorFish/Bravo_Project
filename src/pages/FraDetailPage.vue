<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['go-home', 'go-logout', 'go-search'])

const activeTab = ref('About')
const donateAmount = ref(50)
const message = ref('')
const donating = ref(false)
const copied = ref(false)

const tabs = ['About', 'Updates', 'Donors']

const campaign = {
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

async function handleDonate() {
  if (!donateAmount.value) return
  donating.value = true
  await new Promise(r => setTimeout(r, 1200))
  donating.value = false
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
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

      <!-- Hero Banner -->
      <div class="hero">
        <img
          src="https://placehold.co/1100x320/d8f3dc/2d6a4f?text=Campaign+Banner"
          alt="Campaign Banner"
          class="hero-img"
        />
        <div class="hero-overlay">
          <span :class="['status-badge', 'status-' + campaign.status]">{{ campaign.status }}</span>
          <h1>{{ campaign.title }}</h1>
          <p class="hero-meta">
            By <strong>{{ campaign.organizer }}</strong>
            · {{ campaign.category }}
            · Ends {{ campaign.endDate }}
          </p>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">

        <!-- Left: Tabs -->
        <div class="detail-left">
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
              </button>
            </div>

            <!-- About -->
            <div v-if="activeTab === 'About'" class="tab-content">
              <h3>About This Campaign</h3>
              <p class="tab-text">{{ campaign.description }}</p>

              <h3>Impact</h3>
              <ul class="impact-list">
                <li v-for="item in campaign.impact" :key="item">✅ {{ item }}</li>
              </ul>
            </div>

            <!-- Updates -->
            <div v-if="activeTab === 'Updates'" class="tab-content">
              <div v-for="u in campaign.updates" :key="u.date" class="update-item">
                <p class="update-date">{{ u.date }}</p>
                <p class="update-text">{{ u.text }}</p>
              </div>
            </div>

            <!-- Donors -->
            <div v-if="activeTab === 'Donors'" class="tab-content">
              <div v-for="d in campaign.donors" :key="d.name" class="donor-item">
                <div class="donor-avatar">{{ d.name[0] }}</div>
                <div class="donor-info">
                  <span class="donor-name">{{ d.name }}</span>
                  <span class="donor-time">{{ d.time }}</span>
                </div>
                <span class="donor-amount">${{ d.amount }}</span>
              </div>
            </div>

          </section>
        </div>

        <!-- Right: Donate + Share -->
        <div class="detail-right">

          <!-- Donate Card -->
          <section class="dashboard-section donate-card">
            <div class="progress-section">
              <p class="raised-amount">${{ campaign.raised.toLocaleString() }}</p>
              <p class="goal-text">raised of ${{ campaign.goal.toLocaleString() }} goal</p>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: pct + '%' }"></div>
              </div>
              <div class="progress-stats">
                <div class="pstat">
                  <span class="pstat-val">{{ campaign.donors.length }}</span>
                  <span class="pstat-lbl">donors</span>
                </div>
                <div class="pstat">
                  <span class="pstat-val">{{ daysLeft }}</span>
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
                  v-for="t in campaign.tiers"
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

.hero-meta {
  font-size: 0.88rem;
  color: rgba(255,255,255,0.85);
  margin: 0;
}

/* ── Status Badge (on hero) ── */
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

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0;
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

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  font-weight: 700;
}

/* ── Tab Content ── */
.tab-content {
  text-align: left;
}

.tab-content h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 10px;
}

.tab-content h3 + h3 {
  margin-top: 20px;
}

.tab-text {
  font-size: 0.88rem;
  color: #555;
  line-height: 1.7;
  margin: 0 0 20px;
}

.impact-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.impact-list li {
  font-size: 0.88rem;
  color: #374151;
}

/* ── Updates ── */
.update-item {
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.update-item:last-child { border-bottom: none; }

.update-date {
  font-size: 0.75rem;
  font-weight: 700;
  color: #9ca3af;
  margin-bottom: 4px;
}

.update-text {
  font-size: 0.88rem;
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

/* ── Donors ── */
.donor-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.donor-item:last-child { border-bottom: none; }

.donor-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.donor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.donor-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #111;
}

.donor-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.donor-amount {
  font-size: 0.9rem;
  font-weight: 700;
  color: #16a34a;
}

/* ── Donate Card ── */
.donate-card { margin-bottom: 16px; }

.progress-section { margin-bottom: 16px; }

.raised-amount {
  font-size: 1.8rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 2px;
}

.goal-text {
  font-size: 0.82rem;
  color: #6b7280;
  margin: 0 0 10px;
}

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

.progress-stats {
  display: flex;
  justify-content: space-between;
}

.pstat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pstat-val {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
}

.pstat-lbl {
  font-size: 0.72rem;
  color: #9ca3af;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 16px 0;
}

.donate-section h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 14px;
}

/* ── Tier Buttons ── */
.tier-options {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

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

.tier-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.tier-btn.selected {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

/* ── Prefix Input ── */
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
  min-height: 100%;
}

.prefix-input {
  border: none !important;
  border-radius: 0 !important;
  flex: 1;
  margin: 0 !important;
}

.optional {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 400;
}

.donate-btn {
  width: 100%;
  justify-content: center;
  font-size: 1rem;
}

.secure-note {
  text-align: center;
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 10px 0 0;
}

/* ── Share Card ── */
.share-card h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 14px;
}

.share-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

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

.copied-msg {
  display: block;
  margin-top: 10px;
  font-size: 0.82rem;
  color: #16a34a;
  font-weight: 600;
}

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

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>