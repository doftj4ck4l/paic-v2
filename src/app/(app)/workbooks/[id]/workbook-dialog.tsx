"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import styles from "./references.module.css";
export function WorkbookDialog({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => { const dialog = ref.current; const previous = document.activeElement as HTMLElement | null; const overflow = document.body.style.overflow; dialog?.showModal(); document.body.style.overflow = "hidden"; return () => { dialog?.close(); document.body.style.overflow = overflow; previous?.focus(); }; }, []);
  return <dialog ref={ref} className={`${styles.dialog} ${wide ? styles.wideDialog : ""}`} aria-label={title} onCancel={event => { event.preventDefault(); close.current(); }} onClick={event => { if (event.target === ref.current) close.current(); }}><div className={styles.dialogInner}><button type="button" className={styles.closeDialog} aria-label={`Tutup ${title}`} onClick={onClose}><X size={19} /></button>{children}</div></dialog>;
}
