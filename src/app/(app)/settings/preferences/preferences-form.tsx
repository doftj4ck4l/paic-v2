"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

function Toggle({
  id,
  label,
  description,
  defaultOn = false,
}: {
  id: string;
  label: string;
  description: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4">
      <div className="min-w-0">
        <p className="text-sm font-bold">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn((v) => !v)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          on ? "bg-[#00b6a2]" : "bg-[#d5d9ea]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-6 rounded-full bg-white shadow transition-all",
            on ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function PreferencesForm() {
  const [language, setLanguage] = useState<"bm" | "en">("bm");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-2xl bg-[#E7F6F4] px-4 py-3.5">
        <Info className="mt-0.5 size-4 shrink-0 text-[#00786a]" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-[#3d5a63]">
          Mod demo — keutamaan disimpan dalam sesi ini sahaja. Penyimpanan sebenar dalam Fasa 1.
        </p>
      </div>

      <fieldset>
        <legend className="text-sm font-bold">Bahasa antara muka</legend>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {(
            [
              { id: "bm", title: "Bahasa Melayu", sub: "Lalai" },
              { id: "en", title: "English", sub: "Pilihan" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setLanguage(option.id)}
              aria-pressed={language === option.id}
              className={cn(
                "rounded-2xl border p-4 text-left transition-colors",
                language === option.id
                  ? "border-[#00b6a2] bg-[#f2fbf9]"
                  : "border-border bg-background hover:border-[#bfe9e2]",
              )}
            >
              <span className="block text-sm font-bold">{option.title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{option.sub}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2.5">
        <h2 className="text-sm font-bold">Kebolehcapaian</h2>
        <Toggle
          id="reduced-motion"
          label="Kurangkan gerakan"
          description="Matikan animasi hiasan seperti objak terapung."
        />
        <Toggle
          id="larger-text"
          label="Teks lebih besar"
          description="Tingkatkan saiz teks untuk bacaan lebih selesa."
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <h2 className="text-sm font-bold">Pemberitahuan</h2>
        <Toggle id="notif-quizzes" label="Kuiz & tarikh akhir" description="Peringatan kuiz baharu dan hampir tamat." defaultOn />
        <Toggle id="notif-subjects" label="Pengumuman subjek" description="Notis daripada guru dan sekolah." defaultOn />
        <Toggle id="notif-creations" label="Penjanaan bahan" description="Maklumkan apabila nota, kuiz atau slaid siap dijana." />
      </div>
    </div>
  );
}
