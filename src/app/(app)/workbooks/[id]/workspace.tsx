"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Check,
  FileText,
  Globe,
  Info,
  Layers,
  Loader2,
  MessageSquareText,
  Settings2,
  Share2,
  Sparkles,
  StickyNote,
  X,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/studio/page-header";
import { Chip } from "@/components/studio/ui";
import {
  STUDIO_TOOLS,
  SUGGESTED_QUESTIONS,
  WORKBOOK_CHAT,
  WORKBOOK_SOURCES,
  subjectById,
  type DemoSource,
  type DemoWorkbook,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type Panel = "sources" | "chat" | "studio";

const SOURCE_ICONS = { pdf: FileText, doc: FileText, note: StickyNote, web: Globe } as const;

function SourceStatus({ source }: { source: DemoSource }) {
  if (source.status === "ready") return <Chip tone="teal">Sedia</Chip>;
  if (source.status === "processing")
    return (
      <Chip tone="amber">
        <Loader2 className="size-3 animate-spin" aria-hidden="true" /> Memproses
      </Chip>
    );
  return (
    <Chip tone="red">
      <XCircle className="size-3" aria-hidden="true" /> Gagal
    </Chip>
  );
}

export function WorkbookWorkspace({
  workbook,
  initialPanel = "chat",
}: {
  workbook: DemoWorkbook;
  initialPanel?: Panel;
}) {
  const subject = subjectById(workbook.subjectId);
  const [panel, setPanel] = useState<Panel>(initialPanel);
  const [selected, setSelected] = useState<string[]>(
    WORKBOOK_SOURCES.filter((s) => s.status === "ready").map((s) => s.id),
  );
  const [activeSource, setActiveSource] = useState<DemoSource | null>(null);

  function toggleSource(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function openSourceById(id: string) {
    setActiveSource(WORKBOOK_SOURCES.find((s) => s.id === id) ?? null);
  }

  const readyCount = WORKBOOK_SOURCES.filter((s) => s.status === "ready").length;

  const sourcesPanel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold">Sumber</h2>
        <Chip tone="neutral">{WORKBOOK_SOURCES.length}</Chip>
      </div>
      <p className="border-b border-border px-4 py-2 text-[11px] leading-relaxed text-muted-foreground">
        Pilih sumber untuk dijadikan asas jawapan AI.
      </p>
      <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-3">
        {WORKBOOK_SOURCES.map((source) => {
          const Icon = SOURCE_ICONS[source.kind];
          const checked = selected.includes(source.id);
          return (
            <li
              key={source.id}
              className={cn(
                "flex items-start gap-2.5 rounded-2xl border p-3 transition-colors",
                checked && source.status === "ready"
                  ? "border-[#bfe9e2] bg-[#f4fbfa]"
                  : "border-border bg-card",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={source.status !== "ready"}
                onChange={() => toggleSource(source.id)}
                aria-label={`Guna ${source.title} sebagai asas jawapan`}
                className="mt-0.5 size-4 shrink-0 accent-[#00b6a2]"
              />
              <button type="button" onClick={() => setActiveSource(source)} className="min-w-0 flex-1 text-left">
                <span className="flex items-center gap-1.5">
                  <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate text-[13px] font-semibold leading-tight">{source.title}</span>
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <SourceStatus source={source} />
                  <span className="text-[11px] text-muted-foreground">
                    {source.sizeLabel}
                    {source.detail ? ` · ${source.detail}` : ""}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-border p-3">
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
          Muat naik fail sebenar disambung dalam Fasa 3 (storan objek + saluran pemprosesan).
        </p>
      </div>
    </div>
  );

  const chatPanel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold">Sembang Pembelajaran AI</h2>
        <Chip tone="amber">Mod demo</Chip>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
          {WORKBOOK_CHAT.map((m) =>
            m.role === "student" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-[#007a66] to-[#00856f] px-4 py-2.5 text-sm font-medium text-white">
                  {m.text}
                </p>
              </div>
            ) : (
              <div key={m.id} className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent">
                  <Sparkles className="size-4 text-accent-foreground" aria-hidden="true" />
                </span>
                <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-border bg-card p-4 shadow-soft">
                  {m.grounded && <Chip tone="teal" className="mb-2.5">Berdasarkan sumber anda</Chip>}
                  <p className="text-sm leading-relaxed">{m.text}</p>
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                      {m.citations.map((c) => (
                        <button
                          key={c.index}
                          type="button"
                          onClick={() => openSourceById(c.sourceId)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-[#00b6a2] hover:text-[#00786a]"
                        >
                          <span className="grid size-4 place-items-center rounded-full bg-[#E7F6F4] text-[9px] font-bold text-[#00786a]">
                            {c.index}
                          </span>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
      <div className="border-t border-border bg-card/60 p-3">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled
                title="Sembang AI aktif dalam Fasa 3"
                className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background py-2 pl-4 pr-2">
            <MessageSquareText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              disabled
              placeholder="Tulis soalan anda tentang sumber ini… (aktif dalam Fasa 3)"
              aria-label="Mesej kepada AI"
              className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Info className="size-3 shrink-0" aria-hidden="true" />
            Jawapan AI sebenar, sitasi dan penstriman disambung dalam Fasa 3.
          </p>
        </div>
      </div>
    </div>
  );

  const studioPanel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold">Studio Pembelajaran</h2>
        <Chip tone="neutral">
          {STUDIO_TOOLS.filter((t) => t.status === "completed").length}/{STUDIO_TOOLS.length} siap
        </Chip>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {STUDIO_TOOLS.map((tool) => {
          const completed = tool.status === "completed" && tool.artifactId;
          const inner = (
            <>
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tool.asset} alt="" width={30} height={30} className="drop-shadow-[0_5px_6px_rgba(16,17,47,0.16)]" />
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="flex items-center gap-2">
                  <span className="text-[13px] font-bold">{tool.name}</span>
                  {tool.status === "completed" && <Chip tone="teal">Selesai</Chip>}
                  {tool.status === "pending" && <Chip tone="neutral">Menunggu AI</Chip>}
                  {tool.status === "failed" && <Chip tone="red">Gagal</Chip>}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {tool.meta ?? tool.description}
                </span>
              </span>
            </>
          );
          return completed ? (
            <Link
              key={tool.id}
              href={`/creations/${tool.artifactKind}/${tool.artifactId}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-[#00b6a2]"
            >
              {inner}
            </Link>
          ) : (
            <div key={tool.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 opacity-90">
              {inner}
            </div>
          );
        })}
      </div>
      <div className="border-t border-border p-3">
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
          Penjanaan artifak AI baharu disambung dalam Fasa 4.
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      {/* Page header — identical structure to every other page */}
      <div className="px-4 pt-6 lg:px-6">
        <div className="mx-auto w-full max-w-[1240px]">
          <PageHeader
            title={workbook.title}
            description={`${subject.name} · ${workbook.teacherName} · ${readyCount} sumber sedia`}
            backHref="/workbooks"
            backLabel="Buku Kerja"
            actions={
              <>
                <button
                  type="button"
                  onClick={() => setPanel("sources")}
                  className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-xs font-semibold shadow-soft transition-colors hover:border-[#00b6a2] xl:hidden"
                >
                  <Layers className="size-3.5" aria-hidden="true" /> Sumber
                </button>
                <button
                  type="button"
                  disabled
                  title="Perkongsian buku kerja akan datang (Fasa 5)"
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-xs font-semibold text-muted-foreground opacity-60"
                >
                  <Share2 className="size-3.5" aria-hidden="true" /> Kongsi
                </button>
                <Link
                  href={`/workbooks/${workbook.id}/settings`}
                  aria-label="Tetapan buku kerja"
                  className="focus-ring grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground shadow-soft transition-colors hover:text-foreground"
                >
                  <Settings2 className="size-4" aria-hidden="true" />
                </Link>
              </>
            }
          />
        </div>
      </div>

      {/* Tabs below xl */}
      <div className="px-4 pb-2 xl:hidden">
        <div className="mx-auto flex w-full max-w-[1240px] gap-1.5 rounded-full border border-border bg-card p-1">
          {(
            [
              { id: "sources", label: `Sumber (${WORKBOOK_SOURCES.length})` },
              { id: "chat", label: "Sembang" },
              { id: "studio", label: "Studio" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPanel(t.id)}
              aria-pressed={panel === t.id}
              className={cn(
                "flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
                panel === t.id
                  ? "bg-gradient-to-r from-[#007a66] to-[#00856f] text-white"
                  : "text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panels */}
      <div id="main" className="mx-auto flex w-full max-w-[1240px] flex-1">
        <div className="hidden w-[300px] shrink-0 border-r border-border xl:block">{sourcesPanel}</div>
        <div className="hidden min-w-0 flex-1 xl:block">{chatPanel}</div>
        <div className="hidden w-[320px] shrink-0 border-l border-border xl:block">{studioPanel}</div>
        <div className="min-w-0 flex-1 xl:hidden">
          {panel === "sources" && sourcesPanel}
          {panel === "chat" && chatPanel}
          {panel === "studio" && studioPanel}
        </div>
      </div>

      {/* Source preview overlay */}
      {activeSource && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#10112f]/40" role="dialog" aria-modal="true" aria-label={activeSource.title}>
          <button type="button" aria-label="Tutup" className="flex-1 cursor-default" onClick={() => setActiveSource(null)} />
          <div className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-card shadow-soft-lg">
            <div className="flex items-start justify-between gap-3 border-b border-border p-4">
              <div>
                <h2 className="text-sm font-bold leading-snug">{activeSource.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Paparan penuh dokumen disambung dalam Fasa 3.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSource(null)}
                aria-label="Tutup paparan sumber"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-muted-foreground">
                  <BookOpenText className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <SourceStatus source={activeSource} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeSource.sizeLabel}
                    {activeSource.detail ? ` · ${activeSource.detail}` : ""}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-border bg-secondary/50 p-4 text-sm leading-relaxed text-muted-foreground">
                Dalam binaan penuh, panel ini memaparkan dokumen sebenar dengan penyerlahan petikan
                yang digunakan oleh jawapan AI — supaya setiap sitasi boleh disemak.
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="size-3.5 text-[#00786a]" aria-hidden="true" />
                Sumber ini {selected.includes(activeSource.id) ? "digunakan" : "tidak digunakan"} untuk asas jawapan AI.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
