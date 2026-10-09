import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** Theme-aware badge: full radius, label-sm. Works in light + dark mode. */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground border border-border",
        accent:
          "bg-info/10 text-sky-700 dark:text-info border border-info/30",
        primary: "bg-primary text-primary-foreground",
        outline: "border border-border text-foreground bg-transparent",
        muted: "bg-muted text-muted-foreground border border-border",
        success:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-600/30",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
