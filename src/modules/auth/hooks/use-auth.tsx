import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as React from "react"
import { getApiErrorMessage } from "@/lib/axios.ts"
import { loginRequest } from "@/modules/auth/api/auth.api.ts"
import {
  clearSession,
  loadSession,
  saveSession,
} from "@/modules/auth/api/session.ts"
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
} from "@/modules/auth/types/auth.types.ts"

type AuthContextValue = {
  session: AuthSession | null
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoggingIn: boolean
  loginError: string | null
  login: (payload: LoginPayload) => Promise<AuthSession>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

/**
 * Session provider — mount once above the router (inside `MainProvider`
 * so React Query is available). Persists the session to localStorage
 * and stays in sync across tabs.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = React.useState<AuthSession | null>(() =>
    loadSession(),
  )

  // Cross-tab sync (e.g. logout in another tab).
  React.useEffect(() => {
    const onStorage = () => setSession(loadSession())
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (next) => {
      saveSession(next)
      setSession(next)
    },
  })

  const login = React.useCallback(
    (payload: LoginPayload) => loginMutation.mutateAsync(payload),
    [loginMutation],
  )

  const logout = React.useCallback(() => {
    clearSession()
    setSession(null)
    loginMutation.reset()
    queryClient.clear()
  }, [loginMutation, queryClient])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: session !== null,
      isLoggingIn: loginMutation.isPending,
      loginError: loginMutation.error
        ? getApiErrorMessage(loginMutation.error)
        : null,
      login,
      logout,
    }),
    [session, loginMutation.isPending, loginMutation.error, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>.")
  return ctx
}
