"use client";

import { useState } from "react";
import { Check, Info, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export function SecurityForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) {
      setError("Kata laluan baharu mesti sekurang-kurangnya 8 aksara.");
      return;
    }
    setError(null);
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setCurrent("");
    setNext("");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-2xl bg-[#E7F6F4] px-4 py-3.5">
        <Info className="mt-0.5 size-4 shrink-0 text-[#00786a]" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-[#3d5a63]">
          Mod demo — pertukaran kata laluan sebenar disambung dalam Fasa 1.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="current">Kata laluan semasa</Label>
        <input
          id="current"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm shadow-soft outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="next">Kata laluan baharu</Label>
        <input
          id="next"
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          aria-invalid={!!error}
          className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm shadow-soft outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {error && (
          <p className="text-xs font-medium text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-6 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Tukar kata laluan
        </button>
        {saved && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-[#00786a]" role="status">
            <Check className="size-4" aria-hidden="true" /> Berjaya (demo)
          </p>
        )}
      </div>
    </form>
  );
}
