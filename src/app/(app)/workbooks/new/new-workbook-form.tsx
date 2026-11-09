"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Loader2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SUBJECTS, type SubjectId } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function NewWorkbookForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState<SubjectId>("science");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3) {
      setError("Masukkan tajuk sekurang-kurangnya 3 aksara.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/workbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subjectId,
          topic: topic.trim() || description.trim(),
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        setError(payload.error ?? "Buku kerja gagal dicipta. Sila cuba lagi.");
        return;
      }
      const { id } = (await res.json()) as { id: string };
      router.push(`/workbooks/${id}`);
      router.refresh();
    } catch {
      setError("Rangkaian bermasalah. Sila cuba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex items-start gap-3 rounded-2xl bg-[#E7F6F4] px-4 py-3.5">
        <Info className="mt-0.5 size-4 shrink-0 text-[#00786a]" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-[#3d5a63]">
          Selepas dicipta, tambah sumber (fail, web, buku teks atau YouTube) di tab{" "}
          <strong>Sumber</strong> — kemudian jana nota, kuiz, slaid dan banyak lagi dengan AI.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Tajuk buku kerja</Label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="cth. Fotosintesis"
          aria-invalid={!!error}
          className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm shadow-soft outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {error && (
          <p className="text-xs font-medium text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium leading-none">Subjek</legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSubjectId(s.id)}
              aria-pressed={subjectId === s.id}
              className={cn(
                "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                subjectId === s.id
                  ? "border-transparent bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="topic">Topik (pilihan)</Label>
        <input
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="cth. Proses fotosintesis dan kepentingannya"
          className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm shadow-soft outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Penerangan (pilihan)</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Apa yang anda mahu pelajari dalam buku kerja ini?"
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm shadow-soft outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-6 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Mencipta…
            </>
          ) : (
            <>
              <Plus className="size-4" aria-hidden="true" /> Cipta buku kerja
            </>
          )}
        </button>
        <p className="text-xs text-muted-foreground">Sumber boleh ditambah selepas dicipta.</p>
      </div>
    </form>
  );
}
