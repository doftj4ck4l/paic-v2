"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BookOpen, Check, CheckCheck, ChevronRight, CircleAlert, CloudUpload, ExternalLink, FileText, Globe, Layers, LoaderCircle, Plus, RefreshCw, Search, Sparkles, Trash2, X, Video, Download, MoreVertical } from "lucide-react";
import styles from "./sources.module.css";
import refStyles from "./references.module.css";
import { WorkbookInfo, RelatedWorkbooks } from "./references-context";
import type { AppWorkbook } from "@/lib/workbooks";

import { useWorkbookSources, type WorkbookSource as Source } from "@/lib/workbook/use-sources";
import { markSourcesPending } from "@/lib/workbook/source-selection";
export { readSourceSelection } from "@/lib/workbook/source-selection";

type Candidate = { title: string; url: string; snippet: string; site: string; state?: "extracting" | "failed"; error?: string; sourceId?: string };
type Mode = "web" | "upload" | "text" | "youtube" | "textbook";
const MODES = [{ id: "web", label: "Carian web", hint: "Cari artikel berkaitan", icon: Globe }, { id: "upload", label: "Muat naik fail", hint: "PDF, Word dan teks", icon: CloudUpload }, { id: "textbook", label: "Buku teks", hint: "Bahan pembelajaran", icon: BookOpen }, { id: "youtube", label: "YouTube", hint: "Ekstrak transkrip video", icon: Video }, { id: "text", label: "Tampal teks", hint: "Nota dan petikan anda", icon: FileText }] as const;
function IconFor({ kind }: { kind: string }) { const Icon = kind === "web" ? Globe : kind === "youtube" ? Video : kind === "textbook" ? BookOpen : FileText; return <Icon size={19} aria-hidden="true" />; }
function words(source: Source) { return `${Math.round(source.chars / 6).toLocaleString("ms-MY")} perkataan anggaran`; }
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Permintaan gagal. Sila cuba lagi.");
  return payload as T;
}
function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const dialog = ref.current; const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog?.showModal(); document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={`${styles.dialog} ${wide ? styles.wide : ""}`} aria-label={title} onCancel={event => { event.preventDefault(); closeRef.current(); }} onClick={event => { if (event.target === ref.current) closeRef.current(); }}><div className={styles.modalInner}>{children}</div></dialog>;
}

export function SourcesTab({ workbookId, workbook, onCount }: { workbookId: string; workbook: AppWorkbook; onCount?: (count: number) => void }) {
  const { sources, setSources, selectedIds: selected, select, ready, processing, draftCount, available, loading, error, setError, refresh } = useWorkbookSources(workbookId);
  useEffect(() => { if (!loading) onCount?.(ready.length); }, [ready.length, loading, onCount]);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Source | null>(null);
  const [deleting, setDeleting] = useState<Source | null>(null);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  async function downloadAll() {
    setDownloading(true); setError("");
    try { const response = await fetch(`/api/workbooks/${workbookId}/sources/download`); if (!response.ok) { const payload = await response.json(); throw new Error(payload.error); } const blob = await response.blob(); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${workbook.title}-sumber.zip`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (err) { setError((err as Error).message || "Muat turun tidak berjaya."); } finally { setDownloading(false); }
  }
  async function showPreview(source: Source) {
    setPreview(source);
    try { const full = await api<Source>(`/api/sources/${source.id}`); setPreview(current => current?.id === source.id ? full : current); } catch (err) { setError(err instanceof Error ? err.message : "Pratonton gagal dimuatkan."); }
  }
  async function retry(source: Source) {
    setBusy(true); setError("");
    try { await api(`/api/workbooks/${workbookId}/sources/embed`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sourceIds: [source.id] }) }); markSourcesPending(workbookId, [source.id]); await refresh(); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  async function remove() {
    if (!deleting) return; setBusy(true);
    try { await api(`/api/sources/${deleting.id}`, { method: "DELETE" }); setDeleting(null); await refresh(); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  const filtered = sources.filter(source => `${source.title} ${source.kind}`.toLowerCase().includes(query.toLowerCase()));
  return <div className={refStyles.layout}><section className={refStyles.library} aria-labelledby="sources-heading">
    <div className={refStyles.sectionHead}><span className={refStyles.headingIcon}><FileText size={30} /></span><div><h2 id="sources-heading">Sumber Rujukan</h2><p>Sumber yang digunakan dalam buku kerja ini</p></div><div className={refStyles.headActions}><button className={refStyles.secondary} disabled={!ready.length || downloading} onClick={() => void downloadAll()}>{downloading ? <LoaderCircle className={styles.spin} size={16} /> : <Download size={16} />}Muat Turun Semua</button><button className={refStyles.primary} onClick={() => setOpen(true)}><Plus size={16} />Tambah sumber</button></div></div>
    {notice && <div className={styles.success} role="status"><Check size={17} /><span>{notice}</span><button className={styles.iconButton} aria-label="Tutup pemberitahuan" onClick={() => setNotice("")}><X size={16} /></button></div>}
    {error && <div className={styles.error} role="alert"><CircleAlert size={18} /><span>{error}</span><button className={styles.textButton} onClick={() => void refresh()}>Cuba lagi</button></div>}
    {draftCount > 0 && <button className={styles.draftBanner} onClick={() => setOpen(true)}><FileText size={18} /><span><strong>{draftCount} sumber menunggu semakan</strong><small>Semak teks dan pilih sumber yang ingin diembed.</small></span><span>Semak draf <ChevronRight size={16} /></span></button>}
    {!loading && sources.length > 0 && <div className={refStyles.toolbar}><label className={styles.search}><Search size={16} /><input aria-label="Cari sumber dalam buku kerja" placeholder="Cari sumber…" value={query} onChange={event => setQuery(event.target.value)} /></label><label className={styles.selectAll}><input type="checkbox" checked={ready.length > 0 && ready.every(source => selected.includes(source.id))} disabled={!ready.length} onChange={event => select(event.target.checked ? ready.map(row => row.id) : [])} />{selected.length} dipilih untuk AI</label></div>}
    {loading ? <div className={styles.empty}><LoaderCircle className={styles.spin} /><p>Memuatkan sumber…</p></div> : !sources.length ? <div className={styles.empty}><img src="/assets/thiings/books.png" alt="" onError={event => { event.currentTarget.style.display = "none"; }} /><span className={styles.emptyIcon}><BookOpen size={30} /></span><h3>Ilmu bermula dengan sumber yang baik</h3><p>Muat naik nota, cari artikel web atau tambah buku teks. Semak kandungannya sebelum diembed untuk AI.</p><button className={styles.primary} onClick={() => setOpen(true)}><Plus size={17} />Tambah sumber pertama</button><div className={styles.emptySteps}><span>1. Ekstrak teks</span><ChevronRight size={14} /><span>2. Pilih sumber</span><ChevronRight size={14} /><span>3. Embed & belajar</span></div></div> : <div className={styles.sourceList}>
      {filtered.map(source => { const videoId = source.meta.videoId; const videoThumbnail = source.kind === "youtube" && videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId); const thumb = videoThumbnail ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : source.kind === "web" || /bumi|planet|alam semesta|astronomi/i.test(source.title) ? "/assets/thiings/workbook-globe.png" : "/assets/thiings/workbook-open-book.png"; return <article className={refStyles.sourceCard} key={source.id} data-selected={selected.includes(source.id)}>
        <div className={refStyles.thumbnail} data-kind={source.kind}><img src={thumb} alt="" /><label className={refStyles.sourceCheck}><input type="checkbox" aria-label={`Gunakan ${source.title} untuk AI`} disabled={source.status !== "ready"} checked={selected.includes(source.id)} onChange={event => select(event.target.checked ? [...selected, source.id] : selected.filter(id => id !== source.id))} /></label></div>
        <div className={refStyles.sourceBody}><button className={refStyles.sourceTitle} onClick={() => void showPreview(source)}>{source.title}</button><p className={refStyles.description}>{source.excerpt?.replace(/[#*_`>]/g, "").slice(0, 150) || "Kandungan sedang disediakan untuk pembelajaran anda."}</p><div className={refStyles.sourceMeta}><span data-kind={source.kind}><IconFor kind={source.kind} />{source.kind === "web" ? "Web" : source.kind === "youtube" ? "YouTube" : source.kind === "pdf" ? "PDF" : source.kind === "textbook" ? "Buku teks" : "Nota"}</span><span>·</span><span>{source.sizeLabel || words(source)}</span><span className={refStyles.state} data-status={source.status}>{source.status === "ready" ? <><Check size={12} />Sedia</> : source.status === "failed" ? "Gagal" : "Memproses"}</span></div>
          {source.status === "processing" && <div className={styles.progressWrap}><div className={styles.progressLabel}><span><LoaderCircle size={13} className={styles.spin} />{source.meta.stage === "queued" ? "Menunggu giliran…" : source.meta.stage === "chunking" ? "Menyusun teks…" : "Mengembed sumber…"}</span><strong>{source.meta.completedChunks ?? 0}/{source.meta.totalChunks ?? "…"} bahagian</strong></div><progress max={100} value={source.meta.progress ?? 0} aria-label={`Kemajuan embedding ${source.title}`} /></div>}
          {source.status === "failed" && <p className={styles.failure}>{source.error || "Embedding gagal. Teks anda masih disimpan."}</p>}
        </div><div className={refStyles.sourceActions}><button className={refStyles.openButton} onClick={() => void showPreview(source)}>Buka<ExternalLink size={13} /></button>{source.status === "failed" && <button disabled={busy} className={styles.textButton} onClick={() => void retry(source)}><RefreshCw size={13} />Cuba lagi</button>}<details className={refStyles.actionMenu} onKeyDown={event => { if (event.key === "Escape") event.currentTarget.open = false; }}><summary aria-label={`Pilihan sumber ${source.title}`}><MoreVertical size={20} /></summary><div>{source.chars > 0 && <a href={`/api/sources/${source.id}/download`} download><Download size={14} />Muat turun sumber</a>}{source.meta.url && <a href={source.meta.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} />Buka pautan asal</a>}{source.canDelete && <button onClick={event => { event.currentTarget.closest("details")?.removeAttribute("open"); setDeleting(source); }}><Trash2 size={14} />Padam sumber</button>}</div></details></div>
      </article>; })}{!filtered.length && <p className={styles.noResults}>Tiada sumber sepadan dengan “{query}”.</p>}
    </div>}
    <p className={styles.footnote}><Sparkles size={14} />{processing.length ? "Embedding diteruskan walaupun anda menutup popup atau menukar tab." : "Hanya sumber yang siap dan ditandakan akan digunakan untuk penjanaan AI."}</p>
    {open && <AddSourceDialog workbookId={workbookId} available={available} onClose={() => { setOpen(false); void refresh(); }} onEmbedded={(ids, queued) => { setSources(previous => [...queued.map(row => ({ ...row, status: "processing", meta: { ...row.meta, stage: "queued", progress: 0, review: "accepted" } })), ...previous.filter(row => !ids.includes(row.id))]); markSourcesPending(workbookId, ids); setOpen(false); setNotice(`${ids.length} sumber dihantar untuk embedding. Kemajuannya dipaparkan di bawah.`); void refresh(); }} />}
    {preview && <Modal title="Pratonton sumber" onClose={() => setPreview(null)}><div className={styles.modalHead}><div><span className={styles.eyebrow}>PRATONTON SUMBER</span><h2>{preview.title}</h2><p>{words(preview)}</p></div><button className={styles.iconButton} aria-label="Tutup pratonton" onClick={() => setPreview(null)}><X size={20} /></button></div><div className={styles.fullPreview}>{preview.fullText || preview.preview || "Teks belum tersedia."}</div><div className={styles.modalFooter}><span>{preview.status === "ready" ? "Sumber sedia digunakan untuk AI" : "Teks yang berjaya diekstrak"}</span><button className={styles.secondary} onClick={() => setPreview(null)}>Tutup</button></div></Modal>}
    {deleting && <Modal title="Padam sumber" onClose={() => setDeleting(null)}><div className={styles.modalHead}><div><h2>Padam sumber ini?</h2><p>{deleting.title}</p></div></div><p className={styles.confirmText}>Teks dan indeks sumber ini akan dipadam daripada buku kerja. Bahan pembelajaran yang telah dijana akan dikekalkan.</p><div className={styles.modalFooter}><button className={styles.secondary} disabled={busy} onClick={() => setDeleting(null)}>Batal</button><button className={styles.danger} disabled={busy} onClick={() => void remove()}>{busy ? "Memadam…" : "Padam sumber"}</button></div></Modal>}
  </section><WorkbookInfo workbook={workbook} /><RelatedWorkbooks workbookId={workbookId} /></div>;
}

type Book = { id: number; title: string; subject?: string; year?: string };
function AddSourceDialog({ workbookId, available, onClose, onEmbedded }: { workbookId: string; available: boolean; onClose: () => void; onEmbedded: (ids: string[], queued: Source[]) => void }) {
  const [mode, setMode] = useState<Mode>("web");
  const [drafts, setDrafts] = useState<Source[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [bookQuery, setBookQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [extracting, setExtracting] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [reviewOnly, setReviewOnly] = useState(false);
  const loadedDrafts = useRef(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const alive = useRef(true);
  const inFlight = useRef(new Set<string>());
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const refreshDrafts = useCallback(async () => {
    try { const payload = await api<{ sources: Source[] }>(`/api/workbooks/${workbookId}/sources?drafts=1`); if (alive.current) { setDrafts(payload.sources); if (!loadedDrafts.current) { setReviewOnly(payload.sources.length > 0); loadedDrafts.current = true; } } } catch (err) { if (alive.current) setError((err as Error).message); }
  }, [workbookId]);
  useEffect(() => { const kick = setTimeout(() => void refreshDrafts(), 0); const timer = setInterval(() => void refreshDrafts(), 3500); return () => { clearTimeout(kick); clearInterval(timer); }; }, [refreshDrafts]);
  useEffect(() => {
    if (mode !== "textbook") return;
    const controller = new AbortController();
    const timer = setTimeout(() => { setBusy(true); api<{ books: Book[]; configured: boolean }>(`/api/textbooks?q=${encodeURIComponent(bookQuery)}`, { signal: controller.signal }).then(payload => { setBooks(payload.books); if (!payload.configured) setError("Pangkalan buku teks belum dikonfigurasi. Anda boleh memuat naik fail buku teks."); }).catch(err => { if (!controller.signal.aborted) setError(err.message); }).finally(() => { if (!controller.signal.aborted) setBusy(false); }); }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [mode, bookQuery]);
  async function extract(body: Record<string, unknown> | FormData, candidateUrl?: string) {
    const identity = candidateUrl || (body instanceof FormData ? `file:${(body.get("file") as File)?.name}` : JSON.stringify(body));
    if (inFlight.current.has(identity)) return;
    inFlight.current.add(identity); setExtracting(n => n + 1); setError("");
    if (candidateUrl) setCandidates(rows => rows.map(row => row.url === candidateUrl ? { ...row, state: "extracting", error: undefined } : row));
    try {
      const payload = await api<{ source: Source }>(`/api/workbooks/${workbookId}/sources`, { method: "POST", ...(body instanceof FormData ? { body } : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) });
      if (!alive.current) return;
      setDrafts(rows => [payload.source, ...rows.filter(row => row.id !== payload.source.id)]);
      setPreviewId(payload.source.id); setReviewOnly(true);
      if (candidateUrl) setCandidates(rows => rows.map(row => row.url === candidateUrl ? { ...row, state: undefined, sourceId: payload.source.id } : row));
      if (!(body instanceof FormData) && body.type === "text") { setText(""); setTitle(""); }
    } catch (err) {
      if (!alive.current) return;
      const message = (err as Error).message;
      if (candidateUrl) setCandidates(rows => rows.map(row => row.url === candidateUrl ? { ...row, state: "failed", error: message } : row));
      else setError(message);
    } finally { inFlight.current.delete(identity); if (alive.current) setExtracting(n => Math.max(0, n - 1)); }
  }
  async function search(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setSearched(false);
    try { const payload = await api<{ results: Candidate[] }>(`/api/web-search?q=${encodeURIComponent(query)}&workbookId=${workbookId}`); setCandidates(payload.results ?? []); setSearched(true); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  async function discard(source: Source) {
    try {
      await api(`/api/sources/${source.id}`, { method: "DELETE" });
      setDrafts(rows => rows.filter(row => row.id !== source.id)); setSelected(ids => ids.filter(id => id !== source.id));
    } catch (err) { setError((err as Error).message); }
  }
  async function retryTranscript(source: Source) {
    try { await api(`/api/sources/${source.id}/retry`, { method: "POST" }); await refreshDrafts(); } catch (err) { setError((err as Error).message); }
  }
  async function embed() {
    setSubmitting(true); setError("");
    try { const payload = await api<{ sourceIds: string[] }>(`/api/workbooks/${workbookId}/sources/embed`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sourceIds: selected }) }); onEmbedded(payload.sourceIds, drafts.filter(row => payload.sourceIds.includes(row.id))); } catch (err) { setError((err as Error).message); setSubmitting(false); }
  }
  const ready = drafts.filter(row => row.status === "draft" && row.chars > 0);
  return <Modal title="Tambah sumber" wide onClose={() => { if (!submitting) onClose(); }}>
    <div className={styles.modalHead}><div><span className={styles.eyebrow}>BINA RUJUKAN ANDA</span><h2>Tambah sumber</h2><p>Ekstrak dahulu, semak kandungan, kemudian pilih untuk embed.</p></div><button className={styles.iconButton} aria-label="Tutup tambah sumber" disabled={submitting} onClick={onClose}><X size={21} /></button></div>
    <div className={styles.stepper}><button data-active={!reviewOnly} onClick={() => setReviewOnly(false)}><b>1</b>Ekstrak sumber</button><i /><button data-active={reviewOnly} disabled={!drafts.length} onClick={() => setReviewOnly(true)}><b>2</b>Semak & pilih</button><i /><span><b>3</b>Embed untuk AI</span></div>
    <div className={styles.modalBody}>
      <nav className={styles.modes} aria-label="Jenis sumber">{MODES.map(item => <button key={item.id} aria-pressed={!reviewOnly && mode === item.id} onClick={() => { setMode(item.id); setReviewOnly(false); setError(""); }}><item.icon size={20} /><span>{item.label}<small>{item.hint}</small></span></button>)}{drafts.length > 0 && <button aria-pressed={reviewOnly} onClick={() => setReviewOnly(true)}><CheckCheck size={20} /><span>Semak sumber<small>{drafts.length} sumber · {selected.length} dipilih</small></span></button>}<div className={styles.sidebarNote}><Sparkles size={18} /><p>Anda yang tentukan sumber.<br />AI hanya menggunakan bahan yang anda pilih.</p></div></nav>
      <div className={styles.extractPanel}>
        {error && <div className={styles.error} role="alert"><CircleAlert size={17} /><span>{error}</span></div>}
        {!reviewOnly && mode === "web" && <><div className={styles.panelHeading}><span className={styles.fileIcon}><Globe size={20} /></span><div><h3>Cari sumber yang sesuai</h3><p>Carian mengambil kira topik dan tahap buku kerja anda.</p></div></div><form onSubmit={event => void search(event)} className={styles.searchForm}><label className={styles.search}><Search size={17} /><input aria-label="Topik carian web" placeholder="cth. proses kitaran air tahun 4" value={query} onChange={event => setQuery(event.target.value)} minLength={3} required /></label><button className={styles.primary} disabled={busy || query.trim().length < 3}>{busy ? <LoaderCircle size={16} className={styles.spin} /> : <Search size={16} />}Cari</button></form><details className={styles.directLink}><summary>Sudah ada pautan artikel?</summary><form className={styles.searchForm} onSubmit={event => { event.preventDefault(); void extract({ type: "url", url }); }}><input className={styles.input} type="url" required placeholder="https://…" aria-label="Pautan artikel" value={url} onChange={event => setUrl(event.target.value)} /><button className={styles.secondary} disabled={extracting > 0}>Ekstrak teks</button></form></details>
        {candidates.length > 0 && <div className={styles.resultsHead}><strong>{candidates.length} hasil carian</strong><span>Ekstrak artikel untuk melihat teks sebenar.</span></div>}
        <div className={styles.candidates}>{candidates.map(candidate => <article className={styles.candidate} key={candidate.url}><div className={styles.candidateSite}><Globe size={12} />{candidate.site}</div><a href={candidate.url} target="_blank" rel="noopener noreferrer" className={styles.candidateTitle}>{candidate.title}<ExternalLink size={12} /></a><p>{candidate.snippet}</p>{candidate.error && <p className={styles.failure}>{candidate.error}</p>}<button className={candidate.sourceId ? styles.textButton : styles.secondary} disabled={candidate.state === "extracting" || Boolean(candidate.sourceId)} onClick={() => void extract({ type: "url", url: candidate.url, title: candidate.title }, candidate.url)}>{candidate.state === "extracting" ? <><LoaderCircle size={14} className={styles.spin} />Mengekstrak teks…</> : candidate.sourceId ? <><Check size={14} />Teks diekstrak · semak di bawah</> : candidate.state === "failed" ? <><RefreshCw size={14} />Cuba ekstrak lagi</> : <>Ekstrak & semak<ChevronRight size={14} /></>}</button></article>)}</div>
        {!candidates.length && <div className={styles.searchEmpty}><Globe size={30} /><h4>{searched ? "Tiada artikel ditemui" : "Temui bahan untuk pembelajaran anda"}</h4><p>{searched ? "Cuba kata kunci yang lebih khusus atau tampal pautan artikel." : "Cari topik, semak teks artikel, dan pilih sumber yang berguna."}</p></div>}</>}
        {!reviewOnly && mode === "upload" && <><div className={styles.panelHeading}><span className={styles.fileIcon}><CloudUpload size={22} /></span><div><h3>Muat naik bahan anda</h3><p>Teks akan diekstrak untuk anda semak dahulu.</p></div></div><label className={styles.dropzone} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const files = [...event.dataTransfer.files].slice(0, 10); files.forEach(file => { const form = new FormData(); form.append("file", file); void extract(form); }); }}><CloudUpload size={38} /><strong>Seret fail ke sini atau pilih fail</strong><span>PDF berteks, DOCX, TXT, MD atau CSV · sehingga 25 MB</span><input aria-label="Pilih fail sumber" type="file" accept=".pdf,.docx,.txt,.md,.csv" multiple disabled={extracting > 0} onChange={event => { [...(event.target.files ?? [])].slice(0, 10).forEach(file => { const form = new FormData(); form.append("file", file); void extract(form); }); event.target.value = ""; }} /></label><p className={styles.helper}>PDF imbasan tanpa teks perlu ditukar kepada teks terlebih dahulu.</p></>}
        {!reviewOnly && mode === "text" && <><div className={styles.panelHeading}><span className={styles.fileIcon}><FileText size={21} /></span><div><h3>Tambah nota atau petikan</h3><p>Gunakan teks yang ingin dijadikan rujukan pembelajaran.</p></div></div><form className={styles.textForm} onSubmit={event => { event.preventDefault(); void extract({ type: "text", title: title || "Nota saya", text }); }}><label>Tajuk sumber<input className={styles.input} value={title} maxLength={160} placeholder="cth. Nota Cikgu — Kitaran Air" onChange={event => setTitle(event.target.value)} /></label><label>Kandungan teks<textarea className={styles.input} value={text} rows={7} minLength={30} maxLength={400000} required placeholder="Tampal nota atau petikan anda di sini…" onChange={event => setText(event.target.value)} /></label><div className={styles.formEnd}><span>{text.length.toLocaleString()} aksara · minimum 30</span><button className={styles.primary} disabled={extracting > 0 || text.trim().length < 30}>Ekstrak & semak<ChevronRight size={15} /></button></div></form></>}
        {!reviewOnly && mode === "youtube" && <><div className={styles.panelHeading}><span className={styles.fileIcon}><Video size={22} /></span><div><h3>Belajar daripada video</h3><p>Kami akan mendapatkan transkrip untuk anda semak.</p></div></div><form className={styles.textForm} onSubmit={event => { event.preventDefault(); void extract({ type: "youtube", url }); }}><label>Pautan video YouTube<input className={styles.input} type="url" required value={url} placeholder="https://www.youtube.com/watch?v=…" onChange={event => setUrl(event.target.value)} /></label><p className={styles.helper}>Video tanpa sari kata mungkin mengambil masa lebih lama untuk ditranskripsi.</p><button className={styles.primary} disabled={extracting > 0}>Dapatkan transkrip<ChevronRight size={15} /></button></form></>}
        {!reviewOnly && mode === "textbook" && <><div className={styles.panelHeading}><span className={styles.fileIcon}><BookOpen size={22} /></span><div><h3>Pilih buku teks</h3><p>Ekstrak kandungan buku sebagai sumber rujukan.</p></div></div><label className={styles.search}><Search size={17} /><input value={bookQuery} aria-label="Cari buku teks" placeholder="Cari tajuk buku teks…" onChange={event => setBookQuery(event.target.value)} /></label><div className={styles.candidates}>{books.map(book => <article className={styles.book} key={book.id}><BookOpen size={22} /><strong>{book.title}</strong><button className={styles.secondary} disabled={extracting > 0} onClick={() => void extract({ type: "textbook", bookId: book.id })}>Ekstrak teks</button></article>)}</div>{!books.length && !busy && <p className={styles.noResults}>Tiada buku teks ditemui. Cuba carian lain atau muat naik fail.</p>}</>}
        {extracting > 0 && <div className={styles.extracting} role="status"><LoaderCircle size={17} className={styles.spin} />Mengekstrak {extracting} sumber. Anda boleh terus menyemak sumber lain.</div>}
        {reviewOnly && !drafts.length && <div className={styles.searchEmpty}><CheckCheck size={30} /><h4>Tiada sumber menunggu semakan</h4><p>Pilih jenis sumber di sebelah untuk menambah bahan baharu.</p><button className={styles.secondary} onClick={() => setReviewOnly(false)}>Ekstrak sumber</button></div>}{reviewOnly && drafts.length > 0 && <section className={styles.review} aria-labelledby="review-title"><div className={styles.reviewHead}><div><span className={styles.eyebrow}>SEMAK SEBELUM EMBED</span><h3 id="review-title">Sumber yang diekstrak <span>{drafts.length}</span></h3></div><label className={styles.selectAll}><input type="checkbox" checked={ready.length > 0 && ready.every(row => selected.includes(row.id))} disabled={!ready.length} onChange={event => setSelected(event.target.checked ? ready.map(row => row.id).slice(0, 20) : [])} />Pilih semua</label></div><p className={styles.helper}>Tandakan satu demi satu sumber yang anda mahu gunakan. Draf lain akan disimpan untuk kemudian.</p><div className={styles.drafts}>{drafts.map(source => <div key={source.id} className={styles.draft} data-selected={selected.includes(source.id)}><label><input type="checkbox" aria-label={`Pilih ${source.title} untuk embed`} disabled={source.status !== "draft" || !source.chars || (selected.length >= 20 && !selected.includes(source.id))} checked={selected.includes(source.id)} onChange={event => setSelected(event.target.checked ? [...selected, source.id] : selected.filter(id => id !== source.id))} /><span><strong>{source.title}</strong><small>{source.status === "processing" ? "Mendapatkan transkrip…" : source.status === "failed" ? source.error : `${words(source)} · Belum diembed`}</small></span></label><button className={styles.textButton} onClick={() => setPreviewId(previewId === source.id ? null : source.id)} aria-expanded={previewId === source.id}>Semak teks</button>{source.status === "failed" && source.kind === "youtube" && <button className={styles.textButton} onClick={() => void retryTranscript(source)}>Cuba lagi</button>}{source.canDelete && <button className={styles.iconButton} aria-label={`Buang draf ${source.title}`} onClick={() => void discard(source)}><X size={14} /></button>}{previewId === source.id && <div className={styles.draftPreview}>{source.meta.relevanceReason && <p className={styles.relevance}><Sparkles size={13} />{source.meta.relevanceReason}</p>}<p>{source.preview || source.error || "Transkrip sedang disediakan. Sumber boleh dipilih apabila teks tersedia."}</p>{source.chars > 2400 && <small>Pratonton 2,400 aksara pertama · teks penuh disimpan</small>}{source.meta.url && <a href={source.meta.url} target="_blank" rel="noopener noreferrer">Lihat sumber asal <ExternalLink size={12} /></a>}</div>}</div>)}</div></section>}
      </div>
    </div>
    <div className={styles.modalFooter}><div><strong>{selected.length} sumber dipilih</strong>{!reviewOnly && drafts.length > 0 && <button className={styles.reviewShortcut} onClick={() => setReviewOnly(true)}>Semak {drafts.length} sumber →</button>}<small>{!available ? "Model embedding belum dikonfigurasi pada pelayan." : "Kemajuan embedding akan dipaparkan dalam tab Sumber."}</small></div><div className={styles.footerActions}><button className={styles.secondary} disabled={submitting} onClick={onClose}>Simpan & tutup</button><button className={styles.primary} disabled={!selected.length || submitting || !available} onClick={() => void embed()}>{submitting ? <LoaderCircle size={16} className={styles.spin} /> : <Sparkles size={16} />}{submitting ? "Menghantar…" : `Embed ${selected.length || ""} sumber dipilih`}</button></div></div>
  </Modal>;
}
