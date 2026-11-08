import * as React from "react";
import { cn } from "@/lib/utils";

const CHECK_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E\")";

function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "size-5 shrink-0 appearance-none rounded-md border border-input bg-card bg-center bg-no-repeat shadow-soft transition-colors",
        "checked:border-primary checked:bg-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={{ backgroundImage: CHECK_SVG, backgroundSize: "12px" }}
      {...props}
    />
  );
}

export { Checkbox };
