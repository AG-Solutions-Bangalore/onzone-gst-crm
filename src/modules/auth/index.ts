/** Public surface of the auth module. */

export { loginRequest, sendPasswordRequest, changePasswordRequest } from "@/modules/auth/api/auth.api.ts"
export { clearSession, loadSession, saveSession } from "@/modules/auth/api/session.ts"
export { AuthSessionWatcher } from "@/modules/auth/components/auth-session-watcher.tsx"
export { ChangePasswordDialog } from "@/modules/auth/components/change-password-dialog.tsx"
export { LoginForm } from "@/modules/auth/components/login-form.tsx"
export { RequireAuth } from "@/modules/auth/components/require-auth.tsx"
export { AuthProvider, useAuth } from "@/modules/auth/hooks/use-auth.tsx"
export { ForgotPasswordPage } from "@/modules/auth/pages/forgot-password-page.tsx"
export { LoginPage } from "@/modules/auth/pages/login-page.tsx"
export type {
  AuthSession,
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
  PasswordActionResponse,
} from "@/modules/auth/types/auth.types.ts"
