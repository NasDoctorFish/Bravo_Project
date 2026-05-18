import { Story } from '../models/Story.ts'
import { ActivityViewLog } from '../models/ActivityViewLog.ts'
import { supabase } from '../lib/supabaseClient'

export async function getStoryData(storyId: string, eventType: string = 'VIEW'): Promise<Story | null> {
  const res = await supabase.from('story').select('*').eq('storyid', storyId).maybeSingle()

  if (eventType === 'VIEW') {
    await supabase.from('activityviewlog').insert([{
      targetid:   Number(storyId),
      targetname: 'storyId',
      eventtype:  eventType,
      timestamp:  new Date().toISOString(),
    }])
  }

  return res.data as Story | null
}

export async function getViewDataByDateRange(startDate: string, endDate: string): Promise<ActivityViewLog[]> {
  const res = await supabase
    .from('activityviewlog')
    .select('*')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)

  return (res.data || []) as ActivityViewLog[]
}

export function calculateImpact(avls: ActivityViewLog[]): Record<string, number> {
  const impact: Record<string, number> = {}
  avls.forEach(a => {
    const key = String(a.targetId)
    impact[key] = (impact[key] || 0) + 1
  })
  return impact
}


// controllers/StoryController.ts

// BRANCH: dashboard_totalviews

// // Fetch story and log VIEW event
// export async function getStoryData(storyId: string, eventType: string = "VIEW") {
//   // 1️⃣ Fetch story details
//   const { data: story, error: storyError } = await supabase
//     .from('Story')
//     .select('*')
//     .eq('id', storyId)
//     .single();

//   if (storyError) {
//     console.error('Error fetching story:', storyError);
//     return null;
//   }

//   // 2️⃣ Log VIEW event
//   const { error: logError } = await supabase
//     .from('ActivityViewLog')
//     .insert([
//       {
//         story_id: storyId,
//         event_type: eventType,
//         created_at: new Date().toISOString()
//       }
//     ]);

//   if (logError) {
//     console.error('Error logging view event:', logError);
//   }

//   return story;
// }

// // Aggregate total views
// export async function getTotalViews(storyId: string) {
//   const { data, error } = await supabase
//     .from('ActivityViewLog')
//     .select('id', { count: 'exact' })
//     .eq('story_id', storyId)
//     .eq('event_type', 'VIEW');

//   if (error) {
//     console.error('Error fetching total views:', error);
//     return 0;
//   }

//   return data?.length || 0;
// }