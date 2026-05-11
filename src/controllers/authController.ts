// src/controllers/authController.ts
import { supabase } from '../lib/supabaseClient'

export let userid: string = ''
export let password: string = ''
export let isAdmin: boolean = false

export async function create(
  userid: string,
  name: string,
  role: string,
  password: string,
  email?: string // Optional
): Promise<boolean> {
  
  // System validates format
  if (
    !userid.trim() ||
    !name.trim() ||
    !role.trim() ||
    !password.trim()
  ) {
    throw new Error('Incorrect format data: All required fields must be filled.')
  }

  // System validates duplicates
  const { error: accountError } = await supabase
    .from('useraccount')
    .insert([
      {
        userid: userid.trim(),
        email: email?.trim() || null,
        password: password
      }
    ])

  if (accountError) {
    // If Duplicate ID detected
    if (accountError.code === '23505') throw new Error('Duplicate ID detected')
    throw accountError
  }

  // Insert Name and Role to userprofile 
  const { error: profileError } = await supabase
    .from('userprofile')
    .insert([
      {
        userid: userid.trim(),
        name: name.trim(),
        role: role
      }
    ])

  if (profileError) throw profileError

  return true
}

export async function validateUser(id: string, pass: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('useraccount')
    .select('*, userprofile(role)') 
    .eq('userid', id)
    .eq('password', pass)
    .single()

  if (error || !data) return false
  
  userid = id
  password = pass
  isAdmin = data.userprofile?.role === 'User Admin'
  return true
}

export async function validateSession(id: string, sessionId: string): Promise<boolean> {
  if (!id || !sessionId) return false
  return true
}