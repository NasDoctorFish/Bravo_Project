// Temporary auth composable — wraps Supabase session as reactive state.
// Replace with full auth flow when auth module is complete.

import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

// Module-level singleton so all components share the same reactive state
const _user = ref<User | null>(null)

// Hydrate from existing session on first import
supabase.auth.getSession().then(({ data: { session } }) => {
  _user.value = session?.user ?? null
})

// Keep in sync when auth state changes (login, logout, token refresh)
supabase.auth.onAuthStateChange((_event, session) => {
  _user.value = session?.user ?? null
})

export function useAuth() {
  const isLoggedIn = computed(() => !!_user.value)
  const userId     = computed(() => _user.value?.id ?? null)
  const userEmail  = computed(() => _user.value?.email ?? null)

  async function signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut()
  }

  return {
    user: _user,
    userId,
    userEmail,
    isLoggedIn,
    signIn,
    signOut,
  }
}
