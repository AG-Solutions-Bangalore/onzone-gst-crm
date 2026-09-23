import { apiClient } from "@/lib/axios.ts"
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  LoginResponse,
} from "@/modules/auth/types/auth.types.ts"

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) return false
  const user = value as Record<string, unknown>
  return typeof user.id === "number" && typeof user.name === "string"
}

/** `POST /login` → normalized `{ token, user }` session. */
export async function loginRequest(payload: LoginPayload): Promise<AuthSession> {
  const { data } = await apiClient.post<LoginResponse>("/login", payload)

  // Server wraps the payload as `{ UserInfo: { token, user } }`.
  const info = data?.UserInfo
  const token = info?.token
  const user = info?.user

  if (typeof token !== "string" || !token || !isAuthUser(user)) {
    throw new Error("Invalid login response from server.")
  }
  return { token, user }
}
