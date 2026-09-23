import { NavLink, Outlet } from "react-router-dom"
import toast from "react-hot-toast"

import { ThemeToggle } from "@/components/theme-toggle.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import { cn } from "@/lib/utils.ts"

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/clients", label: "Clients", end: false },
  { to: "/invoices", label: "Invoices", end: false },
]

function NavLinks({ className }: { className?: string }) {
  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "rounded-md px-3 py-2 text-sm transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
              isActive
                ? "bg-surface-low text-primary font-medium"
                : "text-muted-foreground hover:bg-surface-lowest hover:text-foreground",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

/** App shell: top bar + nav, route outlet, footer. */
export function RootLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-outline-variant/60 border-b">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-sm font-bold">
              O
            </span>
            <span className="text-sm font-medium tracking-tight">
              OnZone GST CRM
            </span>
            <Badge variant="muted" className="ml-1 hidden sm:inline-flex">
              alpha
            </Badge>
          </div>
          <NavLinks className="hidden md:flex" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={() => toast.success("Workspace deployed.")}>
              Deploy now
            </Button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1280px] px-6 pb-3 md:hidden">
          <NavLinks />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] px-6 pb-16">
        <Outlet />
      </main>

      <footer className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-2 px-6 pb-10 text-xs text-muted-foreground">
        <span>OnZone GST CRM · Technical Minimalism · DESIGN.md tokens</span>
        <span>Light / dark · Query · Table · shadcn · hot-toast</span>
      </footer>
    </div>
  )
}
