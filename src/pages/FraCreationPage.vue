// FraCreationPage.vue
<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
const { isLoggedIn, userId, userRole, sessionReady, signOut } = useAuth()
import { useRouter } from 'vue-router'
import { ref, reactive, watch } from 'vue'
import { fraController } from '../controllers/fraController'
import { supabase } from '../lib/supabaseClient'

// FR-2-01 Boundary
const router = useRouter()
const emit = defineEmits(['go-home', 'go-logout', 'go-search', 'campaign-created', 'go-login', 'go-signup'])

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

// Redirect to login once session is confirmed but user is not authenticated
watch(sessionReady, (ready) => {
  if (ready && !isLoggedIn.value) {
    router.push('/login')
  }
}, { immediate: true })

const step       = ref(1)
const submitting = ref(false)
const errorMsg   = ref('')
const showSuccess = ref(false)

const steps = ['Basic Info', 'Funding', 'Media', 'Review']

const categories = [
  'Education', 'Healthcare', 'Environment',
  'Disaster Relief', 'Community', 'Arts & Culture', 'Other'
]

const form = reactive({
  title:         '',
  description:   '',
  category:      null as number | null,
  beneficiary:   '',
  goal:          null as number | null,
  minDonation:   null as number | null,
  startDate:     '',
  endDate:       '',
  tiers:         [] as { amount: string; label: string }[],
  bannerPreview: '',
  videoUrl:      '',
  visibility:    'public',
  agreed:        false,
})

// Image handling
function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => { form.bannerPreview = (ev.target as FileReader).result as string }
  reader.readAsDataURL(file)
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => { form.bannerPreview = (ev.target as FileReader).result as string }
  reader.readAsDataURL(file)
}

// FR-2-01: Create campaign
// async function handleCreateFra(): Promise<void> {
//   errorMsg.value   = ''
//   submitting.value = true

//   try {
//     const { data: { user } } = await supabase.auth.getUser()
//     if (!user) throw new Error('You must be logged in to create a campaign.')

//     const controller = new fraController()

//     await controller.createFra(
//       user.id,
//       {
//         title:        form.title,
//         description:  form.description,
//         targetAmount: form.goal!,
//         categoryId:   form.category,
//       }
//     )

//     showSuccess.value = true

//   } catch (err: any) {
//     errorMsg.value = err.message || 'Failed to create campaign. Please try again.'
//   } finally {
//     submitting.value = false
//   }
// }
async function handleCreateFra(): Promise<void> {
  errorMsg.value   = ''
  submitting.value = true

  try {
    if (!sessionReady.value || !isLoggedIn.value || !userId.value) {
      router.push('/login')
      return
    }

    const controller = new fraController()

    await controller.createFra(
      String(userId.value),
      {
        title:        form.title,
        description:  form.description,
        targetAmount: form.goal!,
        categoryId:   Number(form.category),
      }
    )

    showSuccess.value = true

  } catch (err: any) {
    errorMsg.value = err.message || 'Failed to create campaign. Please try again.'
  } finally {
    submitting.value = false
  }
}

function handleSuccessClose() {
  showSuccess.value = false
  router.push('/fra/search')
}
</script>

<template>
  <div class="creation-page">

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
        <button class="nav-link logout-link" @click="async () => { await signOut(); router.push('/') }">
          <span class="logout-icon">⇢</span> Logout
        </button>
      </nav>
    </header>

    <div class="creation-container">

      <!-- Back link -->
      <RouterLink to="/fra/search" class="back-link" @click="emit('go-search')">← Back to Campaigns</RouterLink>

      <!-- Page title -->
      <div class="dashboard-header">
        <h1>Create New Campaign</h1>
        <p>Fill in the details to launch a fundraising campaign</p>

        <!-- Step Indicator -->
        <div class="step-indicator">
          <div
            v-for="(s, i) in steps"
            :key="s"
            :class="['step-item', { active: step === i + 1, done: step > i + 1 }]"
          >
            <div class="step-num">{{ step > i + 1 ? '✓' : i + 1 }}</div>
            <span class="step-label">{{ s }}</span>
          </div>
        </div>
      </div>

      <!-- Error Banner -->
      <div v-if="errorMsg" class="error-banner">
        ⚠️ {{ errorMsg }}
      </div>

      <!-- Form Card -->
      <section class="dashboard-section">

        <!-- Step 1: Basic Info -->
        <div v-if="step === 1">
          <h2 class="step-title">Basic Information</h2>

          <div class="form-group">
            <label>Campaign Title <span class="required">*</span></label>
            <input v-model="form.title" type="text" class="form-input"
              placeholder="E.g. Clean Water for Rural Schools" maxlength="100" />
            <p class="form-hint">{{ form.title.length }}/100 characters</p>
          </div>

          <div class="form-group">
            <label>Description <span class="required">*</span></label>
            <textarea v-model="form.description" rows="5" class="form-textarea"
              placeholder="Describe your campaign, its goals, and how funds will be used…"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Category <span class="required">*</span></label>
              <select v-model="form.category" class="form-select">
                <option value="" disabled>Select category…</option>
                <option v-for="(c, idx) in categories" :key="c" :value="idx + 1">{{ c }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Target Beneficiary</label>
              <input v-model="form.beneficiary" type="text" class="form-input"
                placeholder="E.g. Students in rural areas" />
            </div>
          </div>
        </div>

        <!-- Step 2: Funding -->
        <div v-if="step === 2">
          <h2 class="step-title">Funding &amp; Timeline</h2>

          <div class="form-row">
            <div class="form-group">
              <label>Fundraising Goal (SGD) <span class="required">*</span></label>
              <div class="input-prefix-wrap">
                <span class="input-prefix">$</span>
                <input v-model.number="form.goal" type="number" min="100"
                  placeholder="5000" class="form-input prefix-input" />
              </div>
            </div>
            <div class="form-group">
              <label>Minimum Donation (SGD)</label>
              <div class="input-prefix-wrap">
                <span class="input-prefix">$</span>
                <input v-model.number="form.minDonation" type="number" min="1"
                  placeholder="10" class="form-input prefix-input" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Start Date <span class="required">*</span></label>
              <input v-model="form.startDate" type="date" class="form-input" />
            </div>
            <div class="form-group">
              <label>End Date <span class="required">*</span></label>
              <input v-model="form.endDate" type="date" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label>Donation Tiers <span class="optional-label">(optional)</span></label>
            <div class="tiers-list">
              <div v-for="(t, i) in form.tiers" :key="i" class="tier-row">
                <input v-model="t.amount" type="number" placeholder="Amount"
                  class="form-input tier-amount" />
                <input v-model="t.label" type="text" placeholder="Label (e.g. Supporter)"
                  class="form-input tier-label" />
                <button type="button" class="btn btn-cancel tier-remove"
                  @click="form.tiers.splice(i, 1)">✕</button>
              </div>
            </div>
            <button type="button" class="btn-add-tier"
              @click="form.tiers.push({ amount: '', label: '' })">
              + Add Tier
            </button>
          </div>
        </div>

        <!-- Step 3: Media -->
        <div v-if="step === 3">
          <h2 class="step-title">Media &amp; Visibility</h2>

          <div class="form-group">
            <label>Campaign Banner Image</label>
            <div
              v-if="!form.bannerPreview"
              class="image-upload-zone"
              @dragover.prevent
              @drop.prevent="handleDrop"
              @click="($refs.bannerInput as HTMLInputElement).click()"
            >
              <div class="upload-icon">🖼️</div>
              <p class="upload-title">Drag &amp; drop or click to upload</p>
              <p class="upload-hint">PNG, JPG — max 5MB</p>
              <button type="button" class="btn btn-upload">Choose Image</button>
            </div>

            <div v-else class="image-preview-wrapper">
              <img :src="form.bannerPreview" alt="Banner preview" class="image-preview" />
              <div class="image-preview-overlay">
                <button type="button" class="btn btn-change-image"
                  @click="($refs.bannerInput as HTMLInputElement).click()">Change Image</button>
                <button type="button" class="btn btn-remove-image"
                  @click="form.bannerPreview = ''">Remove</button>
              </div>
            </div>

            <input ref="bannerInput" type="file" accept="image/*"
              style="display:none" @change="handleFileChange" />
          </div>

          <div class="form-group">
            <label>Video URL <span class="optional-label">(optional)</span></label>
            <input v-model="form.videoUrl" type="url" class="form-input"
              placeholder="https://youtube.com/watch?v=…" />
          </div>

          <div class="form-group">
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

        <!-- Step 4: Review -->
        <div v-if="step === 4">
          <h2 class="step-title">Review &amp; Submit</h2>

          <div class="review-grid">
            <div class="review-item">
              <span class="review-label">Title</span>
              <span class="review-value">{{ form.title || '—' }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Category</span>
              <span class="review-value">{{ form.category || '—' }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Goal</span>
              <span class="review-value">${{ form.goal?.toLocaleString() || '—' }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Start Date</span>
              <span class="review-value">{{ form.startDate || '—' }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">End Date</span>
              <span class="review-value">{{ form.endDate || '—' }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Visibility</span>
              <span class="review-value">{{ form.visibility }}</span>
            </div>
            <div class="review-item review-item-full">
              <span class="review-label">Description</span>
              <span class="review-value">{{ form.description || '—' }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.agreed" />
              I confirm all information is accurate and I agree to the platform's fundraising guidelines.
            </label>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="step-actions">
          <button v-if="step > 1" type="button" class="btn btn-cancel" @click="step--">
            ← Back
          </button>
          <div class="spacer"></div>
          <button v-if="step < 4" type="button" class="btn btn-create step-btn" @click="step++">
            Continue →
          </button>
          <button
            v-if="step === 4"
            type="button"
            class="btn btn-create step-btn"
            :disabled="!form.agreed || submitting"
            @click="handleCreateFra"
          >
            <span v-if="submitting" class="spinner"></span>
            {{ submitting ? 'Submitting…' : 'Submit Campaign' }}
          </button>
        </div>

      </section>
    </div>

    <!-- ── Success Modal ── -->
    <Teleport to="body">
      <div v-if="showSuccess" class="modal-backdrop" @click.self="handleSuccessClose">
        <div class="modal-card">
          <div class="modal-icon">🎉</div>
          <h2 class="modal-title">Campaign Created!</h2>
          <p class="modal-body">
            <strong>{{ form.title }}</strong> has been successfully submitted.
            It will be reviewed and activated shortly.
          </p>
          <button class="btn btn-create modal-btn" @click="handleSuccessClose">
            Done
          </button>
        </div>
      </div>
    </Teleport>

    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>

  </div>
</template>

<style scoped>
/* ── Layout ── */
.creation-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.creation-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 24px 60px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

/* ── Back Link ── */
.back-link {
  display: block;
  text-align: left;
  font-size: 0.85rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 16px;
}
.back-link:hover { text-decoration: underline; }

/* ── Page Header ── */
.dashboard-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  text-align: center;
}
.dashboard-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #111;
  margin: 0;
}
.dashboard-header p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

/* ── Error Banner ── */
.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.88rem;
  font-weight: 500;
  margin-bottom: 16px;
}

/* ── Step Indicator ── */
.step-indicator {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 99px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 0.82rem;
  color: #9ca3af;
  font-weight: 500;
  transition: all 0.2s;
}
.step-item.active { background: #3b82f6; border-color: #3b82f6; color: #fff; }
.step-item.done   { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(0,0,0,0.08);
  flex-shrink: 0;
}
.step-item.active .step-num { background: rgba(255,255,255,0.25); }
.step-item.done .step-num   { background: #dcfce7; color: #15803d; }
.step-label { white-space: nowrap; }

/* ── Form Card ── */
.dashboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* ── Step Title ── */
.step-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

/* ── Form Elements ── */
.form-group { margin-bottom: 20px; }
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1f2937;
  font-size: 0.88rem;
  text-align: left;
}
.form-group p { text-align: center; }
.form-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 4px 0 0;
  text-align: right !important;
}
.required { color: #ef4444; }
.optional-label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 400;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.88rem;
  color: #111;
  background: #fff;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
}
.form-textarea { resize: vertical; }

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
}
.prefix-input {
  border: none !important;
  border-radius: 0 !important;
  flex: 1;
  margin: 0 !important;
}

/* ── Tiers ── */
.tiers-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
.tier-row { display: flex; gap: 10px; align-items: center; }
.tier-amount { width: 120px; flex-shrink: 0; }
.tier-label  { flex: 1; }
.tier-remove { flex-shrink: 0; padding: 8px 12px; }
.btn-add-tier {
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.15s;
  width: 100%;
}
.btn-add-tier:hover { background: #f0f4ff; border-color: #93c5fd; color: #3b82f6; }

/* ── Image Upload ── */
.image-upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  background: #fafafa;
  transition: border-color 0.2s, background 0.2s;
}
.image-upload-zone:hover { border-color: #3b82f6; background: #f0f5ff; }
.upload-icon  { font-size: 2.5rem; margin-bottom: 10px; }
.upload-title { font-weight: 600; margin: 0 0 4px; }
.upload-hint  { font-size: 0.82rem; color: #9ca3af; margin: 0 0 14px; }
.btn-upload {
  background: #fff;
  border: 1px solid #d1d5db;
  padding: 7px 18px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  color: #111;
}
.image-preview-wrapper { position: relative; border-radius: 10px; overflow: hidden; }
.image-preview { width: 100%; max-height: 260px; object-fit: cover; display: block; border-radius: 10px; }
.image-preview-overlay { position: absolute; top: 10px; right: 10px; display: flex; gap: 8px; }
.btn-change-image {
  background: rgba(255,255,255,0.92);
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
}
.btn-remove-image {
  background: rgba(220,53,69,0.85);
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
}

/* ── Radio Group ── */
.radio-group { display: flex; flex-direction: column; gap: 10px; }
.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  color: #374151;
  cursor: pointer;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.15s;
}
.radio-label:hover { background: #f0f4ff; border-color: #93c5fd; }
.radio-label input[type="radio"] { accent-color: #3b82f6; }

/* ── Review Grid ── */
.review-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
}
.review-item { display: flex; flex-direction: column; gap: 3px; }
.review-item-full { grid-column: 1 / -1; }
.review-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9ca3af;
}
.review-value { font-size: 0.9rem; color: #111; font-weight: 500; }

/* ── Checkbox ── */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.88rem;
  color: #374151;
  cursor: pointer;
  line-height: 1.5;
}
.checkbox-label input { margin-top: 2px; accent-color: #3b82f6; }

/* ── Step Actions ── */
.step-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  gap: 12px;
}
.spacer { flex: 1; }
.step-actions .btn {
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.step-btn { flex: unset !important; }

/* ── Buttons (shared globals assumed in project) ── */
.btn { border: none; cursor: pointer; }
.btn-create {
  background: #3b82f6;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
}
.btn-create:hover:not(:disabled) { background: #2563eb; }
.btn-create:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
}
.btn-cancel:hover { background: #e5e7eb; }

/* ── Spinner ── */
.spinner {
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Success Modal ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}
.modal-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px 36px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: modal-in 0.25s ease;
}
@keyframes modal-in {
  from { transform: scale(0.92); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}
.modal-icon  { font-size: 3rem; margin-bottom: 12px; }
.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 12px;
}
.modal-body {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
  margin: 0 0 24px;
}
.modal-btn { width: 100%; justify-content: center; font-size: 0.95rem; padding: 12px; }

/* ── Header / Footer (shared) ── */
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
.nav-link {
  font-size: 0.88rem;
  color: #555;
  text-decoration: none;
  font-weight: 500;
}
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
