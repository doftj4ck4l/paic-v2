"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check, Sparkles, UserRound, Users } from "lucide-react";
import { NOTIFICATIONS, type DemoNotification } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const ICONS = {
  assignment: Bell,
  class: Users,
  creation: Sparkles,
  account: UserRound,
} as const;

export function NotificationList() {
  const [items, setItems] = useState<DemoNotification[]>(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {unread > 0 ? `${unread} belum dibaca` : "Semua sudah dibaca"}
        </p>
        <button
          type="button"
          onClick={markAllRead}
          disabled={unread === 0}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-xs font-semibold shadow-soft hover:bg-secondary disabled:opacity-50"
        >
          <Check className="size-3.5" aria-hidden="true" /> Tanda semua dibaca
        </button>
      </div>

      <ul className="flex flex-col gap-2.5">
        {items.map((n) => {
          const Icon = ICONS[n.kind];
          return (
            <li
              key={n.id}
              className={cn(
                "flex items-start gap-3.5 rounded-[20px] border p-4 shadow-soft",
                n.read ? "border-border bg-card" : "border-[#bfe9e2] bg-[#f7fdfc]",
              )}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{n.title}</p>
                  {!n.read && <span className="size-2 rounded-full bg-[#00b6a2]" aria-label="Belum dibaca" />}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
                <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">{n.time}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted-foreground">
        Pemberitahuan disimpan dalam demo ini sahaja ·{" "}
        <Link href="/settings/preferences" className="font-semibold text-[#00786a] hover:underline">
          urus keutamaan
        </Link>
      </p>
    </div>
  );
}
