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
const _userId    = ref<number | null>(null)
const _userRole  = ref<string | null>(null)
const _sessionId = ref<number | null>(null)
const _ready     = ref(false)                    // true after restoreSession() finishes

const existingSessions = ref<AuthSession[]>([])  // reserved for future multi-session tracking

// Restore and validate session from localStorage on startup
async function restoreSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.userId && parsed.sessionId) {
        const valid = await validateSession(String(parsed.userId), parsed.sessionId)
        if (valid) {
          _userId.value    = parsed.userId
          _userRole.value  = parsed.role   ?? null
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
  const isLoggedIn   = computed(() => _userId.value !== null)
  const sessionReady = computed(() => _ready.value)
  // Return as string for compatibility with Supabase query params
  const userId    = computed(() => _userId.value !== null ? String(_userId.value) : null)
  const userRole  = computed(() => _userRole.value)
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

    const sessionId: number = sessionData.sessionid

    _userId.value    = result.userid
    _userRole.value  = result.role
    _sessionId.value = sessionId
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      userId:    result.userid,
      role:      result.role,
      sessionId,
    }))
  }

  async function signOut(): Promise<void> {
    if (_sessionId.value !== null) {
      await deleteSession(_sessionId.value)
    }
    _userId.value    = null
    _userRole.value  = null
    _sessionId.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    userId,
    userEmail,
    userRole,
    isLoggedIn,
    sessionReady,
    existingSessions,
    signIn,
    signOut,
  }
}
