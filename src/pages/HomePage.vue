<script setup>
const emit = defineEmits(['go-home', 'go-login', 'go-signup', 'go-search'])
</script>

<template>
  <div class="homepage">
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
        <a href="#" class="nav-link" @click.prevent="emit('go-login')">Sign In</a>
        <a href="#" class="btn btn-primary" @click.prevent="emit('go-signup')">Start Campaign</a>
      </nav>
    </header>

    <section class="hero">
      <div class="hero-content">
        <h1>Make a Difference Today</h1>
        <p>Support meaningful causes and help people achieve their goals</p>

        <div class="hero-buttons">
          <a href="#" class="btn btn-white" @click.prevent="emit('go-signup')">Start Fundraising</a>
          <a href="#" class="btn btn-outline">
            Start Donating
          </a>
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

          <button class="btn btn-dark">Donate Now</button>
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

          <button class="btn btn-dark">Donate Now</button>
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
      <a href="#" class="btn btn-primary-lg" @click.prevent="emit('go-signup')">
        Create Your Account
      </a>
    </section>

    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>
  </div>
</template>