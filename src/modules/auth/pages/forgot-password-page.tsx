import * as React from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { ArrowLeft, Loader2 } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Input } from "@/components/ui/input.tsx"
import { getApiErrorMessage } from "@/lib/axios.ts"
import { sendPasswordRequest } from "@/modules/auth/api/auth.api.ts"
import { useAuth } from "@/modules/auth/hooks/use-auth.tsx"

/** Public `/forgot-password` route — request a password reset email. */
export function ForgotPasswordPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)
  const [touched, setTouched] = React.useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const emailError =
    touched && !email.trim() ? "Email is required." : null
  const usernameError =
    touched && !username.trim() ? "Username is required." : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!email.trim() || !username.trim()) return
    setIsSending(true)
    try {
      const res = await sendPasswordRequest(email.trim(), username.trim())
      if (res.code === 200) {
        toast.success(res.msg || "Password sent to your email.")
        navigate("/login", { replace: true })
      } else {
        toast.error(res.msg || "Failed to send password. Try again.")
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsSending(false)
    }
  }

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
              Reset password
            </Badge>
            <CardTitle className="pt-1">Forgot password</CardTitle>
            <CardDescription>
              Enter your email and username — your password will be sent to
              your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="forgot-email"
                  className="text-sm leading-5 font-medium"
                >
                  Email
                </label>
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={emailError ? true : undefined}
                />
                {emailError && (
                  <p className="text-error text-xs leading-4">{emailError}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="forgot-username"
                  className="text-sm leading-5 font-medium"
                >
                  Username
                </label>
                <Input
                  id="forgot-username"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-invalid={usernameError ? true : undefined}
                />
                {usernameError && (
                  <p className="text-error text-xs leading-4">{usernameError}</p>
                )}
              </div>

              <Button type="submit" disabled={isSending} className="w-full">
                {isSending && <Loader2 className="size-4 animate-spin" />}
                {isSending ? "Sending…" : "Send password"}
              </Button>

              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link to="/login">
                  <ArrowLeft className="size-4" /> Back to sign in
                </Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
