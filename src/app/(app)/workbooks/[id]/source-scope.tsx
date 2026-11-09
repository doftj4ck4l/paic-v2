"use client";
import { BookOpen, CheckCheck, LoaderCircle } from "lucide-react";
import type { useWorkbookSources } from "@/lib/workbook/use-sources";
import styles from "./chat.module.css";
export function SourceScope({ state, onManageSources }: { state: ReturnType<typeof useWorkbookSources>; onManageSources?: () => void }) {
  if (state.loading) return <div className={styles.scope}><LoaderCircle size={14} className={styles.spin} />Memuatkan sumber…</div>;
  if (state.error) return <div className={styles.scope} role="alert">{state.error}<button onClick={() => void state.refresh()}>Cuba lagi</button></div>;
  return <div className={styles.scope}>
    <span><BookOpen size={15} />{state.selected.length ? `${state.selected.length} sumber dipilih sebagai rujukan` : state.processing.length ? `${state.processing.length} sumber sedang diembed. AI akan aktif apabila siap.` : state.ready.length ? "Tiada sumber dipilih untuk AI." : state.draftCount ? `${state.draftCount} sumber perlu disemak dan diembed dahulu.` : "Tambah sumber untuk mula belajar."}</span>
    {state.ready.length > 0 ? <><details className={styles.scopePicker}><summary>Pilih sumber</summary><div>{state.ready.map(source => <label key={source.id}><input type="checkbox" checked={state.selectedIds.includes(source.id)} onChange={event => state.select(event.target.checked ? [...state.selectedIds, source.id] : state.selectedIds.filter(id => id !== source.id))} />{source.title}</label>)}<button type="button" onClick={() => state.select(state.ready.map(row => row.id))}><CheckCheck size={13} />Gunakan semua sumber</button></div></details>{!state.selected.length && <button type="button" onClick={() => state.select(state.ready.map(row => row.id))}>Gunakan {state.ready.length} sumber</button>}</> : <button type="button" onClick={onManageSources}>{state.draftCount ? "Semak & embed sumber" : state.processing.length ? "Lihat kemajuan" : "Tambah sumber"}</button>}
  </div>;
}
