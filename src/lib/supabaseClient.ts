// src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL
const supabasePublicKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublicKey) {
  throw new Error('Missing Supabase environment variables')
}


export const supabase = createClient(supabaseUrl, supabasePublicKey)


// Sign In
async function signUpNewUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'valid.email@supabase.io',
    password: 'example-password',
    options: {
      emailRedirectTo: 'localhost/home',
    },
  })
}