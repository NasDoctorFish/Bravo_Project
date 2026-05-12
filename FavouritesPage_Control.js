//  CONTROL — FavouritesController

import { ref, computed } from 'vue'
import { Favourites }          from './Favourites.js'
import { FundRaisingActivity } from './FundRaisingActivity.js'

const favouriteStore = Favourites.loadFromStorage()

const CAMPAIGN_STORE = [
  new FundRaisingActivity({
    fraId: '1', userId: 'u1', title: 'Clean Water for Rural Schools',
    createdBy: 'Jane Doe', categoryId: 'Education', status: 'active',
    description: 'Installing water filtration in 5 rural schools to benefit over 2,000 students.',
    targetAmount: 10000, currentAmount: 7400,
    image: 'https://placehold.co/400x200/d8f3dc/2d6a4f?text=Clean+Water',
  }),
  new FundRaisingActivity({
    fraId: '2', userId: 'u2', title: 'School Supplies Drive',
    createdBy: 'Mark Tan', categoryId: 'Education', status: 'completed',
    description: 'Providing essential school supplies to underprivileged children.',
    targetAmount: 5000, currentAmount: 5000,
    image: 'https://placehold.co/400x200/ebf8ff/2b6cb0?text=Supplies',
  }),
  new FundRaisingActivity({
    fraId: '3', userId: 'u3', title: 'Medical Aid Fund',
    createdBy: 'Dr. Sarah Lim', categoryId: 'Healthcare', status: 'active',
    description: 'Supporting low-income families with medical expenses they cannot afford.',
    targetAmount: 20000, currentAmount: 9200,
    image: 'https://placehold.co/400x200/fff5f5/c53030?text=Medical+Aid',
  }),
  new FundRaisingActivity({
    fraId: '4', userId: 'u4', title: 'Reforestation Project',
    createdBy: 'GreenEarth SG', categoryId: 'Environment', status: 'active',
    description: 'Planting 10,000 trees across deforested areas in Southeast Asia.',
    targetAmount: 15000, currentAmount: 4800,
    image: 'https://placehold.co/400x200/f0fff4/276749?text=Reforestation',
  }),
  new FundRaisingActivity({
    fraId: '5', userId: 'u5', title: 'Elderly Care Program',
    createdBy: 'Community Hearts', categoryId: 'Community', status: 'pending',
    description: 'Providing daily meals and companionship visits to isolated elderly.',
    targetAmount: 8000, currentAmount: 1200,
    image: 'https://placehold.co/400x200/fffbeb/b7791f?text=Elderly+Care',
  }),
  new FundRaisingActivity({
    fraId: '6', userId: 'u6', title: 'Flood Relief Fund',
    createdBy: 'RedHand SG', categoryId: 'Disaster Relief', status: 'active',
    description: 'Emergency aid for families affected by recent flooding.',
    targetAmount: 30000, currentAmount: 22000,
    image: 'https://placehold.co/400x200/ebf8ff/2c5282?text=Flood+Relief',
  }),
]

export function useFavouritesController() {

  const userId     = ref('currentUser')
  const fraId      = ref('')

  const favourites  = ref([])
  const error       = ref(null)
  const isLoading   = ref(false)
  const confirmation = ref('')       

  function checkDuplicate(uid, fid) {
    return Favourites.exists(uid, fid, favouriteStore)
  }

  function saveFavourite(uid, fid) {
    error.value        = null
    confirmation.value = ''

    try {
      if (checkDuplicate(uid, fid)) {
        error.value = 'This campaign is already in your favourites.'
        return false
      }

      Favourites.create(uid, fid, favouriteStore)
      _refreshList(uid)
      confirmation.value = 'Campaign saved to your favourites!'
      _clearConfirmationAfterDelay()
      return true

    } catch (e) {
      error.value = e.message
      return false
    }
  }

  function removeFavourite(uid, fid) {
    error.value        = null
    confirmation.value = ''

    try {
      const removed = Favourites.delete(uid, fid, favouriteStore)

      if (!removed) {
        error.value = 'Favourite not found — it may have already been removed.'
        return
      }

      _refreshList(uid)
      confirmation.value = 'Campaign removed from your favourites.'
      _clearConfirmationAfterDelay()

    } catch (e) {
      error.value = e.message
    }
  }

  async function getFavourites(uid) {
    error.value    = null
    isLoading.value = true
    userId.value   = uid

    try {
      const records = Favourites.readByUser(uid, favouriteStore)

      if (records.length > 0) {
        _enrichAndSet(records)
        isLoading.value = false
        return
      }

      await _fetchFromApi(uid)

    } catch (e) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  /** Whether there are any saved favourites */
  const hasFavourites  = computed(() => favourites.value.length > 0)

  /** Count for the results label */
  const favouriteCount = computed(() => favourites.value.length)

  /** Whether an error is present */
  const hasError       = computed(() => !!error.value)

  /** Whether a confirmation message is showing */
  const hasConfirmation = computed(() => !!confirmation.value)

  /**
   * @param {string} uid
   */
  function _refreshList(uid) {
    const records = Favourites.readByUser(uid, favouriteStore)
    _enrichAndSet(records)
  }

  /**
   * @param {Favourites[]} records
   */
  function _enrichAndSet(records) {
    favourites.value = records.reduce((acc, fav) => {
      const campaign = FundRaisingActivity.readById(fav.fraId, CAMPAIGN_STORE)
      if (campaign) acc.push({ favourite: fav, campaign })
      return acc
    }, [])
  }

  /**
   * @param {string} uid
   */
  async function _fetchFromApi(uid) {
    const projectId   = import.meta.env?.VITE_SUPABASE_PROJECT_ID ?? ''
    const accessToken = localStorage.getItem('accessToken') ?? ''

    if (!projectId) return   // no API configured — stay with empty list

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-f9d90081/favorites`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!response.ok) {
      throw new Error(`API error ${response.status}: could not load favourites.`)
    }

    const data = await response.json()
    const campaigns = (data.campaigns ?? []).map(c => new FundRaisingActivity({
      fraId:         c.id ?? c.fraId,
      title:         c.title,
      description:   c.description,
      targetAmount:  c.goal,
      currentAmount: c.raised,
      categoryId:    c.category,
      status:        c.status,
      createdBy:     c.organizer,
      image:         c.imageUrl ?? c.image ?? '',
    }))

    campaigns.forEach(cam => {
      if (!Favourites.exists(uid, cam.fraId, favouriteStore)) {
        Favourites.create(uid, cam.fraId, favouriteStore)
      }
      if (!FundRaisingActivity.readById(cam.fraId, CAMPAIGN_STORE)) {
        CAMPAIGN_STORE.push(cam)
      }
    })

    _refreshList(uid)
  }

  function _clearConfirmationAfterDelay() {
    setTimeout(() => { confirmation.value = '' }, 2500)
  }

  return {
    // State
    userId,
    fraId,
    favourites,
    error,
    isLoading,
    confirmation,

    // Computed
    hasFavourites,
    favouriteCount,
    hasError,
    hasConfirmation,

    // Methods
    saveFavourite,
    removeFavourite,
    getFavourites,
    checkDuplicate,
  }
}