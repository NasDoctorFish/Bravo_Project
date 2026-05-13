//  CONTROL

import { ref, computed } from 'vue'
import { FundRaisingActivity } from './FundRaisingActivity.js'

const SEED_CAMPAIGNS = [
  {
    fraId: '1', userId: 'u1', title: 'Clean Water for Rural Schools',
    createdBy: 'Jane Doe', categoryId: 'Education', status: 'active',
    description: 'Installing water filtration in 5 rural schools to benefit over 2,000 students.',
    targetAmount: 10000, currentAmount: 7400,
    image: 'https://placehold.co/400x200/d8f3dc/2d6a4f?text=Clean+Water',
  },
  {
    fraId: '2', userId: 'u2', title: 'School Supplies Drive',
    createdBy: 'Mark Tan', categoryId: 'Education', status: 'completed',
    description: 'Providing essential school supplies to underprivileged children.',
    targetAmount: 5000, currentAmount: 5000,
    image: 'https://placehold.co/400x200/ebf8ff/2b6cb0?text=Supplies',
  },
  {
    fraId: '3', userId: 'u3', title: 'Medical Aid Fund',
    createdBy: 'Dr. Sarah Lim', categoryId: 'Healthcare', status: 'active',
    description: 'Supporting low-income families with medical expenses they cannot afford.',
    targetAmount: 20000, currentAmount: 9200,
    image: 'https://placehold.co/400x200/fff5f5/c53030?text=Medical+Aid',
  },
  {
    fraId: '4', userId: 'u4', title: 'Reforestation Project',
    createdBy: 'GreenEarth SG', categoryId: 'Environment', status: 'active',
    description: 'Planting 10,000 trees across deforested areas in Southeast Asia.',
    targetAmount: 15000, currentAmount: 4800,
    image: 'https://placehold.co/400x200/f0fff4/276749?text=Reforestation',
  },
  {
    fraId: '5', userId: 'u5', title: 'Elderly Care Program',
    createdBy: 'Community Hearts', categoryId: 'Community', status: 'pending',
    description: 'Providing daily meals and companionship visits to isolated elderly.',
    targetAmount: 8000, currentAmount: 1200,
    image: 'https://placehold.co/400x200/fffbeb/b7791f?text=Elderly+Care',
  },
  {
    fraId: '6', userId: 'u6', title: 'Flood Relief Fund',
    createdBy: 'RedHand SG', categoryId: 'Disaster Relief', status: 'active',
    description: 'Emergency aid for families affected by recent flooding.',
    targetAmount: 30000, currentAmount: 22000,
    image: 'https://placehold.co/400x200/ebf8ff/2c5282?text=Flood+Relief',
  },
]

const campaignStore = SEED_CAMPAIGNS.map(d => new FundRaisingActivity(d))

export function useFraSearchController() {

  // ── State (mirrors diagram: keyword, results) ──────────────
  const keyword  = ref('')        // diagram: - keyword: String
  const results  = ref([])        // diagram: - results: List<FundRaisingActivity>
  const error    = ref(null)      // surface validation errors to Boundary
  const isLoading = ref(false)

  // Filters are managed by Control so Boundary stays thin
  const filters = ref({
    category: '',
    status:   '',
    sort:     'recent',   // 'recent' | 'funded' | 'ending'
  })

  //  validateKeyword(keyword: String)
  function validateKeyword(kw) {
    if (typeof kw !== 'string') {
      throw new Error('Keyword must be a string.')
    }
    if (kw.trim().length > 100) {
      throw new Error('Search keyword must be 100 characters or fewer.')
    }
    // Reject queries that are only special characters
    if (kw.trim().length > 0 && !/[a-zA-Z0-9]/.test(kw)) {
      throw new Error('Keyword must contain at least one letter or number.')
    }
    return true
  }

  //  filterResults(results: List)
  function filterResults(rawResults) {
    let filtered = [...rawResults]

    // Category filter
    if (filters.value.category) {
      filtered = filtered.filter(
        fra => fra.categoryId === filters.value.category
      )
    }

    // Status filter — exclude soft-deleted entries always
    filtered = filtered.filter(fra => fra.status !== 'deleted')
    if (filters.value.status) {
      filtered = filtered.filter(fra => fra.status === filters.value.status)
    }

    // Sort
    if (filters.value.sort === 'funded') {
      filtered.sort((a, b) => b.progressPercent - a.progressPercent)
    } else if (filters.value.sort === 'ending') {
      // Without a real deadline field, sort by least remaining amount as proxy
      filtered.sort((a, b) =>
        (a.targetAmount - a.currentAmount) - (b.targetAmount - b.currentAmount)
      )
    } else {
      filtered.sort((a, b) => b.createdAt - a.createdAt)
    }

    return filtered
  }

  //  searchCampaigns(keyword: String)
  async function searchCampaigns(kw) {
    error.value   = null
    isLoading.value = true

    try {
      validateKeyword(kw)                          // step 1 — Control rule

      // step 2 — Entity does the keyword matching
      const matched = FundRaisingActivity.searchByKeyword(kw, campaignStore)

      // step 3 — Control applies filters on top
      const filtered = filterResults(matched)

      // step 4 — expose to Boundary via returnResults()
      returnResults(filtered)

    } catch (e) {
      error.value = e.message
      results.value = []
    } finally {
      isLoading.value = false
    }
  }

  //  returnResults(campaigns)
  function returnResults(campaigns) {
    results.value = campaigns
  }

  //  clearSearch()
  function clearSearch() {
    keyword.value = ''
    error.value   = null
    filters.value = { category: '', status: '', sort: 'recent' }
    // Show all campaigns when search is cleared
    returnResults(filterResults(campaignStore))
  }

  const totalCount  = computed(() => results.value.length)
  const hasResults  = computed(() => results.value.length > 0)
  const hasError    = computed(() => !!error.value)

  searchCampaigns('')

  return {
    // State
    keyword,
    results,
    filters,
    error,
    isLoading,

    // Computed
    totalCount,
    hasResults,
    hasError,

    // Methods (diagram methods)
    searchCampaigns,
    validateKeyword,
    filterResults,
    returnResults,

    // Helper
    clearSearch,
  }
}