console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase ANON Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL
const supabasePublicKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublicKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabasePublicKey)