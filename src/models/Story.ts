import { supabase } from '../lib/supabaseClient'


export interface Story {
  storyId: string
  fraId: string
  title: string
  content: string
  createdAt: string
  status: string
}


export class Story {
  static async readByFra(fraId: string): Promise<Story[]> {
    const { data, error } = await supabase
      .from('story')
      .select('*')
      .eq('fraid', fraId)


    if (error) {
      console.error(error)
      return []
    }


    return data as Story[]
  }
}
