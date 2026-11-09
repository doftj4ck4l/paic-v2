"use client";

import { useState } from "react";
import { Check, Info, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export function EditProfileForm({
  initialName,
  initialPreferred,
}: {
  initialName: string;
  initialPreferred: string;
}) {
  const [name, setName] = useState(initialName);
  const [preferred, setPreferred] = useState(initialPreferred);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-2xl bg-[#E7F6F4] px-4 py-3.5">
        <Info className="mt-0.5 size-4 shrink-0 text-[#00786a]" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-[#3d5a63]">
          Mod demo — perubahan disimpan dalam sesi ini sahaja. Penyimpanan sebenar disambung
          bersama pangkalan data dalam Fasa 1.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Nama penuh</Label>
        <input
          id="fullName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm shadow-soft outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="preferredName">Nama panggilan</Label>
        <input
          id="preferredName"
          value={preferred}
          onChange={(e) => setPreferred(e.target.value)}
          className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm shadow-soft outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <p className="text-xs text-muted-foreground">Nama ini dipaparkan pada papan pemuka anda.</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-6 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Simpan perubahan
        </button>
        {saved && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-[#00786a]" role="status">
            <Check className="size-4" aria-hidden="true" /> Disimpan (demo)
          </p>
        )}
      </div>
    </form>
  );
}
