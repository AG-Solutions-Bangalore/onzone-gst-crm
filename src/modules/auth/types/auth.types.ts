/** Auth module contracts. */

export type LoginPayload = {
  username: string
  password: string
}

export type AuthUser = {
  id: number
  name: string
  full_name?: string
  email?: string
  mobile?: string
  factory_id?: number | null
  user_type_id?: number
  user_status?: string
  last_login?: string
}

export type AuthSession = {
  token: string
  user: AuthUser
}

/** Raw shape returned by `POST /login`. */
export type LoginResponse = {
  UserInfo?: {
    token?: unknown
    user?: unknown
  }
}
