"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ClipboardList, Headphones, Layers, ListChecks, Network, NotebookPen, Palette, Presentation } from "lucide-react";
import { ContentTile } from "@/components/studio/content-tile";
import { CREATIONS, CREATION_KIND_LABEL, type DemoCreation } from "@/lib/demo-data";
import styles from "./creations.module.css";

const KINDS = Object.keys(CREATION_KIND_LABEL) as DemoCreation["kind"][];

const KIND_ICONS = {
  notes: NotebookPen,
  quizzes: ListChecks,
  flashcards: Layers,
  slides: Presentation,
  mindmaps: Network,
  audio: Headphones,
  "study-guides": ClipboardList,
} satisfies Record<DemoCreation["kind"], typeof NotebookPen>;

const STATUS_LABEL = {
  ready: "Sedia",
  processing: "Sedang dijana",
  failed: "Gagal",
} as const;

function CreationTile({ creation }: { creation: DemoCreation }) {
  const ready = creation.status === "ready";
  const Icon = KIND_ICONS[creation.kind];
  return (
    <ContentTile
      href={ready ? `/creations/${creation.kind}/${creation.id}` : undefined}
      tint={creation.kind}
      art={creation.asset}
      badge={<><Icon size={14} aria-hidden="true" />{CREATION_KIND_LABEL[creation.kind]}</>}
      title={creation.title}
      description={`${creation.meta} · ${creation.time}`}
      footer={
        <>
          <span className={styles.statusChip} data-status={creation.status}>{STATUS_LABEL[creation.status]}</span>
          <span className={styles.tileMeta}>{ready ? "Ketik untuk buka" : "Akan muncul apabila siap"}</span>
        </>
      }
      footerEnd={ready ? <ArrowRight size={16} className={styles.tileArrow} aria-hidden="true" /> : undefined}
    />
  );
}

export function CreationsLibrary() {
  const [kind, setKind] = useState<DemoCreation["kind"] | "all">("all");

  const filtered = useMemo(
    () => (kind === "all" ? CREATIONS : CREATIONS.filter((c) => c.kind === kind)),
    [kind],
  );

  return (
    <section className={styles.library} aria-label="Koleksi hasil karya">
      <div className={styles.filterRow}>
        <div className={styles.filters} role="group" aria-label="Tapis mengikut jenis">
          <button type="button" className={styles.filter} aria-pressed={kind === "all"} onClick={() => setKind("all")}>
            Semua
          </button>
          {KINDS.map((k) => (
            <button key={k} type="button" className={styles.filter} aria-pressed={kind === k} onClick={() => setKind(k)}>
              {CREATION_KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <span className={styles.countPill} role="status" aria-live="polite">
          {filtered.length} daripada {CREATIONS.length} bahan
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <Palette size={32} aria-hidden="true" />
          <h3>Tiada hasil untuk jenis ini</h3>
          <p>Jana bahan baharu daripada Studio dalam mana-mana buku kerja.</p>
          <button type="button" onClick={() => setKind("all")}>Tunjukkan semua bahan</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((c) => (
            <CreationTile key={c.id} creation={c} />
          ))}
        </div>
      )}
    </section>
  );
}
