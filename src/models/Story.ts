import { supabase } from '../lib/supabaseClient'


export interface Story {
  storyId: string
  fraId: string
  title: string
  content: string
  createdAt: string
}


export class StoryModel {
  static async readByFra(fraId: string): Promise<Story[]> {
    const { data, error } = await supabase
      .from('Story')
      .select('*')
      .eq('fraId', fraId)


    if (error) {
      console.error(error)
      return []
    }


    return data as Story[]
  }
}
