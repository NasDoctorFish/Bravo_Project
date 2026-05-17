<script setup>
import { useAuth } from '../composables/useAuth'
const { isLoggedIn, userid, userRole, sessionReady, signOut } = useAuth()
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['go-home', 'go-login', 'go-signup', 'go-search'])


// check login status
if (isLoggedIn.value) {
  console.log(
    'Logged in as...\n',
    'userid: ', userid.value,
    '\nRole: ', userRole.value,
    '\nsessionReady: ', sessionReady.value
  )
}
else {
  console.log('Logged Out')
}

</script>

<template>
  <div class="homepage">
    <header class="header">
      <RouterLink to="/" class="brand" @click="emit('go-home')">
        <span class="logo">♥</span>
        <span>FundRise</span>
      </RouterLink>

      <nav class="nav">
        <RouterLink to="/fra/search" class="nav-link" @click="emit('go-search')">⌕ Donate</RouterLink>
        <RouterLink to="/fra/create" class="nav-link" @click="emit('go-signup')">Fundraising</RouterLink>
      </nav>

      <nav class="nav-actions">
        <template v-if="!sessionReady">
          <!-- Optional: keep empty while checking session -->
        </template>
        <template v-if="!isLoggedIn">
          <RouterLink to="/login" class="nav-link">Login</RouterLink>
          <RouterLink to="/signup" class="btn btn-primary">Sign Up</RouterLink>
        </template>

        <template v-else>
          <button class="btn btn-primary" @click="signOut">
            Logout
          </button>
        </template>
      </nav>
    </header>

    <section class="hero">
      <div class="hero-content">
        <h1>Make a Difference Today</h1>
        <p>Support meaningful causes and help people achieve their goals</p>

        <div class="hero-buttons">
          <RouterLink to="/fra/create" class="btn btn-white" @click="emit('go-signup')">Start Fundraising</RouterLink>
          <RouterLink to="/fra/search" class="btn btn-outline" @click="emit('go-search')">
            Start Donating
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="features">
      <h2>Why Choose FundRise?</h2>

      <div class="feature-grid">
        <article class="feature-card">
          <span class="feature-icon feature-icon-blue">♥</span>
          <h3>Easy to Use</h3>
          <p>Create and manage campaigns in minutes</p>
        </article>

        <article class="feature-card">
          <span class="feature-icon feature-icon-green">📈</span>
          <h3>Track Progress</h3>
          <p>Monitor donations and campaign analytics</p>
        </article>

        <article class="feature-card">
          <span class="feature-icon feature-icon-purple">👥</span>
          <h3>Community Driven</h3>
          <p>Connect with supporters worldwide</p>
        </article>

        <article class="feature-card">
          <span class="feature-icon feature-icon-orange">🛡️</span>
          <h3>Secure Platform</h3>
          <p>Your data is safe and protected</p>
        </article>
      </div>
    </section>

    <section class="quick-actions">
      <div class="section-heading">
        <h2>Start Here</h2>
        <p>Choose the next action for your fundraising workflow</p>
      </div>

      <div class="quick-action-grid">
        <article class="wire-card">
          <span class="wire-icon">+</span>
          <h3>Create Campaign</h3>
          <p>Set up a fundraising page with a goal, story, and campaign image.</p>
          <RouterLink to="/fra/create" class="btn btn-primary" @click="emit('go-signup')">Start</RouterLink>
        </article>

        <article class="wire-card">
          <span class="wire-icon">⌕</span>
          <h3>Find Campaigns</h3>
          <p>Browse active campaigns and support causes by category or status.</p>
          <RouterLink to="/fra/search" class="btn btn-outline-dark" @click="emit('go-search')">Browse</RouterLink>
        </article>

        <article class="wire-card">
          <span class="wire-icon">□</span>
          <h3>Track Activity</h3>
          <p>Review donations, campaign progress, and platform summaries.</p>
          <RouterLink to="/login" class="btn btn-outline-dark" @click="emit('go-login')">Login</RouterLink>
        </article>
      </div>
    </section>

    <section class="platform-summary">
      <div class="section-heading">
        <h2>Platform Summary</h2>
        <p>Placeholder metrics for the FundRise dashboard</p>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <span class="summary-value">$86K</span>
          <span class="summary-label">Raised</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">24</span>
          <span class="summary-label">Active Campaigns</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">1.2K</span>
          <span class="summary-label">Donors</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">68%</span>
          <span class="summary-label">Average Completion</span>
        </div>
      </div>
    </section>

    <section class="campaigns">
      <h2>Featured Campaigns</h2>
      <p class="campaigns-subtitle">
        Support these urgent causes and help make an immediate impact
      </p>

      <div class="campaigns-grid">
        <article class="campaign-card">
          <div class="campaign-image">Campaign Image</div>

          <div class="campaign-category">
            <span class="category-badge">Medical</span>
            <span class="by-text">by Sarah Johnson</span>
          </div>

          <h3>Help Emma Fight Cancer</h3>
          <p>
            Supporting Emma's medical treatment and recovery journey.
            Your contribution makes a real difference.
          </p>

          <div class="campaign-progress">
            <div class="progress-amount">
              $45,230 <span class="progress-goal">raised of $60,000</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 75%;"></div>
            </div>
          </div>

          <div class="campaign-meta">
            <span class="donors">👥 1,234 donors</span>
            <span class="time-left">⏱️ 12 days left</span>
          </div>

          <RouterLink to="/fra/1" class="btn btn-dark">Donate Now</RouterLink>
        </article>

        <article class="campaign-card">
          <div class="campaign-image">Campaign Image</div>

          <div class="campaign-category">
            <span class="category-badge">Education</span>
            <span class="by-text">by Community Trust</span>
          </div>

          <h3>School Library Renovation</h3>
          <p>
            Building a modern library for 500 students in rural areas
            to access quality education.
          </p>

          <div class="campaign-progress">
            <div class="progress-amount">
              $28,500 <span class="progress-goal">raised of $35,000</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 81%;"></div>
            </div>
          </div>

          <div class="campaign-meta">
            <span class="donors">👥 892 donors</span>
            <span class="time-left">⏱️ 6 days left</span>
          </div>

          <RouterLink to="/fra/2" class="btn btn-dark">Donate Now</RouterLink>
        </article>

        <article class="campaign-card">
          <div class="campaign-image">Campaign Image</div>

          <div class="campaign-category">
            <span class="category-badge">Environment</span>
            <span class="by-text">by Green Earth</span>
          </div>

          <h3>Plant 10,000 Trees Initiative</h3>
          <p>
            Join our mission to combat climate change by planting trees
            across three communities.
          </p>

          <div class="campaign-progress">
            <div class="progress-amount">
              $18,750 <span class="progress-goal">raised of $25,000</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 75%;"></div>
            </div>
          </div>

          <div class="campaign-meta">
            <span class="donors">👥 2,156 donors</span>
            <span class="time-left">⏱️ 20 days left</span>
          </div>

          <RouterLink to="/fra/3" class="btn btn-dark">Donate Now</RouterLink>
        </article>
      </div>

      <div class="campaigns-footer">
        <RouterLink to="/fra/search" class="btn btn-outline-dark" @click="emit('go-search')">View All Campaigns
        </RouterLink>
      </div>
    </section>

    <section class="cta-section">
      <h2>Ready to Get Started?</h2>
      <p>Join thousands of fundraisers and donors making an impact</p>
      <RouterLink to="/signup" class="btn btn-primary-lg" @click="emit('go-signup')">
        Create Your Account
      </RouterLink>
    </section>

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

.logo {
  color: #ef4444;
  font-size: 1.2rem;
}

.nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.nav-link {
  font-size: 0.88rem;
  color: #555;
  text-decoration: none;
  font-weight: 500;
}

.nav-link:hover {
  color: #111;
}

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
  padding: 9px 16px;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.88rem;
}

.homepage {
  min-height: 100vh;
  background: #f5f5f5;
}

.quick-actions,
.platform-summary,
.features,
.campaigns,
.cta-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px;
  box-sizing: border-box;
}

.section-heading {
  text-align: center;
  margin-bottom: 24px;
}

.section-heading h2,
.features h2,
.campaigns h2,
.cta-section h2 {
  margin: 0 0 8px;
  color: #111827;
}

.section-heading p,
.campaigns-subtitle,
.cta-section p {
  color: #6b7280;
  margin: 0;
}

.quick-action-grid,
.summary-grid,
.feature-grid,
.campaigns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.wire-card,
.summary-card,
.feature-card,
.campaign-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

.wire-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wire-card h3,
.feature-card h3,
.campaign-card h3 {
  margin: 0;
  color: #111827;
}

.wire-card p,
.feature-card p,
.campaign-card p {
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.wire-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 700;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: #111827;
}

.summary-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.hero {
  background: #2563eb;
  color: #fff;
  padding: 72px 24px;
  text-align: center;
}

.hero-content {
  max-width: 720px;
  margin: 0 auto;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 3.4rem);
  margin: 0 0 12px;
}

.hero p {
  color: #d1d5db;
  margin: 0 0 24px;
}

.hero-buttons,
.campaigns-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 24px;
}

.campaign-image {
  min-height: 150px;
  border-radius: 8px;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  margin: 8px 0;
}

.progress-fill {
  height: 100%;
  background: #2563eb;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 9px 16px;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid transparent;
}

.btn-primary,
.btn-primary-lg,
.btn-dark {
  background: #2563eb;
  color: #fff;
}

.btn-white {
  background: #fff;
  color: #111827;
}

.btn-outline,
.btn-outline-dark {
  background: #fff;
  color: #2563eb;
  border-color: #bfdbfe;
}

@media (max-width: 720px) {

  .quick-actions,
  .platform-summary,
  .features,
  .campaigns,
  .cta-section {
    padding: 28px 16px;
  }
}
</style>
