"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { OwnedWorkbookOption } from "@/lib/assignments";
import styles from "../classes.module.css";

type ModuleOption = { kind: string; label: string; count: number };

export function AssignmentDialog({
  classId,
  workbooks,
  onClose,
  onCreated,
}: {
  classId: string;
  workbooks: OwnedWorkbookOption[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [workbookId, setWorkbookId] = useState(workbooks[0]?.id ?? "");
  const [modules, setModules] = useState<ModuleOption[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState(workbooks[0]?.title ?? "");
  const [titleTouched, setTitleTouched] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = overflow; };
  }, []);

  useEffect(() => {
    if (!workbookId) return;
    let cancelled = false;
    fetch(`/api/workbooks/${workbookId}/modules`)
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as { modules?: ModuleOption[] } | null;
        if (!response.ok || !payload?.modules) throw new Error("load");
        if (cancelled) return;
        setModules(payload.modules);
        setSelected(new Set(payload.modules.filter((module) => module.count > 0).map((module) => module.kind)));
      })
      .catch(() => {
        if (cancelled) return;
        setModules([]);
        setError("Modul buku kerja tidak dapat dimuatkan.");
      });
    return () => { cancelled = true; };
  }, [workbookId]);

  function pickWorkbook(nextId: string) {
    setWorkbookId(nextId);
    setModules(null);
    setSelected(new Set());
    if (!titleTouched) {
      const picked = workbooks.find((workbook) => workbook.id === nextId);
      if (picked) setTitle(picked.title);
    }
  }

  function toggleModule(kind: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }

  const readyCount = modules?.filter((module) => module.count > 0).length ?? 0;
  const canSubmit = Boolean(workbookId) && selected.size > 0 && title.trim().length >= 2 && !busy;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !canSubmit) return;
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/classes/${classId}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workbookId, title, instructions, moduleKinds: [...selected], dueAt: dueAt || null }),
    }).catch(() => null);
    const payload = response ? ((await response.json().catch(() => null)) as { id?: string; error?: string } | null) : null;
    if (!response?.ok || !payload?.id) {
      setError(payload?.error ?? "Buku kerja tidak dapat ditugaskan. Cuba lagi.");
      setBusy(false);
      return;
    }
    onCreated();
  }

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label="Tugaskan buku kerja"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === ref.current) onClose(); }}
    >
      <div className={styles.dialogInner}>
        <button type="button" className={styles.closeDialog} aria-label="Tutup" onClick={onClose}><X size={17} /></button>
        <form className={styles.dialogBody} onSubmit={submit}>
          <h2>Tugaskan buku kerja</h2>
          <p>Pilih buku kerja dan modul yang perlu disiapkan pelajar. Pelajar membukanya secara baca sahaja, dan kemajuan mereka muncul dalam Analitik kelas.</p>
          <div className={styles.field}>
            <label htmlFor="assignment-workbook">Buku kerja</label>
            <Select
              id="assignment-workbook"
              value={workbookId}
              onValueChange={pickWorkbook}
              options={workbooks.map((workbook) => ({ value: workbook.id, label: workbook.title }))}
              placeholder="Pilih buku kerja"
              ariaLabel="Buku kerja"
            />
          </div>
          <div className={styles.field}>
            <label>Modul untuk pelajar</label>
            {modules === null ? (
              <p className={styles.moduleHint}>Memuatkan modul…</p>
            ) : readyCount === 0 ? (
              <p className={styles.moduleHint}>Buku kerja ini belum mempunyai modul sedia. Jana modul dahulu dalam buku kerja, kemudian tugaskan semula.</p>
            ) : (
              <div className={styles.moduleList}>
                {modules.map((module) => (
                  <label key={module.kind} className={styles.moduleRow} data-disabled={module.count === 0 || undefined}>
                    <Checkbox
                      checked={selected.has(module.kind)}
                      disabled={module.count === 0}
                      onChange={() => toggleModule(module.kind)}
                    />
                    <span>{module.label}</span>
                    <small>{module.count > 0 ? `${module.count} sedia` : "Belum dijana"}</small>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="assignment-title">Tajuk untuk pelajar</label>
            <Input id="assignment-title" value={title} onChange={(event) => { setTitle(event.target.value); setTitleTouched(true); }} maxLength={160} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="assignment-instructions">Arahan <small>(pilihan)</small></label>
            <textarea
              id="assignment-instructions"
              className={styles.textarea}
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Contoh: Tonton slaid, jawab kuiz dan tandakan selesai."
              maxLength={2000}
              rows={3}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="assignment-due">Tarikh akhir <small>(pilihan)</small></label>
            <Input id="assignment-due" type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
          </div>
          {error && <p className={styles.formError} role="alert">{error}</p>}
          <div className={styles.dialogActions}>
            <Button type="button" variant="white" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={!canSubmit}>{busy ? "Menugaskan…" : "Tugaskan"}</Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
