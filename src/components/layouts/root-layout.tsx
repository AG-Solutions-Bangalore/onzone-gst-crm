import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, Menu } from "lucide-react";

import { Sidebar } from "@/components/layouts/sidebar.tsx";
import { ThemeToggle } from "@/components/theme-toggle.tsx";
import { Button } from "@/components/ui/button.tsx";
import { AuthSessionWatcher, useAuth } from "@/modules/auth/index.ts";

function pageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname === "/vendor-gst") return "Vendor GST";
  if (pathname === "/vendor-gst-details") return "Vendor GST Details";
  if (pathname === "/sync-details") return "Sync Details";
  if (pathname.startsWith("/sync-details/") || pathname.startsWith("/vendors/"))
    return "Sync Details Profile";
  if (pathname === "/vendors") return "Vendor GST";
  return "OnZone";
}

/** Dashboard shell: left sidebar + topbar + full-width content. */
export function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem("onzone.sidebar.collapsed") === "1";
    } catch {
      return false;
    }
  });
  const { pathname } = useLocation();
  const { user } = useAuth();

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("onzone.sidebar.collapsed", next ? "1" : "0");
      } catch {
        // private mode — preference just won't persist
      }
      return next;
    });
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <AuthSessionWatcher />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-background/80 sticky top-0 z-30 border-b backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={toggleCollapsed}
                className="hidden lg:inline-flex"
              >
                {collapsed ? (
                  <ChevronsRight className="size-4" />
                ) : (
                  <ChevronsLeft className="size-4" />
                )}
              </Button>
              <h1 className="truncate text-base font-medium tracking-tight">
                {pageTitle(pathname)}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <span className="text-muted-foreground hidden text-sm md:block">
                  {user.name}
                </span>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        <footer className="border-border text-muted-foreground flex flex-wrap items-center justify-between gap-2 border-t px-4 py-4 text-xs sm:px-6 lg:px-8">
          <span>
            Crafted by{" "}
            <a href="https://ag-solutions.in/" className="text-primary">
              ag-solutions
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}
