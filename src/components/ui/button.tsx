import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * DESIGN.md — button-primary: bg #171717, white text, full radius, h-10.
 * button-secondary: transparent + 1px outline border, DEFAULT radius.
 * button-tertiary: transparent, low emphasis.
 */
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground rounded-full hover:bg-primary-container hover:text-on-primary-container shadow-none",
        secondary:
          "bg-transparent text-primary border border-outline rounded-md hover:bg-surface-low",
        outline:
          "bg-transparent text-primary border border-outline rounded-md hover:bg-surface-low",
        tertiary:
          "bg-transparent text-primary rounded-md hover:bg-surface-lowest px-3",
        ghost: "bg-transparent text-primary rounded-md hover:bg-surface-low",
        success:
          "bg-secondary text-on-secondary rounded-full hover:brightness-95",
        accent:
          "bg-tertiary text-on-tertiary rounded-full hover:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground rounded-full hover:brightness-95",
        link: "text-primary underline-offset-4 hover:underline px-0",
      },
      size: {
        default: "h-10 px-6 py-2 text-sm", // 12px 24px, label-md
        sm: "h-8 px-4 py-1 text-[13px] rounded-full",
        lg: "h-11 px-8 py-2 text-sm rounded-full",
        icon: "h-10 w-10 rounded-full",
        inline: "h-auto px-3 py-2 text-base", // tertiary
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
