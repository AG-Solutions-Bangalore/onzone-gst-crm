import { useTheme } from "next-themes"
import { Toaster } from "react-hot-toast"

/**
 * react-hot-toast wired to DESIGN.md tokens.
 * Colors follow the active light/dark theme via CSS variables.
 */
export function AppToaster() {
  const { resolvedTheme } = useTheme()

  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        duration: 3500,
        style: {
          background: "var(--card)",
          color: "var(--card-foreground)",
          border: "1px solid var(--outline-variant)",
          borderRadius: "12px",
          fontSize: "14px",
          boxShadow: "var(--shadow-md)",
        },
        success: {
          iconTheme: {
            primary: resolvedTheme === "dark" ? "#95bf47" : "#2d4a0f",
            secondary: resolvedTheme === "dark" ? "#0a0a0a" : "#c8e6a0",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--error)",
            secondary: "var(--on-error)",
          },
        },
      }}
    />
  )
}
