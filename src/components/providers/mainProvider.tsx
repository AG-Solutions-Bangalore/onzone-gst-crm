import type * as React from "react"
import { AppToaster } from "@/components/app-toaster.tsx"
import { QueryProvider } from "@/components/query-provider.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

/**
 * Root provider composition — theme (dark/light) + React Query
 * server state + hot-toast notifications. Wrap the router with this
 * once in `main.tsx`.
 */
export function MainProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <AppToaster />
      </QueryProvider>
    </ThemeProvider>
  )
}
