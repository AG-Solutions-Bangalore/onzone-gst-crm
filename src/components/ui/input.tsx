import * as React from "react"

import { cn } from "@/lib/utils"

/** DESIGN.md input-field: surface-bright bg, DEFAULT radius, outline border, h-10. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "bg-card text-foreground placeholder:text-muted-foreground border-input focus-visible:border-ring h-10 w-full rounded-md border px-3 py-2 text-base transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
