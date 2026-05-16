import { createClient } from '@supabase/supabase-js'


const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string
const supabasePublicKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string


if (!supabaseUrl || !supabasePublicKey) {
  throw new Error('Missing Supabase environment variables')
}


export const supabase = createClient(supabaseUrl, supabasePublicKey)


// Sign In
// export async function signUpNewUser(email: string, ) {
//   const { data, error } = await supabase.auth.signUp({
//     email: 'valid.email@supabase.io',
//     password: 'example-password',
//     options: {
//       emailRedirectTo: 'localhost/home',
//     },
//   })
// }
