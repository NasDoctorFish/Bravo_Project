// src/controllers/authController.ts
import { supabase } from '../lib/supabaseClient'

export let userid: number
export let password: string = ''
export let isAdmin: boolean = false

export async function create(
  name: string,
  role: string,
  password: string,
  email?: string // Optional
): Promise<number> {
  
  // System validates all fields are filled in
  if (
    !name.trim() ||
    !role.trim() ||
    !password.trim()
  ) {
    throw new Error('Incorrect format data: All required fields must be filled.')
  }

  // System validates duplicates
  const { data, error: accountError } = await supabase
    .from('useraccount')
    .insert([
      {
        email: email?.trim() || null,
        password: password
      }
    ])
    .select('userid')
    .single()

  if (accountError) {
    // If Duplicate emails detected
    if (accountError.code === '23505') throw new Error('Account already exists')
    throw accountError
  }

  const newId = data.userid

  // Insert Name and Role to userprofile 
  const { error: profileError } = await supabase
    .from('userprofile')
    .insert([
      {
        userid: newId,
        name: name.trim(),
        role: role
      }
    ])

  if (profileError) throw profileError

  return newId
}

export async function validateUser(id: number, pass: string): Promise<boolean> {
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

export async function validateSession(id: number, sessionId: string): Promise<boolean> {
  if (!id || !sessionId) return false
  return true
}