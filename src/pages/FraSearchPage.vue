<script setup>
import { ref } from 'vue'

const emit = defineEmits(['go-home', 'go-login', 'go-signup', 'go-search', 'go-creation'])

const search = ref('')
const category = ref('')
const sort = ref('')

const campaigns = ref([])
</script>

<template>
  <div class="search-page">
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
        <a href="#" class="btn btn-primary" @click.prevent="emit('go-creation')">Start Campaign</a>
      </nav>
    </header>

    <section class="search-hero">
      <div class="search-hero-content">
        <h1>Discover Campaigns</h1>
        <p>Support causes that matter to you and make a real difference</p>
      </div>
    </section>

    <section class="search-filters">
      <div class="filters-container">
        <div class="filters-wrapper">
          <div class="search-pill">
              <span class="search-icon">⌕</span>
              <input
                  type="text"
                  placeholder="Search campaigns..."
                  v-model="search"
              />
          </div>

          <div class="filter-card">
              <select v-model="category">
                  <option value="">All Categories</option>
                  <option value="medical">Medical</option>
                  <option value="education">Education</option>
                  <option value="emergency">Emergency</option>
                  <option value="community">Community</option>
              </select>
          </div>

          <div class="filter-card">
              <select v-model="sort">
                  <option value="recent">Most Recent</option>
                  <option value="funded">Most Funded</option>
                  <option value="urgent">Most Urgent</option>
              </select>
          </div>
        </div>
      </div>
    </section>

    <div class="search-results">
      <p class="results-count">Showing {{ campaigns.length }} campaigns</p>

      <div class="results-container">
        <div v-if="campaigns.length === 0" class="empty-state">
          <h3>No active campaigns available</h3>
          <p>Sign up to start supporting causes</p>
        </div>

        <div v-else class="campaigns-list">
          <!-- Campaigns will be displayed here -->
        </div>
      </div>
    </div>
    
    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>
  </div>
</template>