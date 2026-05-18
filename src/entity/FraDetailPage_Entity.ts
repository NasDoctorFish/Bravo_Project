//  ENTITY + CONTROLLER — FraDetailPage

import { ref, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../composables/useAuth'

// ── DB → App mappers (DB columns are all lowercase) ────────────────────────

function mapCampaignRow(row: any): any {
  return {
    fraId:          row.fraid,
    userId:         row.userid,
    title:          row.title          ?? '',
    description:    row.description    ?? '',
    targetAmount:   row.targetamount   ?? 0,
    currentAmount:  row.currentamount  ?? 0,
    status:         row.status         ?? '',
    createdBy:      row.createdby      ?? '',
    categoryId:     row.categoryid     ?? '',
    createdAt:      row.createdat,
    name:           row.name,
    image:          row.image,
    endDate:        row.enddate,
    tiers:          row.tiers,
    progressPercent: 0,
  }
}

function mapDonationRow(row: any): DonationData {
  return {
    donationId:  row.donationid,
    userId:      row.userid      ?? '',
    fraId:       row.fraid,
    amount:      row.amount,
    donatedAt:   row.donatedat,
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

interface DonationData {
  donationId?:  string
  userId?:      string
  fraId?:       string | number
  amount?:      number | string
  donatedAt?:   Date | string
  donorName?:   string
  message?:     string
  isAnonymous?: boolean
}

interface CampaignRow {
  fraId:          string | number
  userId:         string | number
  title:          string
  description:    string
  targetAmount:   number
  currentAmount:  number
  status:         string
  createdBy:      string
  categoryId:     string | number
  createdAt?:     string
  name?:          string
  image?:         string
  endDate?:       string
  tiers?:         number[]
  progressPercent: number
}

// ── ENTITY ─────────────────────────────────────────────────────────────────

export class Donation {
  donationId:  string
  userId:      string
  fraId:       string
  amount:      number
  donatedAt:   Date
  donorName:   string
  message:     string
  isAnonymous: boolean

  constructor(data: DonationData = {}) {
    this.donationId  = data.donationId  ?? String(Date.now() + Math.random())
    this.userId      = data.userId      ?? ''
    this.fraId       = String(data.fraId ?? '')
    this.amount      = Number(data.amount ?? 0)
    this.donatedAt   = data.donatedAt ? new Date(data.donatedAt) : new Date()
    this.donorName   = data.donorName   ?? 'Anonymous'
    this.message     = data.message     ?? ''
    this.isAnonymous = data.isAnonymous ?? false
  }

  static validate(data: Partial<DonationData>): void {
    if (!data.fraId || !String(data.fraId).trim())
      throw new Error('A campaign (fraId) must be linked to this donation.')
    if (!data.userId || !String(data.userId).trim())
      throw new Error('A donor (userId) must be identified for this donation.')
    if (!data.amount || Number(data.amount) <= 0)
      throw new Error('Donation amount must be greater than zero.')
    if (Number(data.amount) > 1_000_000)
      throw new Error('Donation amount cannot exceed $1,000,000 per transaction.')
  }

  get displayName(): string {
    return this.isAnonymous ? 'Anonymous' : this.donorName
  }

  get avatarInitial(): string {
    return this.displayName[0]?.toUpperCase() ?? '?'
  }

  get timeAgo(): string {
    const diffMs  = Date.now() - this.donatedAt.getTime()
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
      userId:      this.userId,
      fraId:       this.fraId,
      amount:      this.amount,
      donatedAt:   this.donatedAt.toISOString(),
      donorName:   this.donorName,
      message:     this.message,
      isAnonymous: this.isAnonymous,
    }
  }
}

// ── CONTROLLER COMPOSABLE ──────────────────────────────────────────────────

export function useFraDetailController() {
  const { userId: authUserId, isLoggedIn } = useAuth()

  const fraId      = ref('')
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
    fraId.value     = id

    try {
      const { data, error: err } = await supabase
        .from('fundraisingactivity')
        .select('*')
        .eq('fraid', id)
        .maybeSingle()

      if (err) throw err
      if (!data) throw new Error(`Campaign "${id}" was not found.`)

      const mapped = mapCampaignRow(data)
      campaign.value = {
        ...mapped,
        progressPercent: mapped.targetAmount > 0
          ? Math.min(Math.round((mapped.currentAmount / mapped.targetAmount) * 100), 100)
          : 0,
      }

      // Check if current user has favourited this campaign
      if (isLoggedIn.value && authUserId.value) {
        const { data: fav } = await supabase
          .from('favourites')
          .select('favouriteid')
          .eq('userid', Number(authUserId.value))
          .eq('fraid', Number(id))
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
      donations.value = (data ?? []).map((d: any) => new Donation(mapDonationRow(d)))
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function submitDonation(userId = 'guest'): Promise<void> {
    donateError.value   = null
    donateSuccess.value = false

    try {
      Donation.validate({ fraId: fraId.value, userId, amount: donateAmount.value })
    } catch (e: any) {
      donateError.value = e.message
      return
    }

    isDonating.value = true
    try {
      const actualUserId = authUserId.value ?? userId

      const { error: err } = await supabase
        .from('donation')
        .insert({
          userid:    Number(actualUserId),
          fraid:     Number(fraId.value),
          amount:    donateAmount.value,
          donatedat: new Date().toISOString(),
        })

      if (err) throw err

      if (campaign.value) {
        campaign.value.currentAmount += donateAmount.value
        campaign.value.progressPercent = campaign.value.targetAmount > 0
          ? Math.min(Math.round((campaign.value.currentAmount / campaign.value.targetAmount) * 100), 100)
          : 0
      }

      await getDonations(fraId.value)
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

    const id = String(campaign.value.fraId)
    if (!isLoggedIn.value || !authUserId.value) {
      favoriteMessage.value = 'Please log in to save favourites'
      setTimeout(() => { favoriteMessage.value = '' }, 2200)
      return
    }

    if (_isFavorited.value) {
      await supabase.from('favourites').delete().eq('userid', Number(authUserId.value)).eq('fraid', Number(id))
      _isFavorited.value    = false
      favoriteMessage.value = 'Removed from favourites'
    } else {
      await supabase.from('favourites').insert({ userid: Number(authUserId.value), fraid: Number(id) })
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
    getDonations,
    submitDonation,
    toggleFavorite,
  }
}
