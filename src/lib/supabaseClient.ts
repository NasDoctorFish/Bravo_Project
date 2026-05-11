import { createClient } from '@supabase/supabase-js'


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabasePublicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string


if (!supabaseUrl || !supabasePublicKey) {
  throw new Error('Missing Supabase environment variables')
}


export const supabase = createClient(supabaseUrl, supabasePublicKey)