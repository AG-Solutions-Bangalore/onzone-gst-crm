import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/modules/auth/hooks/use-auth.tsx"

/** Route guard — redirects anonymous users to `/login` (with return path). */
export function RequireAuth({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    )
  }
  return children
}
