<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="logo">🤝</span>
        <span class="brand-name">FundBridge</span>
      </div>
      <nav class="nav">
        <a v-for="item in navItems" :key="item.label"
           :class="['nav-item', { active: item.label === 'Campaigns' }]"
           href="#">
          <span>{{ item.icon }}</span> {{ item.label }}
        </a>
      </nav>
    </aside>

    <main class="main">
      <div class="page-header">
        <div>
          <a href="#" class="back-link">← Back to Campaigns</a>
          <h2>Create New Campaign</h2>
          <p class="subtitle">Fill in the details to launch a fundraising campaign</p>
        </div>
        <div class="step-indicator">
          <span v-for="(s, i) in steps" :key="s"
            :class="['step', { active: step === i+1, done: step > i+1 }]">
            <span class="step-num">{{ step > i+1 ? '✓' : i+1 }}</span>
            {{ s }}
          </span>
        </div>
      </div>

      <div class="form-card">
        <!-- Step 1: Basic Info -->
        <div v-if="step === 1">
          <h3 class="step-title">Basic Information</h3>
          <div class="form">
            <div class="field full">
              <label>Campaign Title <span class="req">*</span></label>
              <input v-model="form.title" type="text" placeholder="E.g. Clean Water for Rural Schools" />
              <span class="hint">{{ form.title.length }}/100 characters</span>
            </div>
            <div class="field full">
              <label>Description <span class="req">*</span></label>
              <textarea v-model="form.description" rows="5"
                placeholder="Describe your campaign, its goals, and how funds will be used…"></textarea>
            </div>
            <div class="field">
              <label>Category <span class="req">*</span></label>
              <select v-model="form.category">
                <option value="" disabled>Select category…</option>
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="field">
              <label>Target Beneficiary</label>
              <input v-model="form.beneficiary" type="text" placeholder="E.g. Students in rural areas" />
            </div>
          </div>
        </div>

        <!-- Step 2: Funding Goal -->
        <div v-if="step === 2">
          <h3 class="step-title">Funding & Timeline</h3>
          <div class="form">
            <div class="field">
              <label>Fundraising Goal (SGD) <span class="req">*</span></label>
              <div class="input-prefix">
                <span class="prefix">$</span>
                <input v-model.number="form.goal" type="number" min="100" placeholder="5000" />
              </div>
            </div>
            <div class="field">
              <label>Minimum Donation (SGD)</label>
              <div class="input-prefix">
                <span class="prefix">$</span>
                <input v-model.number="form.minDonation" type="number" min="1" placeholder="10" />
              </div>
            </div>
            <div class="field">
              <label>Start Date <span class="req">*</span></label>
              <input v-model="form.startDate" type="date" />
            </div>
            <div class="field">
              <label>End Date <span class="req">*</span></label>
              <input v-model="form.endDate" type="date" />
            </div>
            <div class="field full">
              <label>Donation Tiers (optional)</label>
              <div class="tiers">
                <div class="tier-item" v-for="(t, i) in form.tiers" :key="i">
                  <input v-model="t.amount" type="number" placeholder="Amount" />
                  <input v-model="t.label" type="text" placeholder="Tier label (e.g. Supporter)" />
                  <button class="btn-remove" @click="form.tiers.splice(i,1)">✕</button>
                </div>
              </div>
              <button class="btn-add-tier" @click="form.tiers.push({ amount: '', label: '' })">+ Add Tier</button>
            </div>
          </div>
        </div>

        <!-- Step 3: Media -->
        <div v-if="step === 3">
          <h3 class="step-title">Media & Visibility</h3>
          <div class="form">
            <div class="field full">
              <label>Campaign Banner Image</label>
              <div class="upload-zone" @dragover.prevent @drop.prevent="handleDrop">
                <div class="upload-inner" v-if="!form.bannerPreview">
                  <span class="upload-icon">🖼️</span>
                  <p>Drag & drop an image or <label class="upload-link" for="banner-upload">browse</label></p>
                  <p class="upload-hint">PNG, JPG up to 5MB</p>
                  <input id="banner-upload" type="file" accept="image/*" hidden @change="handleFileChange" />
                </div>
                <div v-else class="preview-wrap">
                  <img :src="form.bannerPreview" class="banner-preview" />
                  <button class="btn-remove-img" @click="form.bannerPreview = ''">✕ Remove</button>
                </div>
              </div>
            </div>
            <div class="field full">
              <label>Video URL (optional)</label>
              <input v-model="form.videoUrl" type="url" placeholder="https://youtube.com/watch?v=…" />
            </div>
            <div class="field full">
              <label>Visibility</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" v-model="form.visibility" value="public" />
                  🌐 Public — anyone can find and donate
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="form.visibility" value="private" />
                  🔒 Private — only people with the link
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Review -->
        <div v-if="step === 4">
          <h3 class="step-title">Review & Submit</h3>
          <div class="review-grid">
            <div class="review-item"><span class="rl">Title</span><span class="rv">{{ form.title || '—' }}</span></div>
            <div class="review-item"><span class="rl">Category</span><span class="rv">{{ form.category || '—' }}</span></div>
            <div class="review-item"><span class="rl">Goal</span><span class="rv">${{ form.goal?.toLocaleString() || '—' }}</span></div>
            <div class="review-item"><span class="rl">Start Date</span><span class="rv">{{ form.startDate || '—' }}</span></div>
            <div class="review-item"><span class="rl">End Date</span><span class="rv">{{ form.endDate || '—' }}</span></div>
            <div class="review-item"><span class="rl">Visibility</span><span class="rv">{{ form.visibility }}</span></div>
            <div class="review-item full"><span class="rl">Description</span><span class="rv">{{ form.description || '—' }}</span></div>
          </div>
          <label class="checkbox-field">
            <input type="checkbox" v-model="form.agreed" />
            I confirm all information is accurate and I agree to the platform's fundraising guidelines.
          </label>
        </div>

        <!-- Nav buttons -->
        <div class="form-actions">
          <button v-if="step > 1" class="btn-secondary" @click="step--">← Back</button>
          <div class="spacer"></div>
          <button v-if="step < 4" class="btn-primary" @click="step++">Continue →</button>
          <button v-if="step === 4" class="btn-primary" :disabled="!form.agreed || submitting" @click="handleSubmit">
            <span v-if="submitting" class="spinner"></span>
            {{ submitting ? 'Submitting…' : 'Submit Campaign' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const step = ref(1)
const submitting = ref(false)
const steps = ['Basic Info', 'Funding', 'Media', 'Review']

const categories = ['Education', 'Healthcare', 'Environment', 'Disaster Relief', 'Community', 'Arts & Culture', 'Other']

const form = reactive({
  title: '', description: '', category: '', beneficiary: '',
  goal: null, minDonation: null, startDate: '', endDate: '',
  tiers: [],
  bannerPreview: '', videoUrl: '', visibility: 'public',
  agreed: false
})

const navItems = [
  { icon: '🏠', label: 'Dashboard' },
  { icon: '📋', label: 'Campaigns' },
  { icon: '🔍', label: 'Search' },
  { icon: '📊', label: 'Reports' },
]

function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => { form.bannerPreview = ev.target.result }
  reader.readAsDataURL(file)
}

function handleDrop(e) {
  const file = e.dataTransfer.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => { form.bannerPreview = ev.target.result }
  reader.readAsDataURL(file)
}

async function handleSubmit() {
  submitting.value = true
  await new Promise(r => setTimeout(r, 1400))
  submitting.value = false
  // TODO: POST to API
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@700&display=swap');

* { box-sizing: border-box; }

.layout { display: flex; min-height: 100vh; font-family: 'DM Sans', sans-serif; background: #f5f4f0; }

.sidebar { width: 220px; background: #fff; border-right: 1px solid #e2e0db; display: flex; flex-direction: column; padding: 24px 0; position: fixed; height: 100vh; }
.sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 0 20px 24px; border-bottom: 1px solid #f0ede8; }
.logo { font-size: 1.4rem; }
.brand-name { font-family: 'Fraunces', serif; font-size: 1.1rem; color: #1a1a1a; }
.nav { padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; text-decoration: none; font-size: 0.88rem; color: #555; font-weight: 500; transition: background 0.15s; }
.nav-item:hover { background: #f5f4f0; color: #1a1a1a; }
.nav-item.active { background: #e8f5ee; color: #2d6a4f; font-weight: 600; }

.main { margin-left: 220px; flex: 1; padding: 32px 36px; }

.back-link { font-size: 0.82rem; color: #2d6a4f; text-decoration: none; display: inline-block; margin-bottom: 8px; }
.back-link:hover { text-decoration: underline; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
.page-header h2 { font-family: 'Fraunces', serif; font-size: 1.5rem; color: #1a1a1a; }
.subtitle { font-size: 0.85rem; color: #888; margin-top: 2px; }

.step-indicator { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.step { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #aaa; font-weight: 500; }
.step-num { width: 22px; height: 22px; border-radius: 50%; background: #e2e0db; color: #888; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; }
.step.active .step-num { background: #2d6a4f; color: #fff; }
.step.active { color: #2d6a4f; }
.step.done .step-num { background: #2d6a4f; color: #fff; }
.step.done { color: #2d6a4f; }

.form-card { background: #fff; border: 1px solid #e2e0db; border-radius: 14px; padding: 32px; }

.step-title { font-family: 'Fraunces', serif; font-size: 1.15rem; color: #1a1a1a; margin-bottom: 24px; }

.form { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full { grid-column: 1 / -1; }
label { font-size: 0.85rem; font-weight: 500; color: #333; }
.req { color: #e53e3e; }
.hint { font-size: 0.75rem; color: #aaa; }

input[type="text"], input[type="email"], input[type="number"], input[type="date"], input[type="url"], select, textarea {
  width: 100%; padding: 11px 14px; border: 1.5px solid #ddd; border-radius: 8px;
  font-size: 0.92rem; font-family: 'DM Sans', sans-serif; color: #1a1a1a;
  background: #fafaf9; transition: border-color 0.2s; box-sizing: border-box;
}
input:focus, select:focus, textarea:focus { outline: none; border-color: #2d6a4f; background: #fff; }
textarea { resize: vertical; }

.input-prefix { display: flex; align-items: center; border: 1.5px solid #ddd; border-radius: 8px; background: #fafaf9; overflow: hidden; transition: border-color 0.2s; }
.input-prefix:focus-within { border-color: #2d6a4f; background: #fff; }
.prefix { padding: 0 12px; font-size: 0.92rem; color: #888; font-weight: 600; }
.input-prefix input { border: none; background: transparent; padding-left: 0; }
.input-prefix input:focus { outline: none; }

.tiers { display: flex; flex-direction: column; gap: 8px; }
.tier-item { display: grid; grid-template-columns: 120px 1fr auto; gap: 8px; align-items: center; }
.btn-remove { background: none; border: 1px solid #ddd; border-radius: 6px; padding: 6px 10px; cursor: pointer; color: #888; font-size: 0.78rem; }
.btn-remove:hover { background: #fff5f5; border-color: #e53e3e; color: #e53e3e; }
.btn-add-tier { margin-top: 8px; background: none; border: 1.5px dashed #ddd; border-radius: 8px; padding: 9px 14px; cursor: pointer; color: #2d6a4f; font-size: 0.85rem; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: border-color 0.2s, background 0.2s; }
.btn-add-tier:hover { border-color: #2d6a4f; background: #f0faf5; }

.upload-zone { border: 2px dashed #ddd; border-radius: 10px; padding: 32px; text-align: center; transition: border-color 0.2s; cursor: pointer; }
.upload-zone:hover { border-color: #2d6a4f; }
.upload-icon { font-size: 2rem; }
.upload-inner p { margin-top: 8px; font-size: 0.88rem; color: #666; }
.upload-hint { font-size: 0.78rem; color: #aaa; }
.upload-link { color: #2d6a4f; font-weight: 500; cursor: pointer; }
.preview-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.banner-preview { max-height: 180px; border-radius: 8px; object-fit: cover; }
.btn-remove-img { background: none; border: 1px solid #ddd; border-radius: 6px; padding: 6px 14px; cursor: pointer; font-size: 0.82rem; color: #888; font-family: 'DM Sans', sans-serif; }
.btn-remove-img:hover { border-color: #e53e3e; color: #e53e3e; }

.radio-group { display: flex; flex-direction: column; gap: 10px; }
.radio-label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #444; cursor: pointer; }

.review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
.review-item { display: flex; flex-direction: column; gap: 2px; }
.review-item.full { grid-column: 1 / -1; }
.rl { font-size: 0.75rem; color: #aaa; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.rv { font-size: 0.92rem; color: #1a1a1a; }

.checkbox-field { display: flex; align-items: flex-start; gap: 8px; font-size: 0.85rem; color: #555; cursor: pointer; line-height: 1.5; margin-top: 12px; }

.form-actions { display: flex; align-items: center; gap: 12px; margin-top: 28px; border-top: 1px solid #f0ede8; padding-top: 24px; }
.spacer { flex: 1; }

.btn-primary { background: #2d6a4f; color: #fff; border: none; border-radius: 8px; padding: 11px 22px; font-size: 0.92rem; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #1f4d38; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #fff; color: #333; border: 1.5px solid #ddd; border-radius: 8px; padding: 11px 20px; font-size: 0.92rem; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: border-color 0.2s; }
.btn-secondary:hover { border-color: #999; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
