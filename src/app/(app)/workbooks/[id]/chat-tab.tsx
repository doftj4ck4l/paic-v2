"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, BookOpen, Check, ChevronDown, CircleAlert, LoaderCircle, MessageSquareText, Pencil, Plus, RefreshCw, Sparkles, Square, Trash2, X } from "lucide-react";
import { useWorkbookSources } from "@/lib/workbook/use-sources";
import type { ChatTurn } from "@/lib/workbook/chat";
import { WorkbookDialog } from "./workbook-dialog";
import styles from "./chat.module.css";

const SUGGESTIONS = ["Ringkaskan sumber ini dengan mudah", "Terangkan konsep yang paling penting", "Beri contoh untuk membantu saya faham"];

type Session = { id: string; title: string; sourceIds: string[]; createdAt: string; updatedAt: string; messageCount: number };

function timeAgo(value: string) {
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (days <= 0) return "Hari ini";
  if (days === 1) return "Semalam";
  return `${days} hari lalu`;
}

export function ChatTab({ workbookId, pendingQuery = null, onQueryConsumed }: { workbookId: string; pendingQuery?: string | null; onQueryConsumed?: () => void }) {
  const sourceState = useWorkbookSources(workbookId);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [pending, setPending] = useState("");
  const [streamText, setStreamText] = useState("");
  const [phase, setPhase] = useState<"idle" | "thinking" | "streaming">("idle");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadTurns = useCallback(async (target: string | null) => {
    const response = await fetch(`/api/workbooks/${workbookId}/chat${target ? `?sessionId=${target}` : ""}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Sembang gagal dimuatkan.");
    setTurns(payload.turns ?? []);
    setAvailable(payload.available !== false);
  }, [workbookId]);

  const loadSessions = useCallback(async (preferId?: string | null) => {
    try {
      const response = await fetch(`/api/workbooks/${workbookId}/chat/sessions`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Sesi gagal dimuatkan.");
      const list = payload.sessions as Session[];
      setSessions(list);
      const nextId = preferId === undefined ? list[0]?.id ?? null : preferId;
      setSessionId(nextId);
      await loadTurns(nextId);
      setError("");
    } catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  }, [workbookId, loadTurns]);

  useEffect(() => { const kick = setTimeout(() => void loadSessions(), 0); return () => clearTimeout(kick); }, [loadSessions]);
  useEffect(() => { if (pending || turns.length) end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [turns.length, pending, streamText.length]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  async function send(value = input) {
    const question = value.trim();
    if (!question || phase !== "idle" || !sourceState.selectedIds.length || !available) return;
    setPending(question); setInput(""); setError(""); setStreamText(""); setPhase("thinking");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch(`/api/workbooks/${workbookId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: crypto.randomUUID(), message: question, sourceIds: sourceState.selectedIds, sessionId: sessionId ?? undefined }),
        signal: controller.signal,
      });
      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || contentType.includes("application/json")) {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Jawapan tidak dapat dijana. Cuba lagi.");
        setTurns(current => [...current.filter(turn => turn.id !== payload.turn.id), payload.turn]);
        if (payload.sessionId) setSessionId(payload.sessionId);
      } else {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;
          buffer += decoder.decode(chunk, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as { type: string; text?: string; message?: string; turn?: ChatTurn; sessionId?: string };
            if (event.type === "session" && event.sessionId) setSessionId(event.sessionId);
            else if (event.type === "delta" && event.text) { setPhase("streaming"); setStreamText(current => current + event.text); }
            else if (event.type === "done" && event.turn) setTurns(current => [...current, event.turn!]);
            else if (event.type === "error") throw new Error(event.message || "Jawapan tidak dapat dijana.");
          }
        }
        await loadSessions();
      }
    } catch (err) {
      if (!controller.signal.aborted) setError((err as Error).message);
    } finally {
      abortRef.current = null;
      setPending(""); setStreamText(""); setPhase("idle");
      inputRef.current?.focus();
    }
  }

  function stop() { abortRef.current?.abort(); }

  const consumedQuery = useRef<string | null>(null);
  useEffect(() => {
    if (!pendingQuery || consumedQuery.current === pendingQuery) return;
    if (loading || !available || sourceState.loading || phase !== "idle" || !sourceState.selectedIds.length) return;
    consumedQuery.current = pendingQuery;
    onQueryConsumed?.();
    const timer = window.setTimeout(() => { void send(pendingQuery); }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuery, loading, available, sourceState.loading, sourceState.selectedIds, phase]);

  async function openSession(id: string) {
    setMenuOpen(false); setSessionId(id); setDismissedBanner(null); setLoading(true);
    try { await loadTurns(id); setError(""); } catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  }

  function newSession() {
    setMenuOpen(false); setSessionId(null); setTurns([]); setDismissedBanner(null); setError("");
    inputRef.current?.focus();
  }

  async function saveRename() {
    if (!renaming || !renaming.title.trim()) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/workbooks/${workbookId}/chat/sessions/${renaming.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: renaming.title.trim() }) });
      if (!response.ok) throw new Error("Tajuk tidak dapat disimpan.");
      setSessions(current => current.map(session => session.id === renaming.id ? { ...session, title: renaming.title.trim() } : session));
      setRenaming(null);
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  async function removeSession() {
    if (!deleting) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/workbooks/${workbookId}/chat/sessions/${deleting.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Sesi tidak dapat dipadam.");
      setSessions(current => current.filter(session => session.id !== deleting.id));
      if (sessionId === deleting.id) { setSessionId(null); setTurns([]); }
      setDeleting(null);
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  const activeSession = sessions.find(session => session.id === sessionId) ?? null;
  const readyTitles = new Map(sourceState.ready.map(source => [source.id, source.title]));
  const sessionSourceIds = activeSession?.sourceIds ?? [];
  const selectionDiffers = Boolean(sessionId && sessionSourceIds.length > 0 && (sessionSourceIds.length !== sourceState.selectedIds.length || sessionSourceIds.some(id => !sourceState.selectedIds.includes(id))));
  const showBanner = selectionDiffers && dismissedBanner !== sessionId && sessionSourceIds.some(id => readyTitles.has(id));
  const canSend = sourceState.selectedIds.length > 0 && available && phase === "idle" && !loading;

  return <section className={styles.panel} aria-labelledby="chat-heading">
    <div className={styles.header}><div><span className={styles.eyebrow}>BELAJAR BERSAMA PIXEL</span><h2 id="chat-heading">Sembang AI</h2><p>Tanya soalan, fahami konsep, dan semak rujukan daripada sumber anda.</p></div><span className={styles.pixel}><Sparkles size={22} /></span></div>

    <div className={styles.sessionBar}>
      <div className={styles.sessionMenu} ref={menuRef}>
        <button type="button" className={styles.sessionTrigger} aria-expanded={menuOpen} aria-haspopup="true" onClick={() => setMenuOpen(open => !open)}>
          <MessageSquareText size={14} aria-hidden="true" />
          <span>{activeSession?.title ?? "Sembang baharu"}</span>
          {sessions.length > 0 && <span className={styles.sessionCount}>{sessions.length}</span>}
          <ChevronDown size={14} className={styles.sessionChevron} aria-hidden="true" />
        </button>
        {menuOpen && (
          <div className={styles.sessionPanel}>
            <button type="button" className={styles.newSession} onClick={newSession}><Plus size={15} aria-hidden="true" />Sembang baharu</button>
            {sessions.length === 0 ? (
              <p className={styles.sessionEmpty}>Sesi pertama anda akan muncul di sini.</p>
            ) : (
              <div className={styles.sessionList}>
                {sessions.map(session => (
                  <div key={session.id} className={styles.sessionRow} data-active={session.id === sessionId}>
                    {renaming?.id === session.id ? (
                      <form className={styles.renameForm} onSubmit={event => { event.preventDefault(); void saveRename(); }}>
                        <input autoFocus value={renaming.title} maxLength={120} aria-label="Tajuk sesi" onChange={event => setRenaming({ id: session.id, title: event.target.value })} />
                        <button type="submit" aria-label="Simpan tajuk" disabled={busy}><Check size={14} /></button>
                        <button type="button" aria-label="Batal" onClick={() => setRenaming(null)}><X size={14} /></button>
                      </form>
                    ) : (
                      <>
                        <button type="button" className={styles.sessionOpen} onClick={() => void openSession(session.id)}>
                          <strong>{session.title}</strong>
                          <small>{timeAgo(session.updatedAt)} · {session.messageCount} soalan</small>
                        </button>
                        <span className={styles.sessionActions}>
                          <button type="button" aria-label={`Namakan semula ${session.title}`} onClick={() => setRenaming({ id: session.id, title: session.title })}><Pencil size={13} /></button>
                          <button type="button" aria-label={`Padam ${session.title}`} onClick={() => { setMenuOpen(false); setDeleting(session); }}><Trash2 size={13} /></button>
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <button type="button" className={styles.newSessionInline} onClick={newSession}><Plus size={14} aria-hidden="true" />Sembang baharu</button>
    </div>

    {showBanner && (
      <div className={styles.sourceBanner} role="status">
        <BookOpen size={15} aria-hidden="true" />
        <span>Sesi ini menggunakan sumber: <strong>{sessionSourceIds.filter(id => readyTitles.has(id)).map(id => readyTitles.get(id)).slice(0, 3).join(", ")}{sessionSourceIds.filter(id => readyTitles.has(id)).length > 3 ? "…" : ""}</strong></span>
        <button type="button" onClick={() => { sourceState.select(sessionSourceIds.filter(id => readyTitles.has(id))); setDismissedBanner(sessionId); }}>Guna sumber sesi ini</button>
        <button type="button" className={styles.bannerDismiss} aria-label="Tutup pemberitahuan" onClick={() => setDismissedBanner(sessionId)}><X size={14} /></button>
      </div>
    )}

    {!available && <p className={styles.error} role="alert">Perkhidmatan AI belum dikonfigurasi pada pelayan.</p>}
    <div className={styles.conversation} aria-label="Perbualan dengan Pixel AI" aria-busy={phase !== "idle"}>
      {loading ? <div className={styles.empty}><LoaderCircle className={styles.spin} /><p>Memuatkan sembang…</p></div> : !turns.length && !pending ? <div className={styles.empty}><img src="/assets/thiings/mission-chat.png" width={88} height={88} alt="" /><h3>Apa yang ingin anda fahami?</h3><p>{sourceState.selectedIds.length ? "Sumber anda sudah sedia. Mulakan dengan soalan atau pilih cadangan di bawah." : sourceState.processing.length ? "Sumber sedang disediakan. Anda boleh mula bertanya sebaik sahaja embedding siap." : "Pilih sumber di tab Sumber dahulu untuk mula berbual dengan Pixel."}</p><div className={styles.suggestions}>{SUGGESTIONS.map(question => <button type="button" key={question} disabled={!canSend} onClick={() => void send(question)}><MessageSquareText size={14} />{question}</button>)}</div></div> : <>
        {turns.map(turn => <div className={styles.turn} key={turn.id}><div className={styles.question}><span>Anda</span><p>{turn.question}</p></div><article className={styles.answer}><div className={styles.answerLabel}><Sparkles size={16} />Pixel AI</div><div className={styles.answerText}><Markdown remarkPlugins={[remarkGfm]} components={{ a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}>{turn.answer}</Markdown></div>{turn.citations.length > 0 && <details className={styles.citations}><summary><BookOpen size={13} />Rujukan jawapan · {turn.citations.length}</summary><div>{turn.citations.map(citation => <div key={citation.index}><strong>[{citation.index}] {citation.title}</strong><p>{citation.excerpt}</p>{citation.url && <a href={citation.url} target="_blank" rel="noopener noreferrer">Buka sumber asal</a>}</div>)}</div></details>}</article></div>)}
        {pending && <div className={styles.turn}><div className={styles.question}><span>Anda</span><p>{pending}</p></div>{phase === "thinking" ? <div className={styles.thinking} role="status"><LoaderCircle size={16} className={styles.spin} />Pixel sedang membaca sumber dan menyediakan jawapan…</div> : <article className={styles.answer}><div className={styles.answerLabel}><Sparkles size={16} />Pixel AI</div><div className={styles.answerText}><Markdown remarkPlugins={[remarkGfm]}>{streamText}</Markdown><span className={styles.cursor} aria-hidden="true" /></div></article>}</div>}
      </>}
      <div ref={end} />
    </div>
    {error && <div className={styles.error} role="alert"><CircleAlert size={16} /><span>{error}</span>{!turns.length && !input && <button type="button" onClick={() => void loadSessions()}><RefreshCw size={13} />Cuba lagi</button>}</div>}
    <form className={styles.composer} onSubmit={event => { event.preventDefault(); void send(); }}><textarea ref={inputRef} aria-label="Soalan kepada Pixel AI" value={input} onChange={event => setInput(event.target.value)} placeholder={phase !== "idle" ? "Pixel sedang menjawab…" : sourceState.processing.length && !sourceState.selectedIds.length ? "Anda boleh bertanya selepas embedding selesai…" : "Tanya apa-apa tentang sumber yang dipilih…"} rows={2} maxLength={4000} disabled={!canSend} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} />{phase !== "idle" ? <button type="button" onClick={stop} aria-label="Hentikan jawapan" className={styles.stopButton}><Square size={16} fill="currentColor" /></button> : <button type="submit" aria-label="Hantar soalan" disabled={!canSend || !input.trim()}>{<ArrowUp size={21} />}</button>}</form>
    <div className={styles.composerHint}><span>Enter untuk hantar · Shift + Enter untuk baris baharu</span><span>Jawapan AI berpandukan sumber yang dipilih. Semak rujukan untuk kepastian.</span></div>

    {deleting && <WorkbookDialog title="Padam sesi" onClose={() => { if (!busy) setDeleting(null); }}><div className={styles.confirmDelete}><h2>Padam sesi ini?</h2><strong>{deleting.title}</strong><p>Semua soalan dan jawapan dalam sesi ini akan dipadam. Sumber buku kerja dikekalkan.</p><div><button type="button" className={styles.secondary} disabled={busy} onClick={() => setDeleting(null)}>Batal</button><button type="button" className={styles.danger} disabled={busy} onClick={() => void removeSession()}>{busy ? "Memadam…" : "Padam sesi"}</button></div></div></WorkbookDialog>}
  </section>;
}
