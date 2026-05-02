<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="logo">🤝</span>
        <span class="brand-name">FundBridge</span>
      </div>
      <nav class="nav">
        <a v-for="item in navItems" :key="item.label"
          :class="['nav-item', { active: item.label === 'Campaigns' }]" href="#">
          <span>{{ item.icon }}</span> {{ item.label }}
        </a>
      </nav>
    </aside>

    <main class="main">
      <a href="#" class="back-link">← Back to Campaigns</a>

      <!-- Hero -->
      <div class="hero">
        <img src="https://placehold.co/900x320/d8f3dc/2d6a4f?text=Campaign+Banner" class="hero-img" alt="Campaign Banner" />
        <div class="hero-overlay">
          <span :class="['badge', campaign.status]">{{ campaign.status }}</span>
          <h1>{{ campaign.title }}</h1>
          <p class="hero-meta">By <strong>{{ campaign.organizer }}</strong> · {{ campaign.category }} · Ends {{ campaign.endDate }}</p>
        </div>
      </div>

      <div class="content-grid">
        <!-- Left: Details -->
        <div class="left">
          <!-- Tabs -->
          <div class="tabs">
            <button v-for="tab in tabs" :key="tab" :class="['tab', { active: activeTab === tab }]" @click="activeTab = tab">{{ tab }}</button>
          </div>

          <div v-if="activeTab === 'About'" class="tab-content">
            <h3>About This Campaign</h3>
            <p>{{ campaign.description }}</p>
            <h3>Impact</h3>
            <ul class="impact-list">
              <li v-for="item in campaign.impact" :key="item">✅ {{ item }}</li>
            </ul>
          </div>

          <div v-if="activeTab === 'Updates'" class="tab-content">
            <div class="update-item" v-for="u in campaign.updates" :key="u.date">
              <div class="update-date">{{ u.date }}</div>
              <div class="update-text">{{ u.text }}</div>
            </div>
          </div>

          <div v-if="activeTab === 'Donors'" class="tab-content">
            <div class="donor-item" v-for="d in campaign.donors" :key="d.name">
              <div class="donor-avatar">{{ d.name[0] }}</div>
              <div class="donor-info">
                <span class="donor-name">{{ d.name }}</span>
                <span class="donor-time">{{ d.time }}</span>
              </div>
              <span class="donor-amount">${{ d.amount }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Donate card -->
        <div class="right">
          <div class="donate-card">
            <div class="progress-section">
              <div class="raised-amount">${{ campaign.raised.toLocaleString() }}</div>
              <div class="goal-text">raised of ${{ campaign.goal.toLocaleString() }} goal</div>
              <div class="progress-bar"><div class="progress-fill" :style="{ width: pct + '%' }"></div></div>
              <div class="progress-stats">
                <span><strong>{{ campaign.donors.length }}</strong> donors</span>
                <span><strong>{{ daysLeft }}</strong> days left</span>
                <span><strong>{{ pct }}%</strong> funded</span>
              </div>
            </div>

            <div class="donate-section">
              <h4>Make a Donation</h4>
              <div class="tier-options">
                <button v-for="t in campaign.tiers" :key="t" :class="['tier-btn', { selected: donateAmount === t }]" @click="donateAmount = t">${{ t }}</button>
              </div>
              <div class="custom-input-wrap">
                <span class="prefix">$</span>
                <input v-model.number="donateAmount" type="number" min="1" placeholder="Custom amount" />
              </div>
              <textarea v-model="message" rows="2" placeholder="Leave a message (optional)…"></textarea>
              <button class="btn-donate" @click="handleDonate">
                <span v-if="donating" class="spinner"></span>
                {{ donating ? 'Processing…' : `Donate $${donateAmount || '—'}` }}
              </button>
              <p class="secure-note">🔒 Secure payment · 100% goes to the cause</p>
            </div>
          </div>

          <div class="share-card">
            <h4>Share This Campaign</h4>
            <div class="share-buttons">
              <button class="share-btn">🐦 Twitter</button>
              <button class="share-btn">📘 Facebook</button>
              <button class="share-btn" @click="copyLink">🔗 Copy Link</button>
            </div>
            <span v-if="copied" class="copied-msg">Link copied!</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('About')
const donateAmount = ref(50)
const message = ref('')
const donating = ref(false)
const copied = ref(false)

const tabs = ['About', 'Updates', 'Donors']
const navItems = [
  { icon: '🏠', label: 'Dashboard' },
  { icon: '📋', label: 'Campaigns' },
  { icon: '🔍', label: 'Search' },
  { icon: '📊', label: 'Reports' },
]

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

const pct = computed(() => Math.round(campaign.raised / campaign.goal * 100))
const daysLeft = computed(() => 60) // placeholder

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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@700&display=swap');

* { box-sizing: border-box; }
.layout { display: flex; min-height: 100vh; font-family: 'DM Sans', sans-serif; background: #f5f4f0; }
.sidebar { width: 220px; background: #fff; border-right: 1px solid #e2e0db; display: flex; flex-direction: column; padding: 24px 0; position: fixed; height: 100vh; }
.sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 0 20px 24px; border-bottom: 1px solid #f0ede8; }
.logo { font-size: 1.4rem; } .brand-name { font-family: 'Fraunces', serif; font-size: 1.1rem; color: #1a1a1a; }
.nav { padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; text-decoration: none; font-size: 0.88rem; color: #555; font-weight: 500; transition: background 0.15s; }
.nav-item:hover { background: #f5f4f0; } .nav-item.active { background: #e8f5ee; color: #2d6a4f; font-weight: 600; }

.main { margin-left: 220px; flex: 1; padding: 32px 36px; }
.back-link { font-size: 0.82rem; color: #2d6a4f; text-decoration: none; display: inline-block; margin-bottom: 16px; }
.back-link:hover { text-decoration: underline; }

.hero { position: relative; border-radius: 14px; overflow: hidden; margin-bottom: 28px; }
.hero-img { width: 100%; height: 280px; object-fit: cover; display: block; }
.hero-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 24px; background: linear-gradient(transparent, rgba(0,0,0,0.65)); }
.hero-overlay h1 { font-family: 'Fraunces', serif; font-size: 1.7rem; color: #fff; margin: 6px 0 4px; }
.hero-meta { font-size: 0.85rem; color: rgba(255,255,255,0.85); }

.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.badge.active { background: #2d6a4f; color: #fff; }
.badge.completed { background: #2b6cb0; color: #fff; }
.badge.pending { background: #b7791f; color: #fff; }

.content-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }

.left { background: #fff; border: 1px solid #e2e0db; border-radius: 14px; overflow: hidden; }
.tabs { display: flex; border-bottom: 1px solid #e2e0db; }
.tab { flex: 1; padding: 14px; background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500; color: #888; cursor: pointer; border-bottom: 2px solid transparent; transition: color 0.2s, border-color 0.2s; }
.tab.active { color: #2d6a4f; border-bottom-color: #2d6a4f; }
.tab-content { padding: 24px; }
.tab-content h3 { font-size: 1rem; font-weight: 600; color: #1a1a1a; margin: 0 0 10px; }
.tab-content h3 + h3, .tab-content p + h3 { margin-top: 20px; }
.tab-content p { font-size: 0.9rem; color: #555; line-height: 1.65; }
.impact-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.impact-list li { font-size: 0.9rem; color: #444; }

.update-item { padding: 16px 0; border-bottom: 1px solid #f0ede8; }
.update-item:last-child { border-bottom: none; }
.update-date { font-size: 0.75rem; color: #aaa; margin-bottom: 4px; }
.update-text { font-size: 0.9rem; color: #444; line-height: 1.6; }

.donor-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0ede8; }
.donor-item:last-child { border-bottom: none; }
.donor-avatar { width: 36px; height: 36px; background: #2d6a4f; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; }
.donor-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.donor-name { font-size: 0.88rem; font-weight: 600; color: #1a1a1a; }
.donor-time { font-size: 0.75rem; color: #aaa; }
.donor-amount { font-size: 0.92rem; font-weight: 700; color: #2d6a4f; }

.right { display: flex; flex-direction: column; gap: 16px; }
.donate-card { background: #fff; border: 1px solid #e2e0db; border-radius: 14px; overflow: hidden; }
.progress-section { padding: 24px; border-bottom: 1px solid #f0ede8; }
.raised-amount { font-family: 'Fraunces', serif; font-size: 2rem; color: #1a1a1a; }
.goal-text { font-size: 0.85rem; color: #888; margin-bottom: 12px; }
.progress-bar { height: 8px; background: #eee; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
.progress-fill { height: 100%; background: #2d6a4f; border-radius: 8px; }
.progress-stats { display: flex; justify-content: space-between; font-size: 0.82rem; color: #666; }
.progress-stats strong { color: #1a1a1a; }

.donate-section { padding: 20px 24px; display: flex; flex-direction: column; gap: 12px; }
.donate-section h4 { font-size: 0.95rem; font-weight: 600; color: #1a1a1a; margin: 0; }
.tier-options { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.tier-btn { border: 1.5px solid #ddd; background: #fafaf9; border-radius: 8px; padding: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: border-color 0.2s, background 0.2s; font-family: 'DM Sans', sans-serif; }
.tier-btn:hover { border-color: #2d6a4f; }
.tier-btn.selected { border-color: #2d6a4f; background: #e8f5ee; color: #2d6a4f; }
.custom-input-wrap { display: flex; align-items: center; border: 1.5px solid #ddd; border-radius: 8px; background: #fafaf9; overflow: hidden; }
.custom-input-wrap:focus-within { border-color: #2d6a4f; }
.prefix { padding: 0 12px; font-size: 0.92rem; color: #888; font-weight: 600; }
.custom-input-wrap input { border: none; background: transparent; padding: 10px 12px 10px 0; font-size: 0.92rem; font-family: 'DM Sans', sans-serif; color: #1a1a1a; width: 100%; }
.custom-input-wrap input:focus { outline: none; }
textarea { border: 1.5px solid #ddd; border-radius: 8px; padding: 10px 12px; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; background: #fafaf9; resize: none; }
textarea:focus { outline: none; border-color: #2d6a4f; }
.btn-donate { background: #2d6a4f; color: #fff; border: none; border-radius: 8px; padding: 13px; font-size: 0.95rem; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; }
.btn-donate:hover { background: #1f4d38; }
.secure-note { font-size: 0.75rem; color: #aaa; text-align: center; margin: 0; }

.share-card { background: #fff; border: 1px solid #e2e0db; border-radius: 14px; padding: 20px; }
.share-card h4 { font-size: 0.95rem; font-weight: 600; color: #1a1a1a; margin: 0 0 12px; }
.share-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
.share-btn { border: 1.5px solid #ddd; background: #fafaf9; border-radius: 8px; padding: 8px 14px; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: border-color 0.2s, background 0.2s; font-family: 'DM Sans', sans-serif; }
.share-btn:hover { border-color: #2d6a4f; background: #f0faf5; }
.copied-msg { font-size: 0.8rem; color: #2d6a4f; margin-top: 8px; display: block; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
