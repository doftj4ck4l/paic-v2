"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { OwnedWorkbookOption } from "@/lib/assignments";
import styles from "../classes.module.css";

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

  function pickWorkbook(nextId: string) {
    setWorkbookId(nextId);
    if (!titleTouched) {
      const picked = workbooks.find((workbook) => workbook.id === nextId);
      if (picked) setTitle(picked.title);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !workbookId) return;
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/classes/${classId}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workbookId, title, instructions, dueAt: dueAt || null }),
    }).catch(() => null);
    const payload = response ? ((await response.json().catch(() => null)) as { id?: string; error?: string } | null) : null;
    if (!response?.ok || !payload?.id) {
      setError(payload?.error ?? "Tugasan tidak dapat dicipta. Cuba lagi.");
      setBusy(false);
      return;
    }
    onCreated();
  }

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label="Beri tugasan"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === ref.current) onClose(); }}
    >
      <div className={styles.dialogInner}>
        <button type="button" className={styles.closeDialog} aria-label="Tutup" onClick={onClose}><X size={17} /></button>
        <form className={styles.dialogBody} onSubmit={submit}>
          <h2>Beri tugasan</h2>
          <p>Pelajar dalam kelas ini akan melihat tugasan di Utama dan Kelas, dan boleh membuka buku kerja secara baca sahaja.</p>
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
            <label htmlFor="assignment-title">Tajuk tugasan</label>
            <Input id="assignment-title" value={title} onChange={(event) => { setTitle(event.target.value); setTitleTouched(true); }} maxLength={160} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="assignment-instructions">Arahan <small>(pilihan)</small></label>
            <textarea
              id="assignment-instructions"
              className={styles.textarea}
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Contoh: Tonton slaid, jawab kuiz dan hantar nota ringkas."
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
            <Button type="submit" disabled={busy || !workbookId || title.trim().length < 2}>{busy ? "Memberi…" : "Beri tugasan"}</Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
