import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm font-medium text-foreground shadow-soft",
        "placeholder:font-normal placeholder:text-muted-foreground",
        "transition-shadow focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:focus:ring-destructive/25",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
