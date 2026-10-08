import axios from "axios"
import { apiClient, BASE_URL } from "@/lib/axios.ts"
import type {
  AuthSession,
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
  PasswordActionResponse,
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

/**
 * `POST /send-password` — public forgot-password endpoint (no auth header).
 * FormData `{ email, username }` → `{ code: 200, msg }` on success,
 * `{ code: 400, msg }` on failure.
 */
export async function sendPasswordRequest(
  email: string,
  username: string,
): Promise<PasswordActionResponse> {
  const formData = new FormData()
  formData.append("email", email)
  formData.append("username", username)
  const { data } = await axios.post<PasswordActionResponse>(
    `${BASE_URL}/send-password`,
    formData,
  )
  return data
}

/**
 * `POST /change-password` — JSON `{ username, old_password, password }`.
 * Bearer token is attached by the `apiClient` interceptor.
 */
export async function changePasswordRequest(
  payload: ChangePasswordPayload,
): Promise<PasswordActionResponse> {
  const { data } = await apiClient.post<PasswordActionResponse>(
    "/change-password",
    payload,
  )
  return data
}
