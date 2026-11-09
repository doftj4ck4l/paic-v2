"use client";
import { useEffect, useRef, useState } from "react";
import { AudioLines, Download, Info, Pause, Play, Square, Volume2 } from "lucide-react";
import type { AudioData } from "@/lib/generation/schemas";
import styles from "../workbook.module.css";

export function AudioView({ artifactId, data }: { artifactId: string; data: AudioData }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState("");
  const [supported, setSupported] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [line, setLine] = useState(0);
  const [error, setError] = useState("");
  const active = useRef(false);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    function load() {
      const list = window.speechSynthesis.getVoices(); setVoices(list);
      setVoice(current => current || list.find(item => /^ms[-_]/i.test(item.lang))?.voiceURI || list.find(item => /^id[-_]/i.test(item.lang))?.voiceURI || list.find(item => /^en[-_]/i.test(item.lang))?.voiceURI || "");
    }
    const frame = requestAnimationFrame(() => { setSupported(true); load(); });
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => { cancelAnimationFrame(frame); active.current = false; window.speechSynthesis.cancel(); window.speechSynthesis.removeEventListener("voiceschanged", load); };
  }, []);
  function stop() { active.current = false; window.speechSynthesis.cancel(); setPlaying(false); setPaused(false); }
  function speak() {
    stop(); setError(""); active.current = true; setPlaying(true);
    function next(index: number) {
      if (!active.current) return;
      if (index >= data.transcript.length) { active.current = false; setPlaying(false); setPaused(false); return; }
      setLine(index);
      const message = new SpeechSynthesisUtterance(data.transcript[index]);
      const chosen = voices.find(item => item.voiceURI === voice);
      if (chosen) message.voice = chosen;
      message.lang = chosen?.lang || "ms-MY"; message.rate = .9;
      message.onend = () => next(index + 1);
      message.onerror = event => { if (!active.current || event.error === "canceled" || event.error === "interrupted") return; setError("Suara peranti tidak dapat dimainkan. Cuba suara lain atau semak tetapan suara peranti."); stop(); };
      utterance.current = message; window.speechSynthesis.speak(message);
    }
    next(0);
  }
  function togglePause() { if (paused) window.speechSynthesis.resume(); else window.speechSynthesis.pause(); setPaused(!paused); }
  function downloadTranscript() { const url = URL.createObjectURL(new Blob([`${data.title}\n\n${data.transcript.join("\n\n")}`], { type: "text/plain;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "transkrip-pelajaran.txt"; anchor.click(); URL.revokeObjectURL(url); }
  return <div className={styles.audioWrap}>
    {data.audio_status === "ready" ? <div className={styles.audioPlayer}><span className={styles.audioPlayerIcon}><AudioLines /></span><audio controls preload="metadata" src={`/api/artifacts/${artifactId}/assets/audio.wav?v=2`} className={styles.audioElement} /></div> : <div className={styles.deviceAudio}>
      <div><span className={styles.audioPlayerIcon}><Volume2 /></span><div><strong>Dengar dengan suara peranti</strong><p>{data.audio_status === "pending" ? "Fail audio sedang dijana. Anda boleh mendengar skrip menggunakan suara peranti sementara menunggu." : "Fail audio pelayan tidak tersedia. Mainkan skrip pelajaran menggunakan suara pada peranti anda."}</p></div></div>
      {supported ? <><label>Suara bacaan<select aria-label="Suara bacaan" value={voice} disabled={playing} onChange={event => setVoice(event.target.value)}>{!voices.length && <option value="">Suara lalai peranti</option>}{voices.map(item => <option key={item.voiceURI} value={item.voiceURI}>{item.name} ({item.lang})</option>)}</select></label><div className={styles.slidesActions}>{!playing ? <button type="button" onClick={speak} className={styles.generateButton}><Play size={15} />Dengar pelajaran</button> : <><button type="button" onClick={togglePause} className={styles.generateButton}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? "Sambung" : "Jeda"}</button><button type="button" onClick={stop} className={styles.slideGhostButton}><Square size={14} />Hentikan</button><span aria-live="polite">Bahagian {line + 1}/{data.transcript.length}</span></>}</div></> : <p className={styles.audioNotice}><Info size={16} />Pelayar ini tidak menyokong suara peranti. Transkrip masih boleh dibaca dan dimuat turun.</p>}
      {error && <p className={styles.generateError} role="alert">{error}</p>}
    </div>}
    <section className={styles.audioTranscript} aria-label="Transkrip audio"><div className={styles.transcriptHead}><h3>Transkrip</h3><button type="button" className={styles.deckNotesButton} onClick={downloadTranscript}><Download size={13} />Muat turun teks</button></div><ol>{data.transcript.map((text, index) => <li key={`${index}-${text.slice(0, 12)}`} data-speaking={playing && line === index}><span className={styles.audioLineNum}>{String(index + 1).padStart(2, "0")}</span>{text}</li>)}</ol></section>
  </div>;
}
