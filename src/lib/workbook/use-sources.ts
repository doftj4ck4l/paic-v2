"use client";
import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { readSourceSelection, syncSourceSelection, writeSourceSelection } from "./source-selection";
export type WorkbookSource = {
  id: string; title: string; kind: string; status: string; chars: number; preview: string; excerpt: string;
  sizeLabel?: string | null; error?: string | null; fullText?: string; canDelete: boolean;
  meta: { url?: string; stage?: string; progress?: number; completedChunks?: number; totalChunks?: number; review?: string; embeddingModel?: string; relevanceReason?: string; relevanceScore?: number };
};
function useSourceController(workbookId: string) {
  const [sources, setSources] = useState<WorkbookSource[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [draftCount, setDraftCount] = useState(0);
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const alive = useRef(false);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/workbooks/${workbookId}/sources`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Sumber gagal dimuatkan. Sila cuba lagi.");
      if (!alive.current) return;
      setSources(payload.sources); setDraftCount(payload.draftCount); setAvailable(payload.embeddingAvailable);
      setSelectedIds(syncSourceSelection(workbookId, payload.sources)); setError("");
    } catch (err) { if (alive.current) setError((err as Error).message); }
    finally { if (alive.current) setLoading(false); }
  }, [workbookId]);
  useEffect(() => {
    alive.current = true; void refresh();
    const timer = setInterval(() => void refresh(), 2500);
    const selectionChanged = () => setSelectedIds(readSourceSelection(workbookId) ?? []);
    window.addEventListener("paicv3:source-selection", selectionChanged); window.addEventListener("storage", selectionChanged);
    return () => { alive.current = false; clearInterval(timer); window.removeEventListener("paicv3:source-selection", selectionChanged); window.removeEventListener("storage", selectionChanged); };
  }, [workbookId, refresh]);
  function select(ids: string[]) { const next = ids.filter(id => sources.some(row => row.id === id && row.status === "ready")); writeSourceSelection(workbookId, next); setSelectedIds(next); }
  const ready = sources.filter(row => row.status === "ready");
  const selected = ready.filter(row => selectedIds.includes(row.id));
  return { sources, setSources, selectedIds: selected.map(row => row.id), select, ready, selected, processing: sources.filter(row => row.status === "processing"), draftCount, available, loading, error, setError, refresh };
}

const SourcesContext = createContext<(ReturnType<typeof useSourceController> & { workbookId: string }) | null>(null);
export function WorkbookSourcesProvider({ workbookId, children }: { workbookId: string; children: ReactNode }) {
  const state = useSourceController(workbookId);
  return createElement(SourcesContext.Provider, { value: { ...state, workbookId } }, children);
}
export function useWorkbookSources(workbookId: string) {
  const value = useContext(SourcesContext);
  if (!value || value.workbookId !== workbookId) throw new Error("Workbook source provider is missing");
  return value;
}
