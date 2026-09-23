import { ThemeProvider as NextThemesProvider } from "next-themes"
import type * as React from "react"

/** Class-based dark mode (`.dark`) wired to Tailwind v4 `@custom-variant dark`. */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
