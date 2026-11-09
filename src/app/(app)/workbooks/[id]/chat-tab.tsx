"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, BookOpen, CircleAlert, ExternalLink, LoaderCircle, MessageSquareText, RefreshCw, Sparkles } from "lucide-react";
import { useWorkbookSources } from "@/lib/workbook/use-sources";
import type { ChatTurn } from "@/lib/workbook/chat";
import { SourceScope } from "./source-scope";
import styles from "./chat.module.css";

const SUGGESTIONS = ["Ringkaskan sumber ini dengan mudah", "Terangkan konsep yang paling penting", "Beri contoh untuk membantu saya faham"];
export function ChatTab({ workbookId, onManageSources }: { workbookId: string; onManageSources: () => void }) {
  const sourceState = useWorkbookSources(workbookId);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState("");
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState("");
  const [retryId, setRetryId] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/workbooks/${workbookId}/chat`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Sembang gagal dimuatkan.");
      setTurns(payload.turns); setAvailable(payload.available); setError("");
    } catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  }, [workbookId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (pending || turns.length) end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [turns.length, pending]);
  async function send(value = input) {
    const question = value.trim();
    if (!question || pending || !sourceState.selectedIds.length || !available) return;
    const requestId = retryId || crypto.randomUUID();
    setPending(question); setInput(""); setError("");
    try {
      const response = await fetch(`/api/workbooks/${workbookId}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId, message: question, sourceIds: sourceState.selectedIds }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Jawapan tidak dapat dijana. Cuba lagi.");
      setTurns(current => [...current.filter(turn => turn.id !== payload.turn.id), payload.turn]); setRetryId(null);
    } catch (err) { setError((err as Error).message); setInput(question); setRetryId(requestId); }
    finally { setPending(""); inputRef.current?.focus(); }
  }
  const canSend = sourceState.selectedIds.length > 0 && available && !loading;
  return <section className={styles.panel} aria-labelledby="chat-heading">
    <div className={styles.header}><div><span className={styles.eyebrow}>BELAJAR BERSAMA PIXEL</span><h2 id="chat-heading">Sembang AI</h2><p>Tanya soalan, fahami konsep, dan semak rujukan daripada sumber anda.</p></div><span className={styles.pixel}><Sparkles size={22} /></span></div>
    <SourceScope state={sourceState} onManageSources={onManageSources} />
    {!available && <p className={styles.error} role="alert">Perkhidmatan AI belum dikonfigurasi pada pelayan.</p>}
    <div className={styles.conversation} aria-label="Perbualan dengan Pixel AI" aria-busy={Boolean(pending)}>
      {loading ? <div className={styles.empty}><LoaderCircle className={styles.spin} /><p>Memuatkan sembang…</p></div> : !turns.length && !pending ? <div className={styles.empty}><img src="/assets/thiings/mission-chat.png" width={88} height={88} alt="" /><h3>Apa yang ingin anda fahami?</h3><p>{sourceState.selectedIds.length ? "Sumber anda sudah sedia. Mulakan dengan soalan atau pilih cadangan di bawah." : sourceState.processing.length ? "Sumber sedang disediakan. Anda boleh mula bertanya sebaik sahaja embedding siap." : "Pilih sumber yang siap di atas untuk mula berbual dengan Pixel."}</p><div className={styles.suggestions}>{SUGGESTIONS.map(question => <button type="button" key={question} disabled={!canSend} onClick={() => void send(question)}><MessageSquareText size={14} />{question}</button>)}</div></div> : <>
        {turns.map(turn => <div className={styles.turn} key={turn.id}><div className={styles.question}><span>Anda</span><p>{turn.question}</p></div><article className={styles.answer}><div className={styles.answerLabel}><Sparkles size={16} />Pixel AI</div><div className={styles.answerText}>{turn.answer}</div>{turn.citations.length > 0 && <details className={styles.citations}><summary><BookOpen size={13} />Rujukan jawapan · {turn.citations.length}</summary><div>{turn.citations.map(citation => <div key={citation.index}><strong>[{citation.index}] {citation.title}</strong><p>{citation.excerpt}</p>{citation.url && <a href={citation.url} target="_blank" rel="noopener noreferrer">Buka sumber asal<ExternalLink size={11} /></a>}</div>)}</div></details>}</article></div>)}
        {pending && <div className={styles.turn}><div className={styles.question}><span>Anda</span><p>{pending}</p></div><div className={styles.thinking} role="status"><LoaderCircle size={16} className={styles.spin} />Pixel sedang membaca sumber dan menyediakan jawapan…</div></div>}
      </>}
      <div ref={end} />
    </div>
    {error && <div className={styles.error} role="alert"><CircleAlert size={16} /><span>{error}</span>{!turns.length && !input && <button type="button" onClick={() => void load()}><RefreshCw size={13} />Cuba lagi</button>}</div>}
    <form className={styles.composer} onSubmit={event => { event.preventDefault(); void send(); }}><textarea ref={inputRef} aria-label="Soalan kepada Pixel AI" value={input} onChange={event => { setInput(event.target.value); setRetryId(null); }} placeholder={sourceState.processing.length && !canSend ? "Anda boleh bertanya selepas embedding selesai…" : "Tanya apa-apa tentang sumber yang dipilih…"} rows={2} maxLength={4000} disabled={!canSend || Boolean(pending)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} /><button type="submit" aria-label="Hantar soalan" disabled={!canSend || !input.trim() || Boolean(pending)}>{pending ? <LoaderCircle size={19} className={styles.spin} /> : <ArrowUp size={21} />}</button></form>
    <div className={styles.composerHint}><span>Enter untuk hantar · Shift + Enter untuk baris baharu</span><span>Jawapan AI berpandukan sumber yang dipilih. Semak rujukan untuk kepastian.</span></div>
  </section>;
}
