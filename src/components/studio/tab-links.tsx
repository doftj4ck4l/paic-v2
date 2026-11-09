"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TabLinks({
  items,
  className,
}: {
  items: { href: string; label: string; count?: number }[];
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Sub-navigasi"
      className={cn(
        "mb-6 flex flex-wrap gap-1.5 rounded-full border border-border bg-card p-1.5",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-gradient-to-r from-[#007a66] to-[#00856f] text-white"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {item.label}
            {typeof item.count === "number" && (
              <span className={cn("ml-1.5 text-xs", isActive ? "text-white/75" : "text-muted-foreground/70")}>
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
