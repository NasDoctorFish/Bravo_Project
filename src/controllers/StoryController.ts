import { Story } from '../models/Story.ts'
import { ActivityViewLog } from '../models/ActivityViewLog.ts'
import { supabase } from '../lib/supabaseClient'

export async function getStoryData(storyId: string, eventType: string = 'VIEW'): Promise<Story | null> {
  if (eventType === 'VIEW') {
    await supabase.from('ActivityViewLog').insert([{ targetId: storyId, eventType, timestamp: new Date().toISOString() }])
  }

  const res = await supabase.from('FundRaisingActivity').select('*').eq('id', storyId).single()
  return res.data as Story | null
}

export async function getViewDataByDateRange(startDate: string, endDate: string): Promise<ActivityViewLog[]> {
  const res = await supabase
    .from('ActivityViewLog')
    .select('*')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)

  return (res.data || []) as ActivityViewLog[]
}

export function calculateImpact(avls: ActivityViewLog[]): Record<string, number> {
  const impact: Record<string, number> = {}
  avls.forEach(a => {
    impact[a.targetId] = (impact[a.targetId] || 0) + 1
  })
  return impact
}