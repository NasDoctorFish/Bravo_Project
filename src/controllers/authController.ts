// src/controllers/authController.ts
import { supabase } from '../lib/supabaseClient'
import bcrypt from 'bcryptjs'

export let userid: number
export let password: string = ''
export let isAdmin: boolean = false

export async function create(
  name: string,
  role: string,
  password: string,
  email: string
): Promise<number> {
  if (!name?.trim() || !role?.trim() || !password?.trim() || !email?.trim()) {
    throw new Error('Incorrect format data: All required fields must be filled.')
  }

  console.log('Create input:', { name, role, email })

  // Check duplicate email
  const { data: existingUser, error: checkError } = await supabase
    .from('useraccount')
    .select('email')
    .eq('email', email.trim())
    .maybeSingle()

  if (checkError) throw checkError
  if (existingUser) throw new Error('This email is already registered.')

  // Hash password
  const password_hash = await bcrypt.hash(password.trim(), 10)

  // Insert email and password into useraccount
  const { data: accountData, error: accountError } = await supabase
    .from('useraccount')
    .insert([{ email: email.trim(), password_hash }])
    .select('userid')
    .single()

  if (accountError) {
    console.log('ACCOUNT INSERT ERROR FULL:', accountError)
    if (accountError.code === '23505') throw new Error(accountError.message)
    throw accountError
  }

  if (!accountData?.userid) {
    throw new Error('User account was created, but userid was not returned.')
  }

  const newId = accountData.userid

  // Map frontend role labels to DB-accepted codes: PM, DO, DR, UA
  const roleMap: Record<string, string> = {
    fundraiser: 'DR',
    donee:      'DO',
    PM: 'PM', UA: 'UA', DO: 'DO', DR: 'DR',
  }
  const dbRole = roleMap[role.trim()]
  if (!dbRole) throw new Error('Invalid role selected.')

  const { error: profileError } = await supabase
    .from('userprofile')
    .insert([{ userid: newId, name: name.trim(), role: dbRole }])

  if (profileError) throw profileError

  return newId
}

export async function cleanupExpiredSessions() {
  const { error } = await supabase.rpc('delete_expired_authsessions')
  if (error) throw error
}

export async function validateUser(id: number, pass: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('useraccount')
    .select('userid, password_hash, userprofile(role)')
    .eq('userid', id)
    .maybeSingle()

  if (error || !data) return false

  const match = await bcrypt.compare(pass, data.password_hash)
  if (!match) return false

  userid = id
  password = pass
  isAdmin = data.userprofile?.role === 'User Admin'
  return true
}

export async function login(
  email: string,
  password: string
): Promise<{ userid: number; role: string }> {
  const { data, error } = await supabase
    .from('useraccount')
    .select('userid, password_hash, userprofile(role)')
    .eq('email', email.trim())
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Invalid email or password.')

  // Support both bcrypt hashes and legacy plain text
  let match = false
  if (data.password_hash?.startsWith('$2')) {
    match = await bcrypt.compare(password.trim(), data.password_hash)
  } else {
    match = data.password_hash === password.trim()
  }

  if (!match) throw new Error('Invalid email or password.')

  const profile = (data as any).userprofile
  const role = (Array.isArray(profile) ? profile[0]?.role : profile?.role) ?? ''

  userid = data.userid
  isAdmin = role === 'User Admin'

  return { userid: data.userid, role }
}

// Check whether a session is valid for the given user
export async function validateSession(userId: string, sessionId: number): Promise<boolean> {
  await cleanupExpiredSessions()
  if (!userId || !sessionId) return false
  const { data } = await supabase
    .from('authsession')
    .select('sessionid')
    .eq('userid', userId)
    .eq('sessionid', sessionId)
    .maybeSingle()
  return !!data
}

// Remove a session record from authsession
export async function deleteSession(sessionId: number): Promise<void> {
  await supabase.from('authsession').delete().eq('sessionid', sessionId)
}