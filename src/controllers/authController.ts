// src/controllers/authController.ts
import { supabase } from '../lib/supabaseClient'
import bcrypt from "bcryptjs"; //for password hash

export async function create(
  name: string,
  role: string,
  password: string,
  email: string
): Promise<number> {
  // Validate required fields
  if (
    !name?.trim() ||
    !role?.trim() ||
    !password?.trim() ||
    !email?.trim()
  ) {
    throw new Error('Incorrect format data: All required fields must be filled.')
  }

  // Check duplicate email
  const { data: existingUser, error: checkError } = await supabase
    .from('useraccount')
    .select('email')
    .eq('email', email.trim())
    .maybeSingle()

  if (checkError) {
    throw checkError
  }

  if (existingUser) {
    throw new Error('This email is already registered.')
  }
  // hash password
  const password_hash = await hashPassword(password.trim())

  // Insert email and password into useraccount
  const { data: accountData, error: accountError } = await supabase
    .from('useraccount')
    .insert([
      {
        email: email.trim(),
        password_hash: password_hash
      }
    ])
    .select('userid')
    .single()

  if (accountError) {
  console.log('ACCOUNT INSERT ERROR FULL:', accountError)

  if (accountError.code === '23505') {
    throw new Error(accountError.message)
  }

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

  // Insert name and role into userprofile
  const { error: profileError } = await supabase
    .from('userprofile')
    .insert([
      {
        userid: newId,
        name:   name.trim(),
        role:   dbRole,
      }
    ])

  if (profileError) {
    throw profileError
  }

  return newId
}


/**
 * Clean and Delete all expired authsessions before logging in()
 * executes the sql trigger registered on supabase DB: delete_expired_authsessions()s
 */
export async function cleanupExpiredSessions() {
  
  // executes the sql trigger registered on supabase DB: delete_expired_authsessions()
  const { error } = await supabase.rpc('delete_expired_authsessions')

  if (error) {
    throw error
  }
}


export async function validateUser(id: number, pass: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('useraccount')
    .select('userid, password_hash, userprofile(role)')
    .eq('userid', id)
    .eq('password_hash', pass)
    .single()

  if (error || !data) return false
  if (data.password_hash !== pass) return false

  return true
}

const saltRounds = 10;

/**
 * Generate password hash
 */
async function hashPassword(password: string): Promise<string> {
  // Hash password before saving to database
  return await bcrypt.hash(password, saltRounds);
}

  /**
   * comparePassword
   */
export async function comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    // Compare plain password with stored hash
    return await bcrypt.compare(plainPassword, hashedPassword);
  }


// Look up user by email + password in useraccount table (no Supabase auth service)
export async function login(
  email: string,
  password: string
): Promise<{ userid: number; role: string }> {
  

  const { data: user, error } = await supabase
    .from('useraccount')
    .select('*')
    .eq('email', email.trim())
    .maybeSingle()

  if (error || !user) {
  throw new Error('Invalid email or password.')
}

const isPasswordCorrect = await comparePassword(
  password.trim(),
  user.password_hash
)

if (!isPasswordCorrect) {
  throw new Error('Invalid email or password.')
}

return { userid: user.userid, role: user.role}
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
