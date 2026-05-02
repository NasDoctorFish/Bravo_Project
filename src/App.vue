<script setup>
import { ref } from 'vue'

const page = ref('home')
</script>

<template>
  <div class="homepage" v-if="page === 'home'">
    <header class="header">
      <a href="#" class="brand" @click.prevent="page = 'home'">
        <span class="logo">♥</span>
        <span>FundRise</span>
      </a>
      <nav class="nav">
        <a href="#" class="nav-link">Donate</a>
        <a href="#" class="nav-link">Fundraising</a>
      </nav>
      <nav class="nav-actions">
        <a href="#" class="nav-link" @click.prevent="page = 'login'">Sign In</a>
        <a href="#" class="btn btn-primary" @click.prevent="page = 'signup'">Start Campaign</a>
      </nav>
    </header>

    <section class="hero">
      <div class="hero-content">
        <h1>Make a Difference Today</h1>
        <p>Support meaningful causes and help people achieve their goals</p>
        <div class="hero-buttons">
          <a href="#" class="btn btn-white">Start Fundraising</a>
          <a href="#" class="btn btn-outline">Start Donating</a>
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

    <section class="campaigns">
      <h2>Featured Campaigns</h2>
      <p class="campaigns-subtitle">Support these urgent causes and help make an immediate impact</p>
      <div class="campaigns-grid">
        <article class="campaign-card">
          <div class="campaign-image">Campaign Image</div>
          <div class="campaign-category">
            <span class="category-badge">Medical</span>
            <span class="by-text">by Sarah Johnson</span>
          </div>
          <h3>Help Emma Fight Cancer</h3>
          <p>Supporting Emma's medical treatment and recovery journey. Your contribution makes a real difference.</p>
          <div class="campaign-progress">
            <div class="progress-amount">$45,230 <span class="progress-goal">raised of $60,000</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width: 75%;"></div></div>
          </div>
          <div class="campaign-meta">
            <span class="donors">👥 1,234 donors</span>
            <span class="time-left">⏱️ 12 days left</span>
          </div>
          <button class="btn btn-dark">Donate Now</button>
        </article>

        <article class="campaign-card">
          <div class="campaign-image">Campaign Image</div>
          <div class="campaign-category">
            <span class="category-badge">Education</span>
            <span class="by-text">by Community Trust</span>
          </div>
          <h3>School Library Renovation</h3>
          <p>Building a modern library for 500 students in rural areas to access quality education.</p>
          <div class="campaign-progress">
            <div class="progress-amount">$28,500 <span class="progress-goal">raised of $35,000</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width: 81%;"></div></div>
          </div>
          <div class="campaign-meta">
            <span class="donors">👥 892 donors</span>
            <span class="time-left">⏱️ 6 days left</span>
          </div>
          <button class="btn btn-dark">Donate Now</button>
        </article>

        <article class="campaign-card">
          <div class="campaign-image">Campaign Image</div>
          <div class="campaign-category">
            <span class="category-badge">Environment</span>
            <span class="by-text">by Green Earth</span>
          </div>
          <h3>Plant 10,000 Trees Initiative</h3>
          <p>Join our mission to combat climate change by planting trees across three communities.</p>
          <div class="campaign-progress">
            <div class="progress-amount">$18,750 <span class="progress-goal">raised of $25,000</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width: 75%;"></div></div>
          </div>
          <div class="campaign-meta">
            <span class="donors">👥 2,156 donors</span>
            <span class="time-left">⏱️ 20 days left</span>
          </div>
          <button class="btn btn-dark">Donate Now</button>
        </article>
      </div>
      <div class="campaigns-footer">
        <a href="#" class="btn btn-outline-dark">View All Campaigns</a>
      </div>
    </section>

    <section class="cta-section">
      <h2>Ready to Get Started?</h2>
      <p>Join thousands of fundraisers and donors making an impact</p>
      <a href="#" class="btn btn-primary-lg">Create Your Account</a>
    </section>

    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>
  </div>

  <div class="login-page" v-else-if="page === 'login'">
    <header class="header">
      <a href="#" class="brand" @click.prevent="page = 'home'">
        <span class="logo">♥</span>
        <span>FundRise</span>
      </a>
      <nav class="nav">
        <a href="#" class="nav-link">Donate</a>
        <a href="#" class="nav-link">Fundraising</a>
      </nav>
      <nav class="nav-actions">
        <a href="#" class="nav-link" @click.prevent="page = 'home'">Home</a>
        <a href="#" class="btn btn-primary" @click.prevent="page = 'signup'">Start Campaign</a>
      </nav>
    </header>

    <main class="login-main">
      <div class="login-card">
        <div class="card-icon">↴</div>
        <h1>Welcome Back</h1>
        <p class="subtitle">Sign in to your account</p>

        <form class="login-form">
          <label>
            Email
            <input type="email" placeholder="your@email.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>
          <button type="submit" class="btn btn-primary btn-submit">Sign In</button>
        </form>

        <p class="signup-line">
          Don't have an account? <a href="#" @click.prevent="page = 'signup'">Sign up</a>
        </p>
      </div>
    </main>
  </div>

  <div class="signup-page" v-else>
    <header class="header">
      <a href="#" class="brand" @click.prevent="page = 'home'">
        <span class="logo">♥</span>
        <span>FundRise</span>
      </a>
      <nav class="nav">
        <a href="#" class="nav-link">Donate</a>
        <a href="#" class="nav-link">Fundraising</a>
      </nav>
      <nav class="nav-actions">
        <a href="#" class="nav-link" @click.prevent="page = 'home'">Home</a>
        <a href="#" class="nav-link" @click.prevent="page = 'login'">Sign In</a>
      </nav>
    </header>

    <main class="login-main">
      <div class="signup-card">
        <div class="card-icon">👤</div>
        <h1>Create Your Account</h1>
        <p class="subtitle">Join our community today</p>

        <form class="signup-form">
          <label>
            Full Name
            <input type="text" placeholder="John Doe" />
          </label>
          <label>
            Email
            <input type="email" placeholder="your@email.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>

          <div class="role-section">
            <p class="role-label">I want to:</p>
            <div class="role-grid">
              <button type="button" class="role-card role-card-active">
                <span class="role-icon">🤝</span>
                <span class="role-name">Donate</span>
                <span class="role-desc">Support campaigns</span>
              </button>
              <button type="button" class="role-card">
                <span class="role-icon">♥</span>
                <span class="role-name">Fundraise</span>
                <span class="role-desc">Create campaigns</span>
              </button>
              <button type="button" class="role-card">
                <span class="role-icon">🛡️</span>
                <span class="role-name">Admin</span>
                <span class="role-desc">Manage platform</span>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-submit">Create Account</button>
        </form>

        <p class="signin-line">
          Already have an account? <a href="#" @click.prevent="page = 'login'">Sign in</a>
        </p>
      </div>
    </main>
  </div>
</template>

<style>
:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #0f172a;
  background: #f8fafc;
  width: 100%;
  height: 100%;
}

html {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  overflow-x: hidden;
}

a {
  text-decoration: none;
}

.homepage {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 40px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.brand:hover {
  opacity: 0.8;
}

.logo {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(37, 99, 235, 0.15);
  color: #2563eb;
  font-size: 1.2rem;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.nav-link,
.btn {
  font-weight: 700;
  transition: all 0.2s ease;
}

.nav-link {
  color: #475569;
}

.nav-link:hover {
  color: #0f172a;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 12px 22px;
  border: 1px solid transparent;
  cursor: pointer;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.hero {
  position: relative;
  padding: 120px 32px 120px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 45%, #4338ca 100%);
  color: white;
  overflow: hidden;
  width: 100%;
}

.hero::before,
.hero::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  opacity: 0.2;
  z-index: -1;
}

.hero::before {
  width: 360px;
  height: 360px;
  background: rgba(255, 255, 255, 0.18);
  top: -80px;
  left: -80px;
}

.hero::after {
  width: 320px;
  height: 320px;
  background: rgba(255, 255, 255, 0.12);
  bottom: -90px;
  right: -90px;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 820px;
  margin: 0 auto;
  text-align: center;
}

.hero h1 {
  margin: 0;
  font-size: clamp(3rem, 5vw, 4.5rem);
  line-height: 1;
}

.hero p {
  margin: 24px auto 0;
  max-width: 640px;
  color: white;
  font-size: 1.05rem;
  line-height: 1.8;
}

.hero-buttons {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.btn-white {
  background: white;
  color: #2563eb;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
}

.btn-white:hover {
  background: #f8fafc;
}

.btn-outline {
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.95);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.12);
}

.features {
  padding: 88px 32px 0;
  width: 100%;
}

.features h2 {
  margin: 0 auto 24px;
  font-size: clamp(2.25rem, 3vw, 3rem);
  line-height: 1.05;
  text-align: center;
  color: #0f172a;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.feature-card {
  background: white;
  border-radius: 28px;
  padding: 34px 28px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.06);
  text-align: center;
}

.feature-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin: 0 auto 22px;
  display: grid;
  place-items: center;
  font-size: 1.7rem;
}

.feature-icon-blue {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.feature-icon-green {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

.feature-icon-purple {
  background: rgba(168, 85, 247, 0.12);
  color: #7c3aed;
}

.feature-icon-orange {
  background: rgba(252, 211, 77, 0.18);
  color: #f97316;
}

.feature-card h3 {
  margin: 0 0 12px;
  font-size: 1.1rem;
}

.feature-card p {
  margin: 0;
  color: #475569;
  line-height: 1.85;
}

.campaigns {
  padding: 88px 32px 0;
  width: 100%;
}

.campaigns h2 {
  margin: 0 auto 12px;
  font-size: clamp(2.25rem, 3vw, 3rem);
  line-height: 1.05;
  text-align: center;
  color: #0f172a;
}

.campaigns-subtitle {
  margin: 0 auto 32px;
  max-width: 640px;
  text-align: center;
  color: #475569;
  font-size: 1rem;
}

.campaigns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  justify-items: center;
  margin-bottom: 48px;
}

.campaign-card {
  width: 100%;
  max-width: 360px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
}

.campaign-image {
  width: 100%;
  height: 200px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.95rem;
}

.campaign-category {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  border-bottom: 1px solid #e2e8f0;
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #e2e8f0;
  border-radius: 999px;
  color: #2563eb;
  font-weight: 600;
}

.by-text {
  color: #475569;
  margin-left: auto;
}

.campaign-card h3 {
  margin: 12px 16px 8px;
  font-size: 1.05rem;
  color: #0f172a;
  line-height: 1.3;
}

.campaign-card p {
  margin: 0 16px 16px;
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.6;
  flex-grow: 1;
}

.campaign-progress {
  padding: 0 16px;
  margin-bottom: 12px;
}

.progress-amount {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.95rem;
}

.progress-goal {
  color: #475569;
  font-weight: 400;
  margin-left: 4px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #1d4ed8);
}

.campaign-meta {
  padding: 0 16px 16px;
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #475569;
}

.donors,
.time-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.campaign-card .btn-dark {
  margin: 0 16px 16px;
  background: #0f172a;
  color: white;
  border: none;
  width: calc(100% - 32px);
}

.campaign-card .btn-dark:hover {
  background: #1e293b;
}

.campaigns-footer {
  text-align: center;
  padding: 24px 0;
}

.btn-outline-dark {
  background: transparent;
  color: #0f172a;
  border: 2px solid #0f172a;
  padding: 10px 28px;
}

.btn-outline-dark:hover {
  background: #0f172a;
  color: white;
}

.cta-section {
  padding: 88px 32px 76px;
  text-align: center;
  background: #f8fafc;
  width: 100%;
}

.cta-section h2 {
  margin: 0 auto 16px;
  font-size: clamp(2.4rem, 3vw, 3.2rem);
  max-width: 760px;
  color: #0f172a;
}

.cta-section p {
  margin: 0 auto 28px;
  max-width: 640px;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.8;
}

.btn-primary-lg {
  background: #2563eb;
  color: white;
  padding: 16px 32px;
  font-size: 1rem;
}

.btn-primary-lg:hover {
  background: #1d4ed8;
}

.footer {
  padding: 26px 0;
  text-align: center;
  background: #0f172a;
  color: #e2e8f0;
  width: 100%;
}

.footer p {
  margin: 0;
  font-size: 0.95rem;
}

.login-page,
.signup-page {
  min-height: 100vh;
  background: #f8fafc;
}

.login-main {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: 40px 0;
}

.login-card,
.signup-card {
  background: white;
  border-radius: 12px;
  padding: 56px 48px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  display: grid;
  place-items: center;
  font-size: 2.2rem;
  margin: 0 auto 32px;
}

.login-card h1,
.signup-card h1 {
  margin: 0 0 12px;
  font-size: 2.2rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 0 0 40px;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 400;
  line-height: 1.5;
}

.login-form,
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
  text-align: left;
}

.login-form label,
.signup-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 500;
  color: #1f2937;
  font-size: 0.9rem;
}

.login-form input,
.signup-form input {
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #fafbfc;
  color: #0f172a;
  transition: all 0.2s ease;
  font-family: inherit;
}

.login-form input::placeholder,
.signup-form input::placeholder {
  color: #9ca3af;
}

.login-form input:hover,
.signup-form input:hover {
  border-color: #d1d5db;
  background: white;
}

.login-form input:focus,
.signup-form input:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.btn-submit {
  padding: 12px 16px;
  font-size: 0.95rem;
  margin-top: 0;
  font-weight: 600;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
}

.signup-line,
.signin-line {
  margin: 28px 0 0;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 400;
}

.signup-line a,
.signin-line a {
  color: #2563eb;
  font-weight: 600;
  transition: all 0.2s ease;
}

.signup-line a:hover,
.signin-line a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.role-section {
  margin-top: 8px;
}

.role-label {
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.role-card {
  padding: 16px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.role-card:hover {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.05);
}

.role-card-active {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.05);
}

.role-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
  display: block;
}

.role-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.85rem;
  margin-bottom: 4px;
  display: block;
}

.role-desc {
  color: #6b7280;
  font-size: 0.75rem;
  display: block;
}

@media (max-width: 980px) {
  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .campaigns-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .header {
    flex-direction: column;
    gap: 20px;
    padding: 16px 20px;
  }

  .nav {
    order: 2;
    justify-content: center;
  }

  .nav-actions {
    order: 3;
  }

  .hero {
    padding: 80px 20px;
  }

  .hero h1 {
    font-size: clamp(2.5rem, 8vw, 4rem);
  }

  .features,
  .campaigns,
  .cta-section {
    padding-left: 20px;
    padding-right: 20px;
  }

  .login-card,
  .signup-card {
    padding: 32px 24px;
    margin: 20px;
  }

  .role-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>