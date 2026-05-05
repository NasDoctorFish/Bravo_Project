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
const coverImage = ref(null)
const coverImagePreview = ref(null)
 
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
 
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.')
    return
  }
 
  if (file.size > 5 * 1024 * 1024) {
    alert('Image must be smaller than 5MB.')
    return
  }
 
  coverImage.value = file
  coverImagePreview.value = URL.createObjectURL(file)
}
 
const handleImageDrop = (event) => {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (!file) return
 
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.')
    return
  }
 
  if (file.size > 5 * 1024 * 1024) {
    alert('Image must be smaller than 5MB.')
    return
  }
 
  coverImage.value = file
  coverImagePreview.value = URL.createObjectURL(file)
}
 
const handleDragOver = (event) => {
  event.preventDefault()
}
 
const removeImage = () => {
  coverImage.value = null
  coverImagePreview.value = null
}

const handleCreateCampaign = async () => {
  if (!formData.value.title || !formData.value.description || !formData.value.goal || !formData.value.category) {
    alert('Please fill in all required fields')
    return
  }

  isSubmitting.value = true

  setTimeout(() => {
    console.log('Campaign created:', formData.value, 'Cover image:', coverImage.value)
    emit('campaign-created', formData.value)

    formData.value = {
      title: '',
      description: '',
      location: '',
      goal: '',
      category: 'medical',
      endDate: ''
    }
    coverImage.value = null
    coverImagePreview.value = null

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
  coverImage.value = null
  coverImagePreview.value = null
  emit('go-home')
}
</script>

<template>
  <div class="creation-page">
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
        <a href="#" class="nav-link">Dashboard</a>
        <span class="user-info">{user} (fundraiser)</span>
        <a href="#" class="nav-link logout-link" @click.prevent="emit('go-logout')">
          <span class="logout-icon">⇢</span> Logout</a>
      </nav>
    </header>

    <div class="creation-container">
      <div class="creation-header">
        <h1>Create New Campaign</h1>
        <p>Share your story and start raising funds</p>
      </div>

      <form class="creation-form" @submit.prevent="handleCreateCampaign">
        <!-- Cover Image Upload -->
        <div class="form-group">
          <label>Campaign Cover Image</label>
 
          <div
            v-if="!coverImagePreview"
            class="image-upload-zone"
            @drop="handleImageDrop"
            @dragover="handleDragOver"
            @click="$refs.imageInput.click()"
          >
            <div class="upload-icon">🖼️</div>
            <p class="upload-title">Drag & drop or click to upload</p>
            <p class="upload-hint">JPG, PNG, WEBP — max 5MB</p>
            <button type="button" class="btn btn-upload">Choose Image</button>
          </div>
 
          <div v-else class="image-preview-wrapper">
            <img :src="coverImagePreview" alt="Cover preview" class="image-preview" />
            <div class="image-preview-overlay">
              <button type="button" class="btn btn-change-image" @click="$refs.imageInput.click()">
                Change Image
              </button>
              <button type="button" class="btn btn-remove-image" @click="removeImage">
                Remove
              </button>
            </div>
            <p class="image-filename">{{ coverImage?.name }}</p>
          </div>
 
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleImageUpload"
          />
          <p class="form-hint">A compelling image helps your campaign stand out</p>
        </div>

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

<style scoped>
.image-upload-zone {
  border: 2px dashed #ccc;
  border-radius: 10px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: #fafafa;
}
 
.image-upload-zone:hover {
  border-color: #4f8ef7;
  background: #f0f5ff;
}
 
.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}
 
.upload-title {
  font-weight: 600;
  margin-bottom: 4px;
}
 
.upload-hint {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 16px;
}
 
.btn-upload {
  background: #fff;
  border: 1px solid #ccc;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  color:black;
}
 
.image-preview-wrapper {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}
 
.image-preview {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  display: block;
  border-radius: 10px;
}
 
.image-preview-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}
 
.btn-change-image {
  background: rgba(255,255,255,0.9);
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
 
.btn-remove-image {
  background: rgba(220, 53, 69, 0.85);
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
 
.image-filename {
  font-size: 0.8rem;
  color: #666;
  margin-top: 6px;
}
</style>