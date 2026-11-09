"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <span className="grid size-20 place-items-center rounded-3xl bg-[#FFE9E9]">
        <AlertTriangle className="size-9 text-[#b3383e]" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">Ada masalah teknikal</h1>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        Maaf, sesuatu tidak kena semasa memuatkan halaman ini. Sila cuba lagi.
        {error.digest ? ` (Rujukan: ${error.digest})` : ""}
      </p>
      <button
        type="button"
        onClick={reset}
        className="focus-ring inline-flex h-11 items-center rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-6 text-sm font-semibold text-white shadow-soft"
      >
        Cuba lagi
      </button>
    </div>
  );
}
