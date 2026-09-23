import { NavLink, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { LayoutDashboard, LogOut, Store, X } from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import { cn } from "@/lib/utils.ts"
import { useAuth } from "@/modules/auth/index.ts"

const GROUPS = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", end: true, icon: LayoutDashboard }],
  },
  {
    label: "Registry",
    items: [{ to: "/vendors", label: "Vendors", end: false, icon: Store }],
  },
]

function SidebarNav({
  onNavigate,
  collapsed,
}: {
  onNavigate?: () => void
  collapsed?: boolean
}) {
  return (
    <div className={cn("flex flex-col gap-5", collapsed ? "px-2" : "px-3")}>
      {GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          {!collapsed && (
            <p className="text-muted-foreground px-3 pb-1 text-[11px] font-medium tracking-wider uppercase">
              {group.label}
            </p>
          )}
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              title={item.label}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-surface-low text-primary font-medium"
                    : "text-muted-foreground hover:bg-surface-lowest hover:text-foreground",
                )
              }
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </div>
  )
}

function SidebarUser({ collapsed }: { collapsed?: boolean }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    toast("Signed out.")
    navigate("/login", { replace: true })
  }

  const avatar = (
    <span
      title={user?.name ?? "User"}
      className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
    >
      {(user?.name ?? "U").charAt(0).toUpperCase()}
    </span>
  )

  const logoutButton = (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Log out"
      title="Log out"
      onClick={handleLogout}
      className="size-8 shrink-0"
    >
      <LogOut className="size-4" />
    </Button>
  )

  if (collapsed) {
    return (
      <div className="border-outline-variant/60 flex flex-col items-center gap-2 border-t p-3">
        {avatar}
        {logoutButton}
      </div>
    )
  }

  return (
    <div className="border-outline-variant/60 border-t p-3">
      <div className="bg-surface-lowest flex items-center gap-3 rounded-lg p-2.5">
        {avatar}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user?.name ?? "—"}</p>
          <p className="text-muted-foreground truncate text-xs">
            {user?.email ?? ""}
          </p>
        </div>
        {logoutButton}
      </div>
    </div>
  )
}

function SidebarContent({
  onNavigate,
  onClose,
  collapsed,
}: {
  onNavigate?: () => void
  onClose?: () => void
  collapsed?: boolean
}) {
  return (
    <>
      <div
        className={cn(
          "flex h-16 shrink-0 items-center px-5",
          collapsed ? "justify-center px-2" : "justify-between",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src="/logo.svg"
            alt="OnZone"
            className={cn("w-auto", collapsed ? "h-5 max-w-full" : "h-8 w-full")}
          />
       
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={onClose}
            className="size-8 lg:hidden"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        <SidebarNav onNavigate={onNavigate} collapsed={collapsed} />
      </div>
      <SidebarUser collapsed={collapsed} />
    </>
  )
}

type SidebarProps = {
  open: boolean
  onClose: () => void
  collapsed: boolean
}

/** Left navigation — collapsible rail on desktop, slide-over on mobile. */
export function Sidebar({ open, onClose, collapsed }: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "border-outline-variant/60 bg-card sticky top-0 hidden h-screen shrink-0 flex-col border-r transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] lg:flex",
          collapsed ? "w-[76px]" : "w-[264px]",
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      <div
        className={cn("fixed inset-0 z-40 lg:hidden", !open && "pointer-events-none")}
        aria-hidden={!open}
      >
        <div
          onClick={onClose}
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "bg-card border-outline-variant absolute inset-y-0 left-0 flex w-[280px] flex-col border-r shadow-lg transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarContent onNavigate={onClose} onClose={onClose} />
        </aside>
      </div>
    </>
  )
}
