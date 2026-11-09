"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Bookmark, CalendarDays, Check, ChevronLeft, ChevronRight, Copy, GraduationCap, Link2, Share2, Sparkles, UserRound } from "lucide-react";
import type { AppWorkbook } from "@/lib/workbooks";
import { subjectById, type SubjectId } from "@/lib/demo-data";
import { toggleSave, useSocial } from "@/lib/demo-social";
import { WorkbookDialog } from "./workbook-dialog";
import styles from "./references.module.css";
export function WorkbookInfo({ workbook }: { workbook: AppWorkbook }) {
  const [share, setShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const subject = subjectById(workbook.subjectId);
  async function copy() { try { await navigator.clipboard.writeText(`${location.origin}/workbooks/${workbook.id}`); setCopied(true); setError(""); } catch { setError("Salin pautan yang dipaparkan di bawah."); } }
  return <aside className={styles.sidebar} aria-label="Maklumat buku kerja"><section className={styles.infoCard}><h2><Sparkles size={22} />Maklumat Buku Kerja</h2><dl>{[{ icon: BookOpen, title: "Subjek", value: subject.name }, { icon: GraduationCap, title: "Tahap", value: workbook.yearLabel || "Tidak dinyatakan" }, { icon: CalendarDays, title: "Dikemas kini", value: workbook.updatedDaysAgo === 0 ? "Hari ini" : `${workbook.updatedDaysAgo} hari lalu` }, { icon: UserRound, title: "Oleh", value: workbook.teacherName }].map(row => <div key={row.title}><span><row.icon size={23} /></span><div><dt>{row.title}</dt><dd>{row.value}</dd></div></div>)}</dl></section><section className={styles.shareCard}><div><h3>Belajar lebih seronok bersama</h3><p>Simpan pautan buku kerja untuk rujukan anda.</p><button type="button" onClick={() => setShare(true)}><Share2 size={15} />Kongsi pautan</button></div><img src="/assets/thiings/graduation.png" alt="" /></section>{share && <WorkbookDialog title="Kongsi pautan buku kerja" onClose={() => { setShare(false); setCopied(false); }}><div className={styles.shareDialog}><span className={styles.shareIcon}><Link2 size={26} /></span><h2>Kongsi pautan buku kerja</h2><p>{workbook.title}</p><label>Pautan buku kerja<input readOnly value={`${typeof location !== "undefined" ? location.origin : ""}/workbooks/${workbook.id}`} onFocus={event => event.target.select()} /></label><p className={styles.privacyNote}>Pautan ini mengikut kebenaran akses buku kerja. Menyalin pautan tidak mengubah tetapan privasinya.{workbook.visibility === "private" ? " Buku kerja ini peribadi." : ""}</p>{error && <p role="alert">{error}</p>}<button className={styles.primary} onClick={() => void copy()}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Pautan disalin" : "Salin pautan"}</button></div></WorkbookDialog>}</aside>;
}
type Related = { id: string; title: string; subjectId: SubjectId; yearLabel: string };
export function RelatedWorkbooks({ workbookId }: { workbookId: string }) {
  const [rows, setRows] = useState<Related[]>([]);
  const [offset, setOffset] = useState(0);
  const { saved } = useSocial();
  useEffect(() => { const controller = new AbortController(); fetch(`/api/workbooks/${workbookId}/related`, { signal: controller.signal }).then(res => res.ok ? res.json() : null).then(payload => { if (payload?.workbooks) setRows(payload.workbooks); }).catch(() => undefined); return () => controller.abort(); }, [workbookId]);
  if (!rows.length) return null;
  return <section className={styles.related} aria-labelledby="related-title"><div className={styles.relatedHead}><span className={styles.ideaIcon}><img src="/assets/thiings/idea.png" alt="" /></span><div><h2 id="related-title">Cuba juga</h2><p>Buku kerja berkaitan yang mungkin anda suka</p></div><Link href="/workbooks">Lihat semua<ArrowRight size={15} /></Link></div><div className={styles.relatedRow}><div className={styles.relatedGrid}>{rows.slice(offset, offset + 3).map(row => { const subject = subjectById(row.subjectId); return <article key={row.id} className={styles.relatedCard}><Link href={`/workbooks/${row.id}`}><span><img src={subject.asset} alt="" /></span><div><h3>{row.title}</h3><p>{subject.name} · {row.yearLabel}</p></div></Link><button aria-label={`${saved.includes(row.id) ? "Nyahsimpan" : "Simpan"} ${row.title}`} aria-pressed={saved.includes(row.id)} title="Simpan pada peranti ini" onClick={() => toggleSave(row.id)}><Bookmark size={16} fill={saved.includes(row.id) ? "currentColor" : "none"} /></button></article>; })}</div>{rows.length > 3 && <div className={styles.relatedArrows}><button aria-label="Buku kerja sebelumnya" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 3))}><ChevronLeft size={19} /></button><button aria-label="Buku kerja seterusnya" disabled={offset + 3 >= rows.length} onClick={() => setOffset(Math.min(rows.length - 1, offset + 3))}><ChevronRight size={19} /></button></div>}</div></section>;
}
