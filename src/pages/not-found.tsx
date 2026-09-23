import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button.tsx"

/** Catch-all route — unknown paths land here. */
export function NotFoundPage() {
  return (
    <section className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-[64px] leading-none font-normal tracking-tight">404</p>
      <p className="text-muted-foreground max-w-sm text-base">
        This page doesn&apos;t exist or was moved. Head back to the dashboard
        to continue.
      </p>
      <Button asChild>
        <Link to="/">Go to dashboard</Link>
      </Button>
    </section>
  )
}
