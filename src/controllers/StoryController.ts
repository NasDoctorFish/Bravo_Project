import { StoryModel } from '../models/Story.ts'
import { ActivityViewLogModel } from '../models/ActivityViewLog.ts'
import { supabase } from '../lib/supabaseClient'


export async function getTotalViews(
  fraId: string
): Promise<number> {


  const stories = await StoryModel.readByFra(fraId)


  const logs = await ActivityViewLogModel.getActivityViewLogData()


  const totalViews = logs.filter(
    log =>
      log.eventType === 'VIEW' &&
      stories.some(
        story => story.storyId === log.targetId
      )
  ).length


  return totalViews
}


export async function getFirstFraId(): Promise<string> {
  const { data, error } = await supabase
    .from('FundRaisingActivity')
    .select('fraId')
    .limit(1)
    .single()


  if (error || !data) {
    console.error(error)
    return ''
  }


  return data.fraId
}
