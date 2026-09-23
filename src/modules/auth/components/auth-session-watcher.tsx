import * as React from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { AUTH_UNAUTHORIZED_EVENT } from "@/lib/axios.ts"
import { useAuth } from "@/modules/auth/hooks/use-auth.tsx"

/**
 * Listens for 401s from the axios instance and bounces the user to
 * `/login`. Render once inside the authenticated layout.
 */
export function AuthSessionWatcher() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    const handler = () => {
      logout()
      toast.error("Session expired. Please sign in again.")
      navigate("/login", { replace: true })
    }
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handler)
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handler)
  }, [logout, navigate])

  return null
}
