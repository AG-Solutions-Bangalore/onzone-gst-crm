import { Navigate } from "react-router-dom"
import { ThemeToggle } from "@/components/theme-toggle.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { LoginForm } from "@/modules/auth/components/login-form.tsx"
import { useAuth } from "@/modules/auth/hooks/use-auth.tsx"

/** Public `/login` route — centered card, redirects when signed in. */
export function LoginPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-sm font-bold">
            O
          </span>
          <span className="text-sm font-medium tracking-tight">
            OnZone GST CRM
          </span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <Badge variant="muted" className="w-fit">
              Sign in
            </Badge>
            <CardTitle className="pt-1">Welcome back</CardTitle>
            <CardDescription>
              Sign in with your workspace credentials to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
