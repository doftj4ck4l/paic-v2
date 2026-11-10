"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, ClipboardCheck, ListChecks, Sparkles, UserPlus, UserRound, Users, type LucideIcon } from "lucide-react";
import type { NotificationView } from "@/lib/notifications";
import { formatRelativeTime } from "@/lib/assignment-status";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  assignment: ListChecks,
  completion: ClipboardCheck,
  join: UserPlus,
  class: Users,
  creation: Sparkles,
  account: UserRound,
};

export function NotificationList({ items }: { items: NotificationView[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const unread = items.filter((item) => !item.readAt).length;

  async function markAllRead() {
    if (busy || unread === 0) return;
    setBusy(true);
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => null);
    setBusy(false);
    router.refresh();
  }

  function markRead(id: string) {
    void fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(() => router.refresh())
      .catch(() => null);
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
          disabled={unread === 0 || busy}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-xs font-semibold shadow-soft hover:bg-secondary disabled:opacity-50"
        >
          <Check className="size-3.5" aria-hidden="true" /> Tanda semua dibaca
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Tiada pemberitahuan lagi. Aktiviti kelas dan tugasan akan muncul di sini.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((item) => {
            const Icon = ICONS[item.type] ?? Bell;
            const content = (
              <>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{item.title}</p>
                    {!item.readAt && <span className="size-2 rounded-full bg-[#00b6a2]" aria-label="Belum dibaca" />}
                  </div>
                  {item.body && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>}
                  <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">{formatRelativeTime(item.createdAt)}</p>
                </div>
              </>
            );
            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-start gap-3.5 rounded-[20px] border p-4 shadow-soft",
                  item.readAt ? "border-border bg-card" : "border-[#bfe9e2] bg-[#f7fdfc]",
                )}
              >
                {item.href ? (
                  <Link href={item.href} onClick={() => { if (!item.readAt) markRead(item.id); }} className="flex w-full items-start gap-3.5">
                    {content}
                  </Link>
                ) : (
                  <button type="button" onClick={() => { if (!item.readAt) markRead(item.id); }} className="flex w-full items-start gap-3.5 text-left">
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Pemberitahuan disimpan untuk akaun anda ·{" "}
        <Link href="/settings/preferences" className="font-semibold text-[#00786a] hover:underline">
          urus keutamaan
        </Link>
      </p>
    </div>
  );
}
