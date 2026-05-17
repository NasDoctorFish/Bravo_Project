import { supabase } from '../lib/supabaseClient'


export interface Story {
  storyid: string
  fraid: string
  title: string
  content: string
  createdat: string
  status: string
}


export class Story {
  static async readByFra(fraid: string): Promise<Story[]> {
    const { data, error } = await supabase
      .from('Story')
      .select('*')
      .eq('fraid', fraid)


    if (error) {
      console.error(error)
      return []
    }


    return data as Story[]
  }
}
