//FraDetailPage_Entity.ts
//  ENTITY + CONTROLLER — FraDetailPage

import { ref, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'

// ── Types ──────────────────────────────────────────────────────────────────

interface DonationData {
  donationId?:  string
  userid?:      string
  fraid?:       string | number
  amount?:      number | string
  donatedat?:   Date | string
  donorname?:   string
  message?:     string
  isAnonymous?: boolean
}

interface CampaignRow {
  fraid:          string | number
  userid:         string | number
  title:          string
  description:    string
  target_amount:   number
  current_amount:  number
  status:         string
  createdby:      string
  categoryid:     string | number
  createdat?:     string
  name?:          string
  image?:         string
  endDate?:       string
  tiers?:         number[]
  progressPercent: number
}

// ── ENTITY ─────────────────────────────────────────────────────────────────

export class Donation {
  donationId:  string
  userid:      string
  fraid:       string
  amount:      number
  donatedat:   Date
  donorname:   string
  message:     string
  isAnonymous: boolean

  constructor(data: DonationData = {}) {
    this.donationId  = data.donationId  ?? String(Date.now() + Math.random())
    this.userid      = data.userid      ?? ''
    this.fraid       = String(data.fraid ?? '')
    this.amount      = Number(data.amount ?? 0)
    this.donatedat   = data.donatedat ? new Date(data.donatedat) : new Date()
    this.donorname   = data.donorname   ?? 'Anonymous'
    this.message     = data.message     ?? ''
    this.isAnonymous = data.isAnonymous ?? false
  }

  static validate(data: Partial<DonationData>): void {
    if (!data.fraid || !String(data.fraid).trim())
      throw new Error('A campaign (fraid) must be linked to this donation.')
    if (!data.userid || !String(data.userid).trim())
      throw new Error('A donor (userid) must be identified for this donation.')
    if (!data.amount || Number(data.amount) <= 0)
      throw new Error('Donation amount must be greater than zero.')
    if (Number(data.amount) > 1_000_000)
      throw new Error('Donation amount cannot exceed $1,000,000 per transaction.')
  }

  get displayName(): string {
    return this.isAnonymous ? 'Anonymous' : this.donorname
  }

  get avatarInitial(): string {
    return this.displayName[0]?.toUpperCase() ?? '?'
  }

  get timeAgo(): string {
    const diffMs  = Date.now() - this.donatedat.getTime()
    const diffMin = Math.floor(diffMs / 60_000)
    if (diffMin < 1)   return 'Just now'
    if (diffMin < 60)  return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24)   return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay === 1) return 'Yesterday'
    return `${diffDay} days ago`
  }

  toJSON() {
    return {
      donationId:  this.donationId,
      userid:      this.userid,
      fraid:       this.fraid,
      amount:      this.amount,
      donatedat:   this.donatedat.toISOString(),
      donorname:   this.donorname,
      message:     this.message,
      isAnonymous: this.isAnonymous,
    }
  }
}

// ── CONTROLLER COMPOSABLE ──────────────────────────────────────────────────

export function useFraDetailController() {
  const fraid      = ref('')
  const campaign   = ref<CampaignRow | null>(null)
  const donations  = ref<Donation[]>([])
  const error      = ref<string | null>(null)
  const isLoading  = ref(false)

  const donateAmount  = ref(50)
  const donateMessage = ref('')
  const isDonating    = ref(false)
  const donateSuccess = ref(false)
  const donateError   = ref<string | null>(null)

  const _isFavorited    = ref(false)
  const favoriteMessage = ref('')

  async function getCampaignDetail(id: string): Promise<void> {
    error.value     = null
    isLoading.value = true
    fraid.value     = id

    try {
      const { data, error: err } = await supabase
        .from('fundraisingactivity')
        .select('*, category(categoryname)')
        .eq('fraid', id)
        .maybeSingle()

      console.log('getCampaignDetail raw:', JSON.stringify(data, null, 2))

      if (err) throw err
      if (!data) throw new Error(`Campaign "${id}" was not found.`)

      campaign.value = {
        ...data,
        progressPercent: data.target_amount > 0
          ? Math.min(Math.round((data.current_amount / data.target_amount) * 100), 100)
          : 0,
      }

      // Check if current user has favourited this campaign
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: fav } = await supabase
          .from('favourites')
          .select('favouriteId')
          .eq('userid', user.id)
          .eq('fraid', id)
          .maybeSingle()
        _isFavorited.value = !!fav
      }
    } catch (e: any) {
      error.value    = e.message
      campaign.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function getDonations(id: string): Promise<void> {
    try {
      const { data, error: err } = await supabase
        .from('donation')
        .select('*')
        .eq('fraid', id)
        .order('donatedat', { ascending: false })

      if (err) throw err
      donations.value = (data ?? []).map((d: DonationData) => new Donation(d))
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function submitDonation(userid = 'guest'): Promise<void> {
    donateError.value   = null
    donateSuccess.value = false

    try {
      Donation.validate({ fraid: fraid.value, userid, amount: donateAmount.value })
    } catch (e: any) {
      donateError.value = e.message
      return
    }

    isDonating.value = true
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const actualuserid = user?.id ?? userid

      const { error: err } = await supabase
        .from('donation')
        .insert({
          userid:      actualuserid,
          fraid:       fraid.value,
          amount:      donateAmount.value,
          donorname:   'You',
          message:     donateMessage.value,
          isanonymous: false,
          donatedat:   new Date().toISOString(),
        })

      if (err) throw err

      if (campaign.value) {
        campaign.value.current_amount += donateAmount.value
        campaign.value.progressPercent = campaign.value.target_amount > 0
          ? Math.min(Math.round((campaign.value.current_amount / campaign.value.target_amount) * 100), 100)
          : 0
      }

      await getDonations(fraid.value)
      donateSuccess.value = true
      donateMessage.value = ''
    } catch (e: any) {
      donateError.value = e.message
    } finally {
      isDonating.value = false
    }
  }

  async function toggleFavorite(): Promise<void> {
    if (!campaign.value) return

    const id = String(campaign.value.fraid)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      favoriteMessage.value = 'Please log in to save favourites'
      setTimeout(() => { favoriteMessage.value = '' }, 2200)
      return
    }

    if (_isFavorited.value) {
      await supabase.from('favourites').delete().eq('userid', user.id).eq('fraid', id)
      _isFavorited.value    = false
      favoriteMessage.value = 'Removed from favourites'
    } else {
      await supabase.from('favourites').insert({ userid: user.id, fraid: id })
      _isFavorited.value    = true
      favoriteMessage.value = 'Saved to favourites'
    }
    setTimeout(() => { favoriteMessage.value = '' }, 2200)
  }

  const isFavorited = computed(() => _isFavorited.value)

  const daysLeft = computed((): number => {
    if (!campaign.value?.endDate) return 0
    const end  = new Date(campaign.value.endDate)
    const diff = Math.ceil((end.getTime() - Date.now()) / 86_400_000)
    return Math.max(diff, 0)
  })

  const donorCount = computed(() => donations.value.length)
  const hasError   = computed(() => !!error.value)

  return {
    fraid,
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
    getDonations,
    submitDonation,
    toggleFavorite,
  }
}
