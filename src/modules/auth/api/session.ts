import { AUTH_SESSION_KEY, clearStoredSession } from "@/lib/axios.ts"
import type { AuthSession } from "@/modules/auth/types/auth.types.ts"

/** Persisted-session helpers (localStorage). */

export function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthSession>
    if (typeof parsed.token === "string" && parsed.user) {
      return { token: parsed.token, user: parsed.user }
    }
    return null
  } catch {
    return null
  }
}

export function saveSession(session: AuthSession): void {
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
  } catch {
    // private mode etc. — session just won't survive reloads
  }
}

export { clearStoredSession as clearSession }
