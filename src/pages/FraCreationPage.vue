<script setup>
import { ref } from 'vue'

const emit = defineEmits(['go-home', 'go-login', 'go-logout', 'campaign-created'])

const formData = ref({
  title: '',
  description: '',
  location: '',
  goal: '',
  category: 'medical',
  endDate: ''
})

const isSubmitting = ref(false)

const handleCreateCampaign = async () => {
  if (!formData.value.title || !formData.value.description || !formData.value.goal || !formData.value.category) {
    alert('Please fill in all required fields')
    return
  }

  isSubmitting.value = true

  setTimeout(() => {
    console.log('Campaign created:', formData.value)
    emit('campaign-created', formData.value)

    formData.value = {
      title: '',
      description: '',
      location: '',
      goal: '',
      category: 'medical',
      endDate: ''
    }

    isSubmitting.value = false
    alert('Campaign created successfully!')
  }, 1000)
}

const handleCancel = () => {
  formData.value = {
    title: '',
    description: '',
    location: '',
    goal: '',
    category: 'medical',
    endDate: ''
  }
  emit('go-home')
}
</script>

<template>
  <div class="creation-page">
    <header class="header">
      <a href="#" class="brand" @click.prevent="emit('go-home')">
        <span class="logo"></span>
        <span>FundRise</span>
      </a>

      <nav class="nav">
        <a href="#" class="nav-link">Donate</a>
        <a href="#" class="nav-link">Fundraising</a>
      </nav>

      <nav class="nav-actions">
        <a href="#" class="nav-link">Dashboard</a>
        <span class="user-info">John Doe (fundraiser)</span>
        <a href="#" class="nav-link logout-link" @click.prevent="emit('go-logout')">
          <span class="logout-icon">⇢</span> Logout
        </a>
      </nav>
    </header>

    <div class="creation-container">
      <div class="creation-header">
        <h1>Create New Campaign</h1>
        <p>Share your story and start raising funds</p>
      </div>

      <form class="creation-form" @submit.prevent="handleCreateCampaign">
        <div class="form-group">
          <label for="title">Campaign Title <span class="required">*</span></label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="Give your campaign a clear, descriptive title"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Description <span class="required">*</span></label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Tell your story. Explain why you're raising funds and how they will be used."
            class="form-textarea"
            rows="8"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="location">Location</label>
          <input
            id="location"
            v-model="formData.location"
            type="text"
            placeholder="e.g., New York, NY or London, UK"
            class="form-input"
          />
          <p class="form-hint">Optional - helps people find your campaign by location</p>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="goal">Fundraising Goal ($) <span class="required">*</span></label>
            <input
              id="goal"
              v-model="formData.goal"
              type="number"
              placeholder="10000"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="category">Category <span class="required">*</span></label>
            <select v-model="formData.category" id="category" class="form-select" required>
              <option value="medical">Medical</option>
              <option value="education">Education</option>
              <option value="emergency">Emergency</option>
              <option value="community">Community</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="endDate">End Date (Optional)</label>
          <input
            id="endDate"
            v-model="formData.endDate"
            type="text"
            placeholder="dd/mm/yyyy"
            class="form-input"
          />
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-create"
            :disabled="isSubmitting"
          >
            <span class="btn-icon">+</span> {{ isSubmitting ? 'Creating...' : 'Create Campaign' }}
          </button>
          <button
            type="button"
            class="btn btn-cancel"
            @click="handleCancel"
            :disabled="isSubmitting"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>
  </div>
</template>