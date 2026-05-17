// Custom auth composable — authenticates against useraccount table, not Supabase auth service.

import { ref, computed } from 'vue'
import { login, validateSession, deleteSession } from '../controllers/authController'
import { supabase } from '../lib/supabaseClient'

interface AuthSession {
  sessionid: number
  userid:    number
  expireat:  string
}

const STORAGE_KEY = 'fr_auth'

// Module-level singleton so all components share the same reactive state
const _userid    = ref<number | null>(null)
const _userRole  = ref<string | null>(null)
const _userName = ref<string | null>(null)
const _sessionId = ref<number | null>(null)
const _ready     = ref(false)                    // true after restoreSession() finishes

const existingSessions = ref<AuthSession[]>([])  // reserved for future multi-session tracking

// Restore and validate session from localStorage on startup
async function restoreSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.userid && parsed.sessionId) {
        const valid = await validateSession(String(parsed.userid), parsed.sessionId)
        if (valid) {
          const { data: profileData, error: profileError } = await supabase
            .from('userprofile')
            .select('name, role')
            .eq('userid', parsed.userid)
            .single()

          if (profileError) {
            localStorage.removeItem(STORAGE_KEY)
            deleteSession(parsed.sessionId)
            throw profileError
          }

          _userid.value    = parsed.userid
          _userRole.value  = profileData.role
          _userName.value = profileData.name
          _sessionId.value = parsed.sessionId
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    }
  } catch { /* ignore corrupt storage */ } finally {
    _ready.value = true
  }
}

restoreSession()

export function useAuth() {
  const isLoggedIn   = computed(() => _userid.value !== null)
  const sessionReady = computed(() => _ready.value)
  // Return as string for compatibility with Supabase query params
  const userid    = computed(() => _userid.value !== null ? String(_userid.value) : null)
  const userRole  = computed(() => _userRole.value)
  const userName = computed(() => _userName.value)
  const userEmail = computed(() => null as string | null)

  async function signIn(email: string, password: string): Promise<void> {
    const result = await login(email, password)

    // Insert userid + expireat (NOT NULL) — DB auto-generates sessionid
    const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data: sessionData, error: sessionError } = await supabase
      .from('authsession')
      .insert({ userid: result.userid, expireat: expireAt })
      .select('sessionid')
      .single()

    if (sessionError) throw sessionError

    const { data: profileData, error: profileError } = await supabase
            .from('userprofile')
            .select('name, role')
            .eq('userid', result.userid)
            .single()

          if (profileError) {
            localStorage.removeItem(STORAGE_KEY)
            return
          }

    const sessionId: number = sessionData.sessionid

    _userid.value    = result.userid
    _userRole.value  = result.role
    _userName.value = profileData.name
    _sessionId.value = sessionId
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      userid:    result.userid,
      role:      result.role,
      sessionId,
    }))
  }

  async function signOut(): Promise<void> {
    if (_sessionId.value !== null) {
      await deleteSession(_sessionId.value)
    }
    _userid.value    = null
    _userRole.value  = null
    _userName.value = null
    _sessionId.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    userid,
    userEmail,
    userRole,
    userName,
    isLoggedIn,
    sessionReady,
    existingSessions,
    signIn,
    signOut,
  }
}
