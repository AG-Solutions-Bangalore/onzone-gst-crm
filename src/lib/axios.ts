import axios, { AxiosError } from "axios"

/** Base URL for the House of OnZone admin API. */
export const BASE_URL = "https://houseofonzone.com/admin/public/api"

/** Local-storage key for the persisted auth session. */
export const AUTH_SESSION_KEY = "onzone.auth.session"

/** Fired on window when an API call returns 401 (session expired). */
export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized"

/** Reusable axios instance — import this in every module api file. */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

export function readStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { token?: unknown }
    return typeof parsed.token === "string" ? parsed.token : null
  } catch {
    return null
  }
}

export function clearStoredSession(): void {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY)
  } catch {
    // storage unavailable — nothing to clear
  }
}

apiClient.interceptors.request.use((config) => {
  // Login carries credentials, not a token.
  if (config.url?.includes("login")) return config
  const token = readStoredToken()
  if (token) config.headers.set("Authorization", `Bearer ${token}`)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? ""
      // Bad credentials on login itself — just reject, don't nuke state.
      if (!url.includes("login")) {
        clearStoredSession()
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
      }
    }
    return Promise.reject(error)
  },
)

/** Normalize axios / server / Laravel-validation errors to one message. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: unknown
          error?: unknown
          errors?: Record<string, unknown>
        }
      | undefined
    if (data) {
      if (typeof data.message === "string" && data.message) return data.message
      if (typeof data.error === "string" && data.error) return data.error
      if (data.errors && typeof data.errors === "object") {
        const first = Object.values(data.errors).flat().find(Boolean)
        if (typeof first === "string") return first
      }
    }
    if (error.code === "ECONNABORTED") return "Request timed out. Try again."
    if (error.message === "Network Error")
      return "Cannot reach the server. Check your connection."
    if (error instanceof AxiosError && error.message)
      return error.message
  }
  if (error instanceof Error && error.message) return error.message
  return "Something went wrong. Please try again."
}
