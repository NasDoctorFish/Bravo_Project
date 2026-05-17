//  CONTROL — FraDetailController

import { ref, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useFavouritesController } from './FavouritesController'

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
  const { saveFavourite, removeFavourite, checkDuplicate } = useFavouritesController()
  const isFavorited     = ref(false)
  const favoriteMessage = ref('')

  async function getCampaignDetail(id) {
    error.value     = null
    isLoading.value = true
    fraId.value     = id

    try {
      const { data, error: err } = await supabase
        .from('fundraisingactivity')
        .select('*')
        .eq('fraid', Number(id))
        .single()

      if (err) throw err

      const target  = data.targetamount  ?? 0
      const current = data.currentamount ?? 0

      campaign.value = {
        ...data,
        fraId:           data.fraid,
        userId:          data.userid,
        title:           data.title,
        description:     data.description,
        createdBy:       data.createdby,
        categoryId:      data.categoryid,
        status:          data.status,
        targetAmount:    target,
        currentAmount:   current,
        startDate:       data.startdate,
        endDate:         data.enddate,
        progressPercent: target > 0
          ? Math.min(Math.round((current / target) * 100), 100)
          : 0,
        tiers: [25, 50, 100, 250],
      }
    } catch (e) {
      error.value    = e.message
      campaign.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function getDonations(id) {
    try {
      const { data, error: err } = await supabase
        .from('donation')
        .select('*')
        .eq('fraid', Number(id))
        .order('donatedat', { ascending: false })

      if (err) throw err

      donations.value = (data ?? []).map(d => ({
        donationId:    d.donationid,
        userId:        d.userid,
        fraId:         d.fraid,
        amount:        d.amount,
        displayName:   d.isanonymous ? 'Anonymous' : (d.donorname ?? 'Donor'),
        avatarInitial: d.isanonymous ? '?' : (d.donorname?.[0] ?? 'D'),
        timeAgo:       getTimeAgo(d.donatedat),
      }))
    } catch (e) {
      error.value = e.message
    }
  }

  // ADD this helper anywhere before the return
  function getTimeAgo(timestamp) {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
    if (diff < 60)   return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  async function submitDonation(userId = 'guest') {
    donateError.value   = null
    donateSuccess.value = false

    if (!donateAmount.value || donateAmount.value < 1) {
      donateError.value = 'Please enter a valid donation amount.'
      return
    }

    isDonating.value = true
    try {
      const { error: err } = await supabase
        .from('donation')
        .insert({
          userid:  Number(userId),
          fraid:   Number(fraId.value),
          amount:  donateAmount.value,
          message: donateMessage.value,
        })

      if (err) throw err

      if (campaign.value) {
        campaign.value.currentAmount  += donateAmount.value
        campaign.value.progressPercent = Math.min(
          Math.round((campaign.value.currentAmount / campaign.value.targetAmount) * 100),
          100
        )
      }

      await getDonations(fraId.value)
      donateSuccess.value = true
      donateMessage.value = ''
    } catch (e) {
      donateError.value = e.message
    } finally {
      isDonating.value = false
    }
  }
  
  async function checkFavorite(userId, fid) {
  const uid = Number(userId)
  const fraid = Number(fid)
  console.log('🔍 checkFavorite uid:', uid, 'fraid:', fraid)
  const { data } = await supabase
    .from('favourites')
    .select('favouriteid')
    .eq('userid', uid)
    .eq('fraid', fraid)
    .maybeSingle()
  isFavorited.value = !!data
}

  async function toggleFavorite(userId) {
    if (!campaign.value || !userId) {
      favoriteMessage.value = 'Please log in to save favourites.'
      setTimeout(() => { favoriteMessage.value = '' }, 2200)
      return
    }

    const uid = Number(userId)
    const fid = Number(campaign.value.fraid ?? campaign.value.fraId)

    console.log('❤️ toggleFavorite uid:', uid, 'fid:', fid)

    try {
      if (isFavorited.value) {
        const { error: err } = await supabase
          .from('favourites')
          .delete()
          .eq('userid', uid)
          .eq('fraid', fid)
        if (err) throw err
        isFavorited.value     = false
        favoriteMessage.value = 'Removed from favourites'
      } else {
        const { error: err } = await supabase
          .from('favourites')
          .insert({ userid: uid, fraid: fid })
        if (err) throw err
        isFavorited.value     = true
        favoriteMessage.value = 'Saved to favourites!'
      }
    } catch (e) {
      console.error('🔴 toggleFavorite error:', e)
      favoriteMessage.value = e.message
    }

    setTimeout(() => { favoriteMessage.value = '' }, 2200)
  }


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
    checkFavorite,
    getDonations,

    submitDonation,
    toggleFavorite,
  }
}