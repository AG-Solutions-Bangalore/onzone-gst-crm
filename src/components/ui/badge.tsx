import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** DESIGN.md badge: secondary-container bg, full radius, label-sm. */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs leading-4 font-medium whitespace-nowrap transition-colors duration-150 [&_svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "bg-secondary-container text-on-secondary-container",
        accent: "bg-tertiary-container text-on-tertiary-container",
        primary: "bg-primary text-primary-foreground",
        outline: "border border-outline text-foreground",
        muted: "bg-surface-low text-on-surface",
        success: "bg-secondary text-on-secondary",
        destructive: "bg-error-container text-on-error-container",
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
