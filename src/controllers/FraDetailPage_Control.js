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

  function getTimeAgo(timestamp) {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
    if (diff < 60)   return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  async function submitDonation(userId = null) {
    donateError.value   = null
    donateSuccess.value = false

    if (!donateAmount.value || donateAmount.value < 1) {
      donateError.value = 'Please enter a valid donation amount.'
      return
    }

    const numericUserId = Number(userId)
    if (!userId || !Number.isFinite(numericUserId) || numericUserId <= 0) {
      donateError.value = 'You must be logged in to donate.'
      return
    }

    isDonating.value = true
    try {
      // 1. Insert donation record
      const { error: err } = await supabase
        .from('donation')
        .insert({
          userid:      numericUserId,
          fraid:       Number(fraId.value),
          amount:      donateAmount.value,
          donatedat:   new Date().toISOString(),
          message:     donateMessage.value || null,
          donorname:   'Anonymous',
          isanonymous: false,
        })

      if (err) throw err

      // 2. Fetch latest currentamount from DB
      const { data: fra, error: fraErr } = await supabase
        .from('fundraisingactivity')
        .select('currentamount, targetamount')
        .eq('fraid', Number(fraId.value))
        .single()

      if (fraErr) throw fraErr

      const newAmount = Number(fra.currentamount ?? 0) + donateAmount.value

      // 3. Update currentamount in DB
      const { error: updateErr } = await supabase
        .from('fundraisingactivity')
        .update({ currentamount: newAmount })
        .eq('fraid', Number(fraId.value))

      if (updateErr) throw updateErr

      // 4. Update local campaign state
      if (campaign.value) {
        const newPercent = Math.min(
          Math.round((newAmount / Number(fra.targetamount)) * 100),
          100
        )
        campaign.value = {
          ...campaign.value,
          currentAmount:   newAmount,
          progressPercent: newPercent,
        }
      }

      // 5. Refresh donations list
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
    const uid   = Number(userId)
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

  const daysLeft = computed(() => {
    if (!campaign.value?.endDate) return 0
    const end  = new Date(campaign.value.endDate)
    const diff = Math.ceil((end - Date.now()) / 86_400_000)
    return Math.max(diff, 0)
  })

  const donorCount = computed(() => donations.value.length)
  const hasError   = computed(() => !!error.value)

  return {
    fraId,
    campaign,
    donations,
    error,
    isLoading,
    donateAmount,
    donateMessage,
    isDonating,
    donateSuccess,
    donateError,
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