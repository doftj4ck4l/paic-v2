"use client";

import { useState } from "react";
import { Loader2, MailCheck, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function VerifyEmailBanner({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function resend() {
    setStatus("sending");
    await authClient.sendVerificationEmail({ email, callbackURL: "/home" });
    setStatus("sent");
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-b border-[#f0e3c8] bg-[#fff8ea] px-4 py-2 text-xs text-[#7a5a1f]">
      <MailCheck className="size-3.5 shrink-0" aria-hidden="true" />
      <span>
        Sahkan emel anda — kami menghantar pautan ke <strong>{email}</strong>.
      </span>
      {status === "sent" ? (
        <span className="font-semibold text-[#00786a]">Pautan baharu dihantar ✓</span>
      ) : (
        <button
          type="button"
          onClick={resend}
          disabled={status === "sending"}
          className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-2 hover:text-[#5d4312] disabled:opacity-60"
        >
          {status === "sending" && <Loader2 className="size-3 animate-spin" aria-hidden="true" />}
          Hantar semula
        </button>
      )}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Tutup peringatan"
        className="ml-1 grid size-5 place-items-center rounded-full hover:bg-[#f5e8cd]"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
