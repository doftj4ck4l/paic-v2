"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
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
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { Chip } from "@/components/studio/ui";
import { ArtifactTab } from "./artifact-tab";
import { SUBJECT_ICONS } from "@/components/studio/content-tile";
import content from "@/components/studio/content-width.module.css";
import { shareWorkbook, useSocial } from "@/lib/demo-social";
import {
  CREATIONS,
  SUGGESTED_QUESTIONS,
  WORKBOOK_CHAT,
  WORKBOOK_SOURCES,
  subjectById,
  type DemoCreation,
  type DemoSource,
  type DemoWorkbook,
  type SubjectId,
} from "@/lib/demo-data";
import styles from "./workbook.module.css";

type TabId = "sumber" | "sembang" | DemoCreation["kind"];

const COVER_ART: Partial<Record<SubjectId, string>> = {
  science: "/assets/thiings/workbook-flask.png",
  math: "/assets/thiings/workbook-calculator.png",
  language: "/assets/thiings/workbook-pencil.png",
};

const SOURCE_ICONS = { pdf: FileText, doc: FileText, note: StickyNote, web: Globe } as const;

const MODULE_TABS: { kind: DemoCreation["kind"]; label: string }[] = [
  { kind: "notes", label: "Nota" },
  { kind: "quizzes", label: "Kuiz" },
  { kind: "flashcards", label: "Kad Imbas" },
  { kind: "slides", label: "Slaid" },
  { kind: "mindmaps", label: "Peta Minda" },
  { kind: "audio", label: "Audio" },
  { kind: "study-guides", label: "Panduan Ulang Kaji" },
];

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
  initialTab = "sumber",
}: {
  workbook: DemoWorkbook;
  initialTab?: TabId;
}) {
  const subject = subjectById(workbook.subjectId);
  const SubjectIcon = SUBJECT_ICONS[subject.id];
  const creations = CREATIONS.filter((c) => c.workbookId === workbook.id);
  const modules = MODULE_TABS.map((m) => ({ ...m, creation: creations.find((c) => c.kind === m.kind) })).filter(
    (m): m is (typeof MODULE_TABS)[number] & { creation: DemoCreation } => !!m.creation,
  );
  const readyModules = modules.filter((m) => m.creation.status === "ready").length;

  const [tab, setTab] = useState<TabId>(() => {
    if (initialTab === "sumber" || initialTab === "sembang") return initialTab;
    return modules.some((m) => m.kind === initialTab) ? initialTab : "sumber";
  });
  const [selected, setSelected] = useState<string[]>(
    WORKBOOK_SOURCES.filter((s) => s.status === "ready").map((s) => s.id),
  );
  const [activeSource, setActiveSource] = useState<DemoSource | null>(null);
  const { shared } = useSocial();
  const isShared = shared.includes(workbook.id);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareVisibility, setShareVisibility] = useState<"class" | "community">("class");

  useEffect(() => {
    if (!shareOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setShareOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shareOpen]);

  function confirmShare() {
    shareWorkbook(workbook.id);
    setShareOpen(false);
  }

  function toggleSource(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <div className={styles.topRow}>
          <Link href="/workbooks" className={styles.back}>
            <ArrowLeft size={15} aria-hidden="true" /> Buku Kerja saya
          </Link>
          <div className={styles.topActions}>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              data-shared={isShared}
              className={styles.shareButton}
            >
              {isShared ? <Check size={14} aria-hidden="true" /> : <Share2 size={14} aria-hidden="true" />}
              {isShared ? "Dikongsi" : "Kongsi"}
            </button>
            <Link href={`/workbooks/${workbook.id}/settings`} className={styles.settingsButton}>
              <Settings2 size={14} aria-hidden="true" /> Tetapan
            </Link>
          </div>
        </div>

        <section className={styles.detailHero} data-subject={subject.id} aria-labelledby="workbook-title">
          <span className={styles.detailArt}>
            <Image src={COVER_ART[subject.id] ?? subject.asset} alt="" width={1024} height={1024} />
          </span>
          <div className={styles.detailCopy}>
            <h1 id="workbook-title">{workbook.title}</h1>
            <div className={styles.detailChips}>
              <span className={styles.detailChip}>
                <SubjectIcon size={13} aria-hidden="true" />
                {subject.name}
              </span>
              <span className={styles.detailChip}>
                <Users size={13} aria-hidden="true" />
                {workbook.teacherName}
              </span>
              <span className={styles.detailChip}>
                <TrendingUp size={13} aria-hidden="true" />
                {workbook.progress}% siap
              </span>
            </div>
            <p>{workbook.topic}</p>
          </div>
          <div className={styles.detailStats}>
            <span className={styles.detailStat}>
              <Layers size={15} aria-hidden="true" />
              <strong>{WORKBOOK_SOURCES.length}</strong> sumber
            </span>
            <span className={styles.detailStat}>
              <Sparkles size={15} aria-hidden="true" />
              <strong>{readyModules}</strong> modul siap
            </span>
          </div>
        </section>

        <div className={styles.tabs} role="group" aria-label="Bahagian buku kerja">
          <button type="button" className={styles.tab} aria-pressed={tab === "sumber"} onClick={() => setTab("sumber")}>
            Sumber
          </button>
          <button type="button" className={styles.tab} aria-pressed={tab === "sembang"} onClick={() => setTab("sembang")}>
            Sembang AI
          </button>
          {modules.map((m) => (
            <button key={m.kind} type="button" className={styles.tab} aria-pressed={tab === m.kind} onClick={() => setTab(m.kind)}>
              {m.label}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {tab === "sumber" && (
            <div className={styles.sourcesWrap}>
              <p className={styles.panelNote}>Pilih sumber untuk dijadikan asas jawapan AI.</p>
              <div className={styles.sourceGrid}>
                {WORKBOOK_SOURCES.map((source) => {
                  const Icon = SOURCE_ICONS[source.kind];
                  const checked = selected.includes(source.id);
                  return (
                    <div key={source.id} className={styles.sourceCard} data-checked={checked && source.status === "ready"}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={source.status !== "ready"}
                        onChange={() => toggleSource(source.id)}
                        aria-label={`Guna ${source.title} sebagai asas jawapan`}
                      />
                      <button type="button" onClick={() => setActiveSource(source)} className={styles.sourceBody}>
                        <span className={styles.sourceTitle}>
                          <Icon size={14} aria-hidden="true" />
                          <span>{source.title}</span>
                        </span>
                        <span className={styles.sourceMeta}>
                          <SourceStatus source={source} />
                          <span>
                            {source.sizeLabel}
                            {source.detail ? ` · ${source.detail}` : ""}
                          </span>
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className={styles.panelInfo}>
                <Info size={12} aria-hidden="true" />
                <span>
                  Muat naik fail sebenar disambung dalam Fasa 3 (storan objek + saluran pemprosesan).
                  {modules.length === 0 && " Modul AI (Nota, Kuiz, Slaid…) akan muncul sebagai tab selepas dijana."}
                </span>
              </p>
            </div>
          )}

          {tab === "sembang" && (
            <div className={styles.chatWrap}>
              <div className="flex flex-col gap-4">
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
                        {m.grounded && (
                          <Chip tone="teal" className="mb-2.5">
                            Berdasarkan sumber anda
                          </Chip>
                        )}
                        <p className="text-sm leading-relaxed">{m.text}</p>
                        {m.citations && m.citations.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                            {m.citations.map((c) => (
                              <button
                                key={c.index}
                                type="button"
                                onClick={() => setActiveSource(WORKBOOK_SOURCES.find((s) => s.id === c.sourceId) ?? null)}
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

              <div className="mt-5 flex flex-wrap gap-1.5">
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
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-background py-2 pl-4 pr-2">
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
          )}

          {modules.map((m) =>
            tab === m.kind ? (
              <div key={m.kind} className={styles.module}>
                <ArtifactTab workbookId={workbook.id} kind={m.kind} />
              </div>
            ) : null,
          )}
        </div>

        <p className={styles.attribution}>
          3D icons by{" "}
          <a href="https://www.thiings.co/things" target="_blank" rel="noreferrer">
            Thiings
          </a>
        </p>
      </main>

      {/* Share dialog */}
      {shareOpen && (
        <div className={styles.dialogBackdrop} role="dialog" aria-modal="true" aria-labelledby="share-title">
          <button type="button" aria-label="Tutup" className={styles.dialogDismiss} onClick={() => setShareOpen(false)} />
          <div className={styles.dialog}>
            <div className={styles.dialogHead}>
              <div>
                <h2 id="share-title">Kongsi buku kerja</h2>
                <p className={styles.dialogDesc}>
                  Kongsi &quot;{workbook.title}&quot; dengan rakan sekelas atau seluruh komuniti Pixelspace.
                </p>
              </div>
              <button type="button" aria-label="Tutup dialog" className={styles.dialogClose} onClick={() => setShareOpen(false)}>
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <fieldset className={styles.radioGroup}>
              <legend>Pilih siapa boleh melihat</legend>
              <label className={styles.radioRow} data-checked={shareVisibility === "class"}>
                <input type="radio" name="share-visibility" checked={shareVisibility === "class"} onChange={() => setShareVisibility("class")} />
                <span>
                  <strong>Sekolah sahaja</strong>
                  <span>Hanya pelajar di sekolah anda (demo)</span>
                </span>
              </label>
              <label className={styles.radioRow} data-checked={shareVisibility === "community"}>
                <input type="radio" name="share-visibility" checked={shareVisibility === "community"} onChange={() => setShareVisibility("community")} />
                <span>
                  <strong>Komuniti Pixelspace</strong>
                  <span>Semua pelajar demo di halaman Komuniti</span>
                </span>
              </label>
            </fieldset>
            <div className={styles.dialogField}>
              <label htmlFor="share-note">Penerangan (pilihan)</label>
              <textarea id="share-note" rows={3} placeholder="cth. Nota ringkas untuk ulang kaji bab 8…" />
            </div>
            <p className={styles.dialogNote}>
              <Info size={12} aria-hidden="true" />
              Mod demo — perkongsian disimpan dalam sesi ini sahaja (Fasa 5).
            </p>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.ghostButton} onClick={() => setShareOpen(false)}>Batal</button>
              <button type="button" className={styles.confirmButton} onClick={confirmShare}>
                <Share2 size={15} aria-hidden="true" /> Kongsi sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Source preview overlay */}
      {activeSource && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#10112f]/40" role="dialog" aria-modal="true" aria-label={activeSource.title}>
          <button type="button" aria-label="Tutup" className="flex-1 cursor-default" onClick={() => setActiveSource(null)} />
          <div className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-card shadow-soft-lg">
            <div className="flex items-start justify-between gap-3 border-b border-border p-4">
              <div>
                <h2 className="text-sm font-bold leading-snug">{activeSource.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Paparan penuh dokumen disambung dalam Fasa 3.</p>
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
                Dalam binaan penuh, panel ini memaparkan dokumen sebenar dengan penyerlahan petikan yang
                digunakan oleh jawapan AI — supaya setiap sitasi boleh disemak.
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
