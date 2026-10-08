import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { useAuth } from "@/modules/auth/hooks/use-auth.tsx"

type LocationState = { from?: string }

/** Username + password form wired to the auth session. */
export function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [touched, setTouched] = React.useState(false)

  const from = (location.state as LocationState | null)?.from ?? "/"
  const usernameError =
    touched && !username.trim() ? "Username is required." : null
  const passwordError =
    touched && !password ? "Password is required." : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!username.trim() || !password) return
    try {
      const session = await login({ username: username.trim(), password })
      toast.success(`Welcome back, ${session.user.name}.`)
      navigate(from, { replace: true })
    } catch {
      // loginError from useAuth is rendered inline below.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="login-username"
          className="text-sm leading-5 font-medium"
        >
          Username
        </label>
        <Input
          id="login-username"
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

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="text-sm leading-5 font-medium"
          >
            Password
          </label>
          <Link
            to="/forgot-password"
            className="text-primary text-xs leading-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
            aria-invalid={passwordError ? true : undefined}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {passwordError && (
          <p className="text-error text-xs leading-4">{passwordError}</p>
        )}
      </div>

      {loginError && (
        <p
          role="alert"
          className="bg-error-container text-on-error-container rounded-md px-3 py-2 text-sm leading-5"
        >
          {loginError}
        </p>
      )}

      <Button type="submit" disabled={isLoggingIn} className="w-full">
        {isLoggingIn && <Loader2 className="size-4 animate-spin" />}
        {isLoggingIn ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  )
}
