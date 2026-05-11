import {supabase} from '../lib/supabaseClient'


export interface ActivityViewLog {
  activityId: string
  targetId: string
  targetName: string
  timestamp: string
  sourceData: string
  eventType: string
}


export class ActivityViewLogModel {
  static async getActivityViewLogData(): Promise<ActivityViewLog[]> {
    const { data, error } = await supabase
      .from('ActivityViewLog')
      .select('*')


    if (error) {
      console.error(error)
      return []
    }


    return data as ActivityViewLog[]
  }
}
