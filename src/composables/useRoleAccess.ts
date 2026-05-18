// src/composables/useRoleAccess.ts
// Role access helpers — always uses useAuth() as the single source of truth.
// Roles in DB: UA (User Admin), PM (Platform Manager), DO (Donee), DR (Donor)

import { computed } from 'vue'
import { useAuth } from './useAuth'
import { useRouter } from 'vue-router'

export type AppRole = 'UA' | 'PM' | 'DO' | 'DR'

export function useRoleAccess() {
  const { userRole, isLoggedIn, sessionReady } = useAuth()
  const router = useRouter()

  // ── Predicates ──────────────────────────────────────────────────────────────

  const isUA = computed(() => userRole.value === 'UA')
  const isPM = computed(() => userRole.value === 'PM')
  const isDO = computed(() => userRole.value === 'DO')
  const isDR = computed(() => userRole.value === 'DR')

  /**
   * Returns true when the current user has at least one of the given roles.
   * Always returns false if the session is not yet ready or the user is not
   * logged in.
   */
  function canAccess(...roles: AppRole[]): boolean {
    if (!sessionReady.value || !isLoggedIn.value) return false
    return roles.includes(userRole.value as AppRole)
  }

  /**
   * Checks that the current user has one of `roles`. If not, redirects
   * unauthenticated visitors to /login and unauthorised users to /.
   *
   * Call this inside a watch(sessionReady, …, { immediate: true }) block so
   * it runs once the session promise resolves.
   *
   * @returns true when the user is allowed, false when they were redirected.
   */
  function requireRole(...roles: AppRole[]): boolean {
    if (!sessionReady.value) return false   // not ready yet — defer

    if (!isLoggedIn.value) {
      router.push('/login')
      return false
    }

    if (!roles.includes(userRole.value as AppRole)) {
      router.push('/')
      return false
    }

    return true
  }

  return {
    isUA,
    isPM,
    isDO,
    isDR,
    canAccess,
    requireRole,
  }
}
