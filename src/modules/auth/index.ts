/** Public surface of the auth module. */

export { loginRequest } from "@/modules/auth/api/auth.api.ts"
export { clearSession, loadSession, saveSession } from "@/modules/auth/api/session.ts"
export { AuthSessionWatcher } from "@/modules/auth/components/auth-session-watcher.tsx"
export { LoginForm } from "@/modules/auth/components/login-form.tsx"
export { RequireAuth } from "@/modules/auth/components/require-auth.tsx"
export { AuthProvider, useAuth } from "@/modules/auth/hooks/use-auth.tsx"
export { LoginPage } from "@/modules/auth/pages/login-page.tsx"
export type {
  AuthSession,
  AuthUser,
  LoginPayload,
  LoginResponse,
} from "@/modules/auth/types/auth.types.ts"
