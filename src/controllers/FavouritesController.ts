//  CONTROL — FavouritesController

import { supabase } from '../lib/supabaseClient'
import { ref, computed } from 'vue'
import type { FundRaisingActivity } from '../models/FundRaisingActivity'

// ── Types ──────────────────────────────────────────────────────────────────

interface FavouriteRecord {
  favouriteid: string
  userid:      string
  fraid:       string | number
  savedat?:    string
}

interface FavouriteItem {
  favourite: FavouriteRecord
  campaign:  FundRaisingActivity & { progressPercent: number }
}

// ── Standalone queries ─────────────────────────────────────────────────────

export async function retrieveFundRaisingActivity(): Promise<FundRaisingActivity[]> {
  const { data, error } = await supabase.from('fundraisingactivity').select('*')
  if (error) throw error
  return data as FundRaisingActivity[]
}

export async function retrieveFavourites(userId: string): Promise<FavouriteRecord[]> {
  const { data, error } = await supabase
    .from('favourites')
    .select('*')
    .eq('userid', userId)
  if (error) throw error
  return (data ?? []) as FavouriteRecord[]
}

// ── Composable ─────────────────────────────────────────────────────────────

export function useFavouritesController() {
  const userId       = ref('currentUser')
  const favourites   = ref<FavouriteItem[]>([])
  const error        = ref<string | null>(null)
  const isLoading    = ref(false)
  const confirmation = ref('')

  async function checkDuplicate(uid: string, fid: string | number): Promise<boolean> {
    const { data } = await supabase
      .from('favourites')
      .select('favouriteid')
      .eq('userid', uid)
      .eq('fraid', fid)
      .maybeSingle()
    return !!data
  }

  async function saveFavourite(uid: string, fid: string | number): Promise<boolean> {
    error.value        = null
    confirmation.value = ''
    try {
      const duplicate = await checkDuplicate(uid, fid)
      if (duplicate) {
        error.value = 'This campaign is already in your favourites.'
        return false
      }
      const { error: err } = await supabase
        .from('favourites')
        .insert({ userid: Number(uid), fraid: Number(fid) })
      if (err) throw err
      await getFavourites(uid)
      confirmation.value = 'Campaign saved to your favourites!'
      _clearConfirmationAfterDelay()
      return true
    } catch (e: any) {
      error.value = e.message
      return false
    }
  }

  async function removeFavourite(uid: string, fid: string | number): Promise<void> {
    error.value        = null
    confirmation.value = ''
    try {
      const { error: err } = await supabase
        .from('favourites')
        .delete()
        .eq('userid', uid)
        .eq('fraid', fid)
      if (err) throw err
      await getFavourites(uid)
      confirmation.value = 'Campaign removed from your favourites.'
      _clearConfirmationAfterDelay()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function getFavourites(uid: string): Promise<void> {
    error.value     = null
    isLoading.value = true

    userId.value = uid

    try {
      // Fetch favourites for this user
      const { data: favRows, error: favErr } = await supabase
        .from('favourites')
        .select('*')
        .eq('userid', uid)
        .order('savedat', { ascending: false })
      if (favErr) throw favErr

      if (!favRows || favRows.length === 0) {
        favourites.value = []
        return
      }

      // Fetch the corresponding campaigns in one query
      const fraIds = favRows.map((f: any) => f.fraid)
      const { data: campaigns, error: camErr } = await supabase
        .from('fundraisingactivity')
        .select('*')
        .in('fraid', fraIds)

      const campaignMap = new Map((campaigns ?? []).map((c: any) => [String(c.fraid), c]))

      favourites.value = favRows.map((f: any) => {
        const cam = campaignMap.get(String(f.fraid)) as any ?? {}
        const target  = cam.targetamount  ?? 0
        const current = cam.currentamount ?? 0
        const progressPercent = target > 0
          ? Math.min(Math.round((current / target) * 100), 100)
          : 0
        return {
          favourite: {
            favouriteid: f.favouriteid,
            userid:      f.userid,
            fraid:       f.fraid,
            savedat:     f.savedat,
          } as FavouriteRecord,
          campaign: {
            ...cam,
            // map to camelCase so template works
            fraId:           cam.fraid,
            userId:          cam.userid,
            title:           cam.title,
            description:     cam.description,
            createdBy:       cam.createdby,
            categoryId:      cam.categoryid,
            status:          cam.status,
            targetAmount:    target,
            currentAmount:   current,
            startDate:       cam.startdate,
            endDate:         cam.enddate,
            image:           cam.image ?? null,
            progressPercent,
          },
        }
      })
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  const hasFavourites   = computed(() => favourites.value.length > 0)
  const favouriteCount  = computed(() => favourites.value.length)
  const hasError        = computed(() => !!error.value)
  const hasConfirmation = computed(() => !!confirmation.value)

  function _clearConfirmationAfterDelay() {
    setTimeout(() => { confirmation.value = '' }, 2500)
  }

  return {
    userId,
    favourites,
    error,
    isLoading,
    confirmation,
    hasFavourites,
    favouriteCount,
    hasError,
    hasConfirmation,
    saveFavourite,
    removeFavourite,
    getFavourites,
    checkDuplicate,
  }
}
