//  CONTROL — FraDetailController

import { ref, computed } from 'vue'
import { FundRaisingActivity } from './FundRaisingActivity.js'
import { Donation }            from './Donation.js'

const CAMPAIGN_SEED = new FundRaisingActivity({
  fraId:         '1',
  userId:        'u1',
  title:         'Clean Water for Rural Schools',
  name:          'Clean Water for Rural Schools',
  createdBy:     'Jane Doe',
  categoryId:    'Education',
  status:        'active',
  description:   'Thousands of children in rural schools lack access to clean drinking water, '
               + 'leading to preventable illnesses and school absences. This campaign aims to '
               + 'install water filtration systems in 5 schools, benefiting over 2,000 students.',
  target_amount:  10000,
  current_amount: 7400,
  endDate:       '2026-06-30',
  image:         'https://placehold.co/1100x320/d8f3dc/2d6a4f?text=Campaign+Banner',
  tiers:         [25, 50, 100, 250],
  impact: [
    '5 schools to receive clean water filtration systems',
    'Over 2,000 students will benefit',
    'Expected to reduce waterborne illnesses by 60%',
    'Maintenance training provided to school staff',
  ],
  updates: [
    { date: 'Apr 28, 2026', text: 'We have reached 70% of our goal! Thank you to all our amazing donors. First installation begins next month.' },
    { date: 'Mar 15, 2026', text: 'Campaign launched! We are excited to start this journey with your support.' },
  ],
})

const donationStore = [
  new Donation({ donationId: 'd1', userId: 'uA', fraId: '1', donorName: 'Michael T.', amount: 250, donatedAt: new Date(Date.now() - 2   * 60_000) }),
  new Donation({ donationId: 'd2', userId: 'uB', fraId: '1', donorName: 'Sara L.',    amount: 100, donatedAt: new Date(Date.now() - 60  * 60_000) }),
  new Donation({ donationId: 'd3', userId: 'uC', fraId: '1', donorName: 'Anonymous',  amount: 50,  donatedAt: new Date(Date.now() - 180 * 60_000), isAnonymous: true }),
  new Donation({ donationId: 'd4', userId: 'uD', fraId: '1', donorName: 'David K.',   amount: 500, donatedAt: new Date(Date.now() - 26  * 3_600_000) }),
]

const FAVORITES_KEY = 'fundrise-favorites'

export function useFraDetailController() {

  const fraId      = ref('')
  const campaign   = ref(null)       // FundRaisingActivity instance
  const donations  = ref([])         // List<Donation>
  const error      = ref(null)
  const isLoading  = ref(false)

  // Donation form state
  const donateAmount  = ref(50)
  const donateMessage = ref('')
  const isDonating    = ref(false)
  const donateSuccess = ref(false)
  const donateError   = ref(null)

  // Favorites state
  const favoriteList    = ref(_loadFavorites())
  const favoriteMessage = ref('')

  async function getCampaignDetail(id) {
    error.value    = null
    isLoading.value = true
    fraId.value    = id

    try {
      const found = id === CAMPAIGN_SEED.fraId
        ? CAMPAIGN_SEED
        : FundRaisingActivity.readById(id, [CAMPAIGN_SEED])

      if (!found) throw new Error(`Campaign "${id}" was not found.`)

      campaign.value = found

    } catch (e) {
      error.value    = e.message
      campaign.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function getDonations(id) {
    try {
      // Delegates to Entity static method
      donations.value = Donation.readByFra(id, donationStore)
    } catch (e) {
      error.value = e.message
    }
  }

  async function submitDonation(userId = 'guest') {
    donateError.value   = null
    donateSuccess.value = false

    // Validate via Entity before doing anything
    try {
      Donation.validate({
        fraId:  fraId.value,
        userId,
        amount: donateAmount.value,
      })
    } catch (e) {
      donateError.value = e.message
      return
    }

    isDonating.value = true
    try {
      await new Promise(r => setTimeout(r, 1200))

      // Create Donation entity and store
      const newDonation = Donation.create({
        fraId:      fraId.value,
        userId,
        donorName:  'You',
        amount:     donateAmount.value,
        message:    donateMessage.value,
        isAnonymous: false,
      }, donationStore)

      // Update campaign's running total
      if (campaign.value) {
        campaign.value.current_amount += newDonation.amount
      }

      // Refresh donation list shown in Donors tab
      await getDonations(fraId.value)

      donateSuccess.value = true
      donateMessage.value = ''

    } catch (e) {
      donateError.value = e.message
    } finally {
      isDonating.value = false
    }
  }

  function toggleFavorite() {
    if (!campaign.value) return
    const id = campaign.value.fraId
    const exists = favoriteList.value.some(f => f.fraId === id)

    favoriteList.value = exists
      ? favoriteList.value.filter(f => f.fraId !== id)
      : [...favoriteList.value, campaign.value.toJSON()]

    _saveFavorites(favoriteList.value)
    favoriteMessage.value = exists ? 'Removed from favourites' : 'Saved to favourites'
    setTimeout(() => { favoriteMessage.value = '' }, 2200)
  }

  /** True when campaign is in the favorites list */
  const isFavorited = computed(() =>
    campaign.value
      ? favoriteList.value.some(f => f.fraId === campaign.value.fraId)
      : false
  )

  /** Calculated days remaining until campaign end date */
  const daysLeft = computed(() => {
    if (!campaign.value?.endDate) return 0
    const end  = new Date(campaign.value.endDate)
    const diff = Math.ceil((end - Date.now()) / 86_400_000)
    return Math.max(diff, 0)
  })

  /** Total number of unique donors */
  const donorCount = computed(() => donations.value.length)

  /** Whether an error state exists */
  const hasError = computed(() => !!error.value)

  function _loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
    } catch {
      return []
    }
  }

  function _saveFavorites(list) {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(list))
    } catch {
    }
  }

  return {
    // State
    fraId,
    campaign,
    donations,
    error,
    isLoading,

    // Donate form state
    donateAmount,
    donateMessage,
    isDonating,
    donateSuccess,
    donateError,

    // Favorites state
    isFavorited,
    favoriteMessage,

    daysLeft,
    donorCount,
    hasError,

    getCampaignDetail,
    getDonations,

    submitDonation,
    toggleFavorite,
  }
}