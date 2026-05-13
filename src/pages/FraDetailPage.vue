//  BOUNDARY — FraDetailPage
<script setup>

import { ref, onMounted } from 'vue'
import { useFraDetailController } from './FraDetailController.js'

const props = defineProps({
  fraId: { type: String, default: '1' },   //fraId: String
})

const emit = defineEmits(['go-home', 'go-logout', 'go-search'])

const {
  campaign,
  donations,
  error,
  isLoading,
  hasError,

  donateAmount,
  donateMessage,
  isDonating,
  donateSuccess,
  donateError,

  isFavorited,
  favoriteMessage,
  daysLeft,
  donorCount,

  getCampaignDetail,
  getDonations,
  submitDonation,
  toggleFavorite,
} = useFraDetailController()

const activeTab = ref('About')
const copied    = ref(false)
const tabs      = ['About', 'Updates', 'Donors']

onMounted(async () => {
  await getCampaignDetail(props.fraId)   // displayCampaignDetail()
  await getDonations(props.fraId)        // displayDonations()
})

function handleDonate() {
  submitDonation('currentUser')  
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="detail-page">

    <!-- ── Header ── -->
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

      <a href="#" class="back-link" @click.prevent="emit('go-search')">← Back to Campaigns</a>

      <!-- displayError(msg) -->
      <div v-if="hasError" class="error-banner">⚠ {{ error }}</div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">Loading campaign…</div>

      <!-- displayCampaignDetail() -->
      <template v-else-if="campaign">

        <!-- Hero Banner -->
        <div class="hero">
          <img
            :src="campaign.image || 'https://placehold.co/1100x320/d8f3dc/2d6a4f?text=Campaign+Banner'"
            alt="Campaign Banner"
            class="hero-img"
          />
          <div class="hero-overlay">
            <span :class="['status-badge', 'status-' + campaign.status]">
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
              By <strong>{{ campaign.createdBy }}</strong>
              · {{ campaign.categoryId }}
              · Ends {{ campaign.endDate ?? 'TBD' }}
            </p>
            <p v-if="favoriteMessage" class="favorite-message">{{ favoriteMessage }}</p>
          </div>
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
                >{{ tab }}</button>
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

              <!-- Donors tab ── -->
              <div v-if="activeTab === 'Donors'" class="tab-content">
                <div v-if="donations.length === 0" class="empty-donors">
                  No donations yet — be the first!
                </div>

                <div v-for="d in donations" :key="d.donationId" class="donor-item">
                  <div class="donor-avatar">{{ d.avatarInitial }}</div>
                  <div class="donor-info">
                    <span class="donor-name">{{ d.displayName }}</span>
                    <span class="donor-time">{{ d.timeAgo }}</span>
                  </div>
                  <span class="donor-amount">${{ d.amount }}</span>
                </div>
              </div>

            </section>
          </div>

          <!-- Donate + Share -->
          <div class="detail-right">

            <!-- Donate Card -->
            <section class="dashboard-section donate-card">

              <!-- progress stats -->
              <div class="progress-section">
                <p class="raised-amount">${{ campaign.currentAmount.toLocaleString() }}</p>
                <p class="goal-text">raised of ${{ campaign.targetAmount.toLocaleString() }} goal</p>

                <!-- progressPercent -->
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: campaign.progressPercent + '%' }"></div>
                </div>

                <div class="progress-stats">
                  <div class="pstat">
                    <span class="pstat-val">{{ donorCount }}</span>
                    <span class="pstat-lbl">donors</span>
                  </div>
                  <div class="pstat">
                    <!-- daysLeft from endDate -->
                    <span class="pstat-val">{{ daysLeft }}</span>
                    <span class="pstat-lbl">days left</span>
                  </div>
                  <div class="pstat">
                    <span class="pstat-val">{{ campaign.progressPercent }}%</span>
                    <span class="pstat-lbl">funded</span>
                  </div>
                </div>
              </div>

              <div class="divider"></div>

              <!-- Donate Form -->
              <div class="donate-section">
                <h4>Make a Donation</h4>

                <!-- Donation error -->
                <div v-if="donateError" class="donate-error">⚠ {{ donateError }}</div>
                <div v-if="donateSuccess" class="donate-success">✅ Thank you for your donation!</div>

                <div class="tier-options">
                  <button
                    v-for="t in (campaign.tiers ?? [25, 50, 100, 250])"
                    :key="t"
                    :class="['tier-btn', { selected: donateAmount === t }]"
                    @click="donateAmount = t"
                  >${{ t }}</button>
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
                    v-model="donateMessage"
                    rows="2"
                    placeholder="Leave a message…"
                    class="form-textarea"
                  ></textarea>
                </div>

                <div class="form-actions">

                  <button
                    class="btn btn-create donate-btn"
                    @click="handleDonate"
                    :disabled="isDonating || !donateAmount"
                  >
                    <span v-if="isDonating" class="spinner"></span>
                    {{ isDonating ? 'Processing…' : `Donate $${donateAmount || '—'}` }}
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
/* Layout */
.detail-page { min-height: 100vh; display: flex; flex-direction: column; background: #f5f5f5; }
.detail-container { max-width: 1100px; margin: 0 auto; padding: 24px 24px 48px; flex: 1; width: 100%; box-sizing: border-box; }

/* States */
.error-banner  { background: #fff5f5; border: 1px solid #fecaca; color: #b91c1c; border-radius: 8px; padding: 10px 16px; font-size: 0.88rem; margin-bottom: 16px; }
.donate-error  { background: #fff5f5; border: 1px solid #fecaca; color: #b91c1c; border-radius: 6px; padding: 8px 12px; font-size: 0.82rem; margin-bottom: 12px; }
.donate-success{ background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; border-radius: 6px; padding: 8px 12px; font-size: 0.82rem; margin-bottom: 12px; }
.loading-state { padding: 60px; text-align: center; color: #6b7280; font-size: 0.9rem; }
.empty-donors  { color: #9ca3af; font-size: 0.88rem; text-align: center; padding: 24px 0; }

/* Back Link */
.back-link { display: block; font-size: 0.88rem; color: #3b82f6; text-decoration: none; margin-bottom: 16px; font-weight: 500; }
.back-link:hover { text-decoration: underline; }

/* Hero */
.hero { position: relative; border-radius: 14px; overflow: hidden; margin-bottom: 28px; }
.hero-img { width: 100%; height: 320px; object-fit: cover; display: block; }
.hero-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
  padding: 32px 28px 24px;
  color: #fff;
}
.hero-overlay h1 { font-size: 1.8rem; font-weight: 800; margin: 0 0 8px; line-height: 1.2; }
.hero-meta { font-size: 0.88rem; opacity: 0.9; margin: 0; }

/* Status Badge */
.status-badge { position: absolute; top: 20px; left: 24px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 99px; letter-spacing: 0.04em; }
.status-active    { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.status-completed { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.status-pending   { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }

/* Content Grid */
.content-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
@media (max-width: 800px) { .content-grid { grid-template-columns: 1fr; } }

/* Sections */
.dashboard-section { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

/* Tabs */
.tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 0; }
.tab-btn {
  padding: 8px 18px; border: none; background: none; font-size: 0.9rem;
  font-weight: 600; color: #9ca3af; cursor: pointer; border-bottom: 2px solid transparent;
  transition: all 0.15s; margin-bottom: -1px;
}
.tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }
.tab-content h3 { font-size: 1rem; font-weight: 700; color: #111; margin: 0 0 10px; }

/* About tab */
.tab-text { font-size: 0.88rem; color: #555; line-height: 1.7; margin: 0 0 20px; }
.impact-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.impact-list li { font-size: 0.88rem; color: #374151; }

/* Updates tab */
.update-item { padding: 14px 0; border-bottom: 1px solid #f0f0f0; }
.update-item:last-child { border-bottom: none; }
.update-date { font-size: 0.75rem; font-weight: 700; color: #9ca3af; margin-bottom: 4px; }
.update-text { font-size: 0.88rem; color: #374151; line-height: 1.6; margin: 0; }

/* Donors tab */
.donor-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.donor-item:last-child { border-bottom: none; }
.donor-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
.donor-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.donor-name { font-size: 0.88rem; font-weight: 600; color: #111; }
.donor-time { font-size: 0.75rem; color: #9ca3af; }
.donor-amount { font-size: 0.9rem; font-weight: 700; color: #16a34a; }

/* Donate Card */
.donate-card { margin-bottom: 16px; }
.progress-section { margin-bottom: 16px; }
.raised-amount { font-size: 1.8rem; font-weight: 700; color: #111; margin: 0 0 2px; }
.goal-text { font-size: 0.82rem; color: #6b7280; margin: 0 0 10px; }
.progress-bar { background: #e5e7eb; border-radius: 99px; height: 8px; overflow: hidden; margin-bottom: 12px; }
.progress-fill { background: linear-gradient(90deg, #3b82f6, #2563eb); height: 100%; border-radius: 99px; transition: width 0.4s; }
.progress-stats { display: flex; justify-content: space-between; }
.pstat { display: flex; flex-direction: column; align-items: center; }
.pstat-val { font-size: 1rem; font-weight: 700; color: #111; }
.pstat-lbl { font-size: 0.72rem; color: #9ca3af; }
.divider { height: 1px; background: #e5e7eb; margin: 16px 0; }
.donate-section h4 { font-size: 1rem; font-weight: 700; color: #111; margin: 0 0 14px; }

/* Tier Buttons */
.tier-options { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.tier-btn { flex: 1; min-width: 52px; padding: 8px 4px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; font-size: 0.88rem; font-weight: 600; color: #374151; cursor: pointer; transition: all 0.15s; }
.tier-btn:hover { border-color: #3b82f6; color: #3b82f6; }
.tier-btn.selected { background: #3b82f6; border-color: #3b82f6; color: #fff; }

/* Form Controls */
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #374151; }
.input-prefix-wrap { display: flex; align-items: stretch; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
.input-prefix { padding: 0 12px; background: #f3f4f6; color: #555; font-weight: 600; font-size: 0.9rem; border-right: 1px solid #ddd; display: flex; align-items: center; }
.form-input, .prefix-input { border: 1px solid #e5e7eb; border-radius: 8px; padding: 9px 12px; font-size: 0.88rem; color: #111; width: 100%; box-sizing: border-box; outline: none; }
.prefix-input { border: none !important; border-radius: 0 !important; flex: 1; margin: 0 !important; }
.form-textarea { border: 1px solid #e5e7eb; border-radius: 8px; padding: 9px 12px; font-size: 0.88rem; color: #111; resize: vertical; font-family: inherit; outline: none; }
.optional { font-size: 0.75rem; color: #9ca3af; font-weight: 400; }

/* Buttons */
.btn { padding: 9px 20px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; border: none; }
.btn-create { background: #2563eb; color: #fff; display: flex; align-items: center; gap: 6px; }
.btn-create:hover:not(:disabled) { background: #1d4ed8; }
.btn-create:disabled { opacity: 0.6; cursor: not-allowed; }
.form-actions { margin-bottom: 8px; }
.donate-btn { width: 100%; justify-content: center; font-size: 1rem; }
.secure-note { text-align: center; font-size: 0.75rem; color: #9ca3af; margin: 10px 0 0; }

/* Share Card */
.share-card h4 { font-size: 0.95rem; font-weight: 700; color: #111; margin: 0 0 14px; }
.share-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
.share-btn { flex: 1; font-size: 0.8rem; padding: 8px 10px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; color: #374151; cursor: pointer; transition: background 0.15s; }
.share-btn:hover { background: #f0f4ff; border-color: #c7d2fe; }
.copied-msg { display: block; margin-top: 10px; font-size: 0.82rem; color: #16a34a; font-weight: 600; }

/* Spinner */
.spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 6px; vertical-align: middle; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Favorite Button */
.favorite-btn { position: absolute; top: 24px; right: 24px; display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.9); border-radius: 999px; background: rgba(255,255,255,0.18); color: #fff; backdrop-filter: blur(10px); cursor: pointer; font-size: 0.92rem; font-weight: 700; transition: transform 0.15s, background 0.15s; }
.favorite-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.26); }
.favorite-btn.saved { background: rgba(220,38,38,0.92); border-color: rgba(220,38,38,0.92); }
.favorite-icon { font-size: 1rem; }
.favorite-message { color: #d1fae5; margin-top: 10px; font-size: 0.88rem; }

/* Header */
.header { display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 60px; background: #fff; border-bottom: 1px solid #e5e7eb; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.brand { display: flex; align-items: center; gap: 8px; text-decoration: none; font-weight: 700; font-size: 1.1rem; color: #111; }
.logo { color: #e53e3e; font-size: 1.3rem; }
.nav, .nav-actions { display: flex; align-items: center; gap: 20px; }
.nav-link { text-decoration: none; font-size: 0.9rem; color: #374151; }
.nav-link:hover { color: #2563eb; }
.logout-link { color: #6b7280; }
.logout-icon { margin-right: 2px; }

/* Footer */
.footer { background: #1e293b; color: #94a3b8; text-align: center; padding: 20px; font-size: 0.82rem; }
</style>
