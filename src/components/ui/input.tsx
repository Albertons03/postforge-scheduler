import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Mobile-first sizing
          "flex h-12 md:h-10 w-full rounded-md",
          "border border-input bg-background",
          "px-4 py-3 md:py-2",
          "text-base md:text-sm", // 16px on mobile prevents iOS zoom
          "ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "min-h-[48px] md:min-h-[40px]", // Explicit touch targets
          "touch-action-manipulation", // Improves touch responsiveness
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
