import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card.tsx"
import { cn } from "@/lib/utils.ts"

type StatTone = "default" | "success" | "accent" | "error"

const toneStyles: Record<StatTone, string> = {
  default: "bg-surface-low text-primary",
  success: "bg-secondary-container text-on-secondary-container",
  accent: "bg-tertiary-container text-on-tertiary-container",
  error: "bg-error-container text-on-error-container",
}

type StatCardProps = {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: StatTone
  /** Makes the whole card a link (e.g. drill into a filtered list). */
  to?: string
}

/** Dashboard KPI card. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  to,
}: StatCardProps) {
  const body = (
    <CardContent className="flex items-center gap-4 p-5">
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-lg",
          toneStyles[tone],
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl leading-8 font-normal tracking-tight tabular-nums">
          {value}
        </p>
        <p className="text-muted-foreground truncate text-sm">{label}</p>
        {hint && (
          <p className="text-muted-foreground truncate text-xs opacity-80">
            {hint}
          </p>
        )}
      </div>
      {to && (
        <ChevronRight className="text-muted-foreground ml-auto size-4 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
      )}
    </CardContent>
  )

  if (!to) return <Card>{body}</Card>
  return (
    <Link
      to={to}
      className="group block h-full"
      aria-label={`${label}: ${value}`}
    >
      <Card className="h-full transition-shadow duration-150 hover:shadow-md">
        {body}
      </Card>
    </Link>
  )
}
