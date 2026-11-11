"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, Check, FileText, Globe, Pencil, Plus, RefreshCw, Trash2, UserMinus, Users, Video, X, Zap, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentTile, SUBJECT_ICONS } from "@/components/studio/content-tile";
import { WORKBOOK_COVER_ART } from "@/app/(app)/workbooks/workbook-list";
import type { SessionUser } from "@/lib/auth-session";
import type { ClassDetail } from "@/lib/classes";
import type { AssignmentView, ClassMaterial, ClassSourceGroup, OwnedWorkbookOption } from "@/lib/assignments";
import type { ClassProgress } from "@/lib/class-progress";
import { dueLabel, dueState, formatDue, formatRelativeTime } from "@/lib/assignment-status";
import { moduleKindLabel } from "@/lib/module-kinds";
import { findSubject } from "@/lib/demo-data";
import { CopyCodeButton } from "../copy-code-button";
import { AssignmentDialog } from "./assignment-dialog";
import styles from "../classes.module.css";
import content from "@/components/studio/content-width.module.css";

const SOURCE_KIND_LABELS: Record<string, string> = {
  web: "Web",
  youtube: "YouTube",
  pdf: "PDF",
  textbook: "Buku teks",
  doc: "Dokumen",
  text: "Nota",
};

const TABS = [
  { key: "overview", label: "Gambaran" },
  { key: "assignments", label: "Buku Kerja" },
  { key: "materials", label: "Sumber" },
  { key: "students", label: "Pelajar" },
  { key: "progress", label: "Kemajuan" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" });
}

function ModuleChips({ assignment, linkable = false }: { assignment: AssignmentView; linkable?: boolean }) {
  if (assignment.moduleKinds === null) {
    return (
      <span className={styles.moduleChips}>
        <em className={styles.moduleChip}>Semua modul</em>
      </span>
    );
  }
  const shown = assignment.moduleKinds.slice(0, 3);
  const rest = assignment.moduleKinds.length - shown.length;
  return (
    <span className={styles.moduleChips}>
      {shown.map((kind) =>
        linkable ? (
          <Link key={kind} href={`/workbooks/${assignment.workbookId}?tab=${kind}`} className={styles.moduleChipLink}>
            {moduleKindLabel(kind)}
          </Link>
        ) : (
          <em key={kind} className={styles.moduleChip}>{moduleKindLabel(kind)}</em>
        ),
      )}
      {rest > 0 && <em className={styles.moduleChip}>+{rest}</em>}
    </span>
  );
}

function SubjectBadge({ subjectId }: { subjectId: string | null }) {
  const subject = findSubject(subjectId);
  const Icon = ((subjectId && (SUBJECT_ICONS as Record<string, LucideIcon>)[subjectId]) || Users) as LucideIcon;
  return (
    <>
      <Icon size={14} aria-hidden="true" />{subject?.name ?? "Subjek"}
    </>
  );
}

function tileTint(subjectId: string | null) {
  return findSubject(subjectId)?.id ?? "science";
}

function tileArt(subjectId: string | null) {
  const subject = findSubject(subjectId);
  if (!subject) return "/assets/thiings/graduation.png";
  return WORKBOOK_COVER_ART[subject.id] ?? subject.asset;
}

const AVATAR_TONES = ["teal", "purple", "amber", "blue", "pink"] as const;

function avatarTone(name: string) {
  let sum = 0;
  for (const character of name) sum += character.charCodeAt(0);
  return AVATAR_TONES[sum % AVATAR_TONES.length];
}

export function ClassDetailView({
  user,
  detail,
  assignments,
  materials,
  sources,
  ownedWorkbooks,
  progress,
  initialTab,
}: {
  user: SessionUser;
  detail: ClassDetail;
  assignments: AssignmentView[];
  materials: ClassMaterial[];
  sources: ClassSourceGroup[];
  ownedWorkbooks: OwnedWorkbookOption[];
  progress: ClassProgress | null;
  initialTab?: TabKey;
}) {
  const router = useRouter();
  const isTeacher = user.role === "teacher";
  const [tab, setTab] = useState<TabKey>(initialTab ?? "overview");
  const [code, setCode] = useState(detail.joinCode);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(detail.name);
  const [savingTitle, setSavingTitle] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [pendingCompletion, setPendingCompletion] = useState<string | null>(null);
  const [confirmDeleteAssignment, setConfirmDeleteAssignment] = useState<string | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<string | null>(null);
  const [materialPending, setMaterialPending] = useState<string | null>(null);

  const subject = findSubject(detail.subjectId);
  const sourceGroups = sources.filter((group) => group.sources.length > 0);
  const members = detail.members;
  const assignedIds = new Set(assignments.map((assignment) => assignment.workbookId));
  const sharedOnly = materials.filter((material) => !assignedIds.has(material.workbookId));
  const sharedIds = new Set(materials.map((material) => material.workbookId));
  const shareable = ownedWorkbooks.filter((workbook) => !assignedIds.has(workbook.id) && !sharedIds.has(workbook.id));

  const visibleTabs = TABS.filter((item) => {
    if (item.key === "students" || item.key === "progress") return isTeacher;
    return true;
  });

  async function saveTitle() {
    const name = titleDraft.trim();
    if (savingTitle) return;
    if (name.length < 2 || name === detail.name) {
      setEditingTitle(false);
      setTitleDraft(detail.name);
      return;
    }
    setSavingTitle(true);
    setError(null);
    const response = await fetch(`/api/subjects/${detail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).catch(() => null);
    if (!response?.ok) {
      setError("Nama subjek tidak dapat dikemas kini. Cuba lagi.");
      setSavingTitle(false);
      return;
    }
    setSavingTitle(false);
    setEditingTitle(false);
    router.refresh();
  }

  async function rotateCode() {
    if (rotating) return;
    setRotating(true);
    setError(null);
    const response = await fetch(`/api/subjects/${detail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rotateCode: true }),
    }).catch(() => null);
    const payload = response ? ((await response.json().catch(() => null)) as { class?: { joinCode: string | null }; error?: string } | null) : null;
    if (!response?.ok || !payload?.class?.joinCode) {
      setError(payload?.error ?? "Kod tidak dapat dijana semula. Cuba lagi.");
      setRotating(false);
      return;
    }
    setCode(payload.class.joinCode);
    setRotating(false);
  }

  async function removeMember(studentId: string) {
    if (removing) return;
    setRemoving(studentId);
    setError(null);
    const response = await fetch(`/api/subjects/${detail.id}/members/${studentId}`, { method: "DELETE" }).catch(() => null);
    if (!response?.ok) {
      setError("Pelajar tidak dapat dikeluarkan. Cuba lagi.");
      setRemoving(null);
      setConfirmRemove(null);
      return;
    }
    setRemoving(null);
    setConfirmRemove(null);
    router.refresh();
  }

  async function deleteClass() {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    const response = await fetch(`/api/subjects/${detail.id}`, { method: "DELETE" }).catch(() => null);
    if (!response?.ok) {
      setError("Subjek tidak dapat dipadamkan. Cuba lagi.");
      setDeleting(false);
      return;
    }
    router.push("/subjects");
  }

  async function leaveClass() {
    if (leaving) return;
    setLeaving(true);
    setError(null);
    const response = await fetch(`/api/subjects/${detail.id}/leave`, { method: "POST" }).catch(() => null);
    if (!response?.ok) {
      setError("Anda tidak dapat keluar subjek ini. Cuba lagi.");
      setLeaving(false);
      return;
    }
    router.push("/subjects");
  }

  async function toggleCompletion(assignment: AssignmentView) {
    if (pendingCompletion) return;
    setPendingCompletion(assignment.id);
    setError(null);
    const response = await fetch(`/api/assignments/${assignment.id}/completion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !assignment.completed }),
    }).catch(() => null);
    if (!response?.ok) {
      setError("Tugasan tidak dapat dikemas kini. Cuba lagi.");
      setPendingCompletion(null);
      return;
    }
    setPendingCompletion(null);
    router.refresh();
  }

  async function deleteAssignmentRow(assignmentId: string) {
    if (deletingAssignment) return;
    setDeletingAssignment(assignmentId);
    setError(null);
    const response = await fetch(`/api/assignments/${assignmentId}`, { method: "DELETE" }).catch(() => null);
    if (!response?.ok) {
      setError("Buku kerja tidak dapat ditarik balik. Cuba lagi.");
      setDeletingAssignment(null);
      setConfirmDeleteAssignment(null);
      return;
    }
    setDeletingAssignment(null);
    setConfirmDeleteAssignment(null);
    router.refresh();
  }

  async function toggleMaterial(workbookId: string, shared: boolean) {
    if (materialPending) return;
    setMaterialPending(workbookId);
    setError(null);
    const response = await fetch(`/api/subjects/${detail.id}/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workbookId, shared }),
    }).catch(() => null);
    if (!response?.ok) {
      setError("Bahan tidak dapat dikemas kini. Cuba lagi.");
      setMaterialPending(null);
      return;
    }
    setMaterialPending(null);
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <main id="main" className={`${content.container} ${styles.main}`}>
        <header className={styles.detailHero}>
          <div className={styles.detailHeroCopy}>
            <Link href="/subjects" className={styles.back}><ArrowLeft size={14} aria-hidden="true" />Semua subjek</Link>
            <div className={styles.detailTitleRow}>
              {isTeacher && editingTitle ? (
                <span className={styles.titleEditRow}>
                  <input
                    className={styles.titleInput}
                    value={titleDraft}
                    onChange={(event) => setTitleDraft(event.target.value)}
                    maxLength={60}
                    autoFocus
                    aria-label="Nama subjek"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") { event.preventDefault(); void saveTitle(); }
                      if (event.key === "Escape") { setEditingTitle(false); setTitleDraft(detail.name); }
                    }}
                  />
                  <button type="button" className={styles.titleSave} onClick={saveTitle} disabled={savingTitle} aria-label="Simpan nama subjek">
                    <Check size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={styles.titleCancel}
                    onClick={() => { setEditingTitle(false); setTitleDraft(detail.name); }}
                    aria-label="Batal sunting nama"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                </span>
              ) : (
                <>
                  <h1>{detail.name}</h1>
                  {isTeacher && (
                    <button
                      type="button"
                      className={styles.titleEditButton}
                      onClick={() => { setTitleDraft(detail.name); setEditingTitle(true); }}
                      aria-label="Sunting nama subjek"
                      title="Sunting nama subjek"
                    >
                      <Pencil size={14} aria-hidden="true" />
                    </button>
                  )}
                </>
              )}
              {subject && <span className={styles.chip}>{subject.name}</span>}
              {detail.formLevel && <span className={styles.chip}>{detail.formLevel}</span>}
            </div>
            <p className={styles.detailSub}>
              Cikgu <strong>{detail.teacherName}</strong> · {members.length} pelajar · dicipta {formatDate(detail.createdAt)}
            </p>
          </div>
          <div className={styles.detailHeroArt} aria-hidden="true">
            <span className={styles.detailBlob} />
            <Image src={subject?.asset ?? "/assets/thiings/graduation.png"} alt="" width={150} height={150} />
          </div>
          {isTeacher && (
            <button
              type="button"
              className={`${styles.heroDelete} ${confirmDelete ? styles.heroDeleteConfirm : ""}`}
              disabled={deleting}
              onClick={() => (confirmDelete ? deleteClass() : setConfirmDelete(true))}
            >
              <Trash2 size={13} aria-hidden="true" />
              {deleting ? "Memadam…" : confirmDelete ? "Pasti? Padam subjek" : "Padam subjek"}
            </button>
          )}
        </header>

        <div className={styles.tabBar} role="tablist" aria-label="Bahagian subjek">
          {visibleTabs.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              className={`${styles.tab} ${tab === item.key ? styles.tabActive : ""}`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && <p className={styles.formError} role="alert">{error}</p>}

        {tab === "overview" && (
          <div className={styles.panelGrid}>
            <section className={styles.panel}>
              <h2>Maklumat subjek</h2>
              <dl>
                <div><dt>Guru</dt><dd>{detail.teacherName}</dd></div>
                {detail.formLevel && <div><dt>Tahun / Tingkatan</dt><dd>{detail.formLevel}</dd></div>}
                <div><dt>Bilangan pelajar</dt><dd>{members.length}</dd></div>
                <div><dt>Buku kerja subjek</dt><dd>{assignedIds.size + sharedOnly.length}</dd></div>
                <div><dt>Dicipta pada</dt><dd>{formatDate(detail.createdAt)}</dd></div>
                {!isTeacher && detail.joinedAt && <div><dt>Anda menyertai</dt><dd>{formatDate(detail.joinedAt)}</dd></div>}
              </dl>
            </section>

            {isTeacher ? (
              <section className={styles.panel}>
                <h2>Kod sertai pelajar</h2>
                <p>Kongsikan kod ini dengan pelajar di sekolah anda. Kod baharu membatalkan kod lama.</p>
                {code && (
                  <div className={styles.bigCode}>
                    <span>{code}</span>
                    <CopyCodeButton code={code} />
                  </div>
                )}
                <div>
                  <Button type="button" variant="white" size="sm" onClick={rotateCode} disabled={rotating}>
                    <RefreshCw size={14} aria-hidden="true" />{rotating ? "Menjana…" : "Jana kod baharu"}
                  </Button>
                </div>
              </section>
            ) : (
              <section className={styles.panel}>
                <h2>Keluar subjek</h2>
                <p>Anda akan berhenti melihat buku kerja dan bahan daripada subjek ini sehingga menyertai semula.</p>
                <div>
                  <Button type="button" variant="white" size="sm" onClick={leaveClass} disabled={leaving}>
                    {leaving ? "Keluar…" : "Keluar subjek"}
                  </Button>
                </div>
              </section>
            )}
          </div>
        )}

        {tab === "assignments" && (
          <section className={styles.tabPanel} aria-label="Buku kerja subjek">
            <div className={styles.panelHead}>
              <div>
                <h2>Buku kerja</h2>
                <p>{isTeacher ? "Buku kerja yang ditugaskan atau dikongsi dengan subjek ini." : "Buku kerja daripada cikgu anda."}</p>
              </div>
              {isTeacher && (
                <button type="button" className={styles.actionButton} onClick={() => setAssignmentOpen(true)} disabled={ownedWorkbooks.length === 0}>
                  <Plus size={15} aria-hidden="true" />Tugaskan buku kerja
                </button>
              )}
            </div>
            {assignments.length === 0 && sharedOnly.length === 0 ? (
              <div className={styles.placeholder}>
                <h3>Belum ada buku kerja</h3>
                <p>
                  {isTeacher
                    ? ownedWorkbooks.length === 0
                      ? "Cipta buku kerja dahulu, kemudian tugaskannya kepada subjek ini."
                      : "Klik “Tugaskan buku kerja” untuk memberikan buku kerja pertama kepada subjek ini."
                    : "Buku kerja daripada cikgu anda akan muncul di sini."}
                </p>
              </div>
            ) : (
              <div className={styles.tileGrid}>
                {assignments.map((assignment) => {
                  const state = dueState(assignment.dueAt, assignment.completed);
                  return isTeacher ? (
                    <ContentTile
                      key={assignment.id}
                      href={`/subjects/${detail.id}/workbooks/${assignment.workbookId}`}
                      tint={tileTint(assignment.workbookSubjectId)}
                      art={tileArt(assignment.workbookSubjectId)}
                      badge={<SubjectBadge subjectId={assignment.workbookSubjectId} />}
                      title={assignment.title}
                      description={`${assignment.workbookTitle}${assignment.dueAt ? ` · Tarikh akhir ${formatDue(assignment.dueAt)}` : ""}`}
                      footer={<strong>{assignment.completedCount}/{assignment.memberCount} selesai</strong>}
                      footerEnd={<ModuleChips assignment={assignment} />}
                      menu={
                        <button
                          type="button"
                          className={`${styles.tileMenuButton} ${styles.tileMenuDanger}`}
                          disabled={deletingAssignment === assignment.id}
                          onClick={() =>
                            confirmDeleteAssignment === assignment.id ? deleteAssignmentRow(assignment.id) : setConfirmDeleteAssignment(assignment.id)
                          }
                        >
                          <Trash2 size={12} aria-hidden="true" />
                          {deletingAssignment === assignment.id ? "…" : confirmDeleteAssignment === assignment.id ? "Pasti?" : "Tarik balik"}
                        </button>
                      }
                    />
                  ) : (
                    <ContentTile
                      key={assignment.id}
                      href={`/workbooks/${assignment.workbookId}`}
                      tint={tileTint(assignment.workbookSubjectId)}
                      art={tileArt(assignment.workbookSubjectId)}
                      badge={<SubjectBadge subjectId={assignment.workbookSubjectId} />}
                      title={assignment.title}
                      description={`${assignment.workbookTitle}${assignment.dueAt ? ` · Tarikh akhir ${formatDue(assignment.dueAt)}` : ""}`}
                      footer={
                        dueLabel(assignment.dueAt, assignment.completed) ? (
                          <span className={`${styles.badge} ${state === "done" ? styles.badgeDone : state === "overdue" ? styles.badgeWarn : styles.badgeMuted}`}>
                            {dueLabel(assignment.dueAt, assignment.completed)}
                          </span>
                        ) : (
                          <span>Tiada tarikh akhir</span>
                        )
                      }
                      menu={
                        <button
                          type="button"
                          className={`${styles.checkButton} ${assignment.completed ? styles.checkButtonDone : ""}`}
                          aria-pressed={assignment.completed}
                          aria-label={assignment.completed ? `Batal selesai ${assignment.title}` : `Tandakan ${assignment.title} selesai`}
                          disabled={pendingCompletion === assignment.id}
                          onClick={() => toggleCompletion(assignment)}
                        >
                          <Check size={15} aria-hidden="true" />
                        </button>
                      }
                    />
                  );
                })}
                {sharedOnly.map((material) => (
                  <ContentTile
                    key={material.workbookId}
                    href={isTeacher ? `/subjects/${detail.id}/workbooks/${material.workbookId}` : `/workbooks/${material.workbookId}`}
                    tint={tileTint(material.subjectId)}
                    art={tileArt(material.subjectId)}
                    badge={<SubjectBadge subjectId={material.subjectId} />}
                    title={material.title}
                    description={`Dikongsi ${formatDate(material.sharedAt)}`}
                    footer={<span className={`${styles.badge} ${styles.badgeMuted}`}>Dikongsi</span>}
                    menu={
                      isTeacher ? (
                        <button
                          type="button"
                          className={`${styles.tileMenuButton} ${styles.tileMenuDone}`}
                          disabled={materialPending === material.workbookId}
                          onClick={() => toggleMaterial(material.workbookId, false)}
                        >
                          {materialPending === material.workbookId ? "…" : "Nyahkongsi"}
                        </button>
                      ) : undefined
                    }
                  />
                ))}
              </div>
            )}
            {isTeacher && shareable.length > 0 && (
              <div className={styles.sharePicker}>
                <h3>Kongsi tanpa tugasan</h3>
                <p>Berikan akses baca sahaja tanpa tarikh akhir atau modul khusus.</p>
                <div className={styles.tileGrid}>
                  {shareable.map((workbook) => (
                    <ContentTile
                      key={workbook.id}
                      tint={tileTint(workbook.subjectId)}
                      art={tileArt(workbook.subjectId)}
                      badge={<SubjectBadge subjectId={workbook.subjectId} />}
                      title={workbook.title}
                      description="Belum dikongsi dengan subjek ini"
                      footer={<span className={`${styles.badge} ${styles.badgeMuted}`}>Peribadi</span>}
                      menu={
                        <button
                          type="button"
                          className={`${styles.tileMenuButton} ${styles.tileMenuPrimary}`}
                          disabled={materialPending === workbook.id}
                          onClick={() => toggleMaterial(workbook.id, true)}
                        >
                          {materialPending === workbook.id ? "…" : "Kongsi"}
                        </button>
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {tab === "materials" && (
          <section className={styles.tabPanel} aria-label="Sumber subjek">
            <div className={styles.panelHead}>
              <div>
                <h2>Sumber</h2>
                <p>{isTeacher ? "Sumber daripada buku kerja subjek ini — asas semua bahan dan kuiz." : "Sumber pembelajaran daripada cikgu anda."}</p>
              </div>
            </div>
            {sourceGroups.length === 0 ? (
              <div className={styles.placeholder}>
                <h3>Belum ada sumber</h3>
                <p>{isTeacher ? "Tambah sumber yang sedia dalam buku kerja subjek ini untuk melihatnya di sini." : "Sumber pembelajaran cikgu anda akan muncul di sini."}</p>
              </div>
            ) : (
              sourceGroups.map((group) => (
                <div key={group.workbookId} className={styles.sourceGroup}>
                  <div className={styles.sourceGroupHead}>
                    <h3>{group.workbookTitle}</h3>
                    <span>{group.sources.length} sumber</span>
                    {isTeacher && (
                      <Link href={`/workbooks/${group.workbookId}?tab=sumber`} className={styles.rowLink}>Urus dalam buku kerja</Link>
                    )}
                  </div>
                  <div className={styles.sourceCards}>
                    {group.sources.map((source) => {
                      const thumbnail =
                        source.kind === "youtube" && source.videoId && /^[A-Za-z0-9_-]{11}$/.test(source.videoId)
                          ? `https://i.ytimg.com/vi/${source.videoId}/hqdefault.jpg`
                          : null;
                      const Icon = source.kind === "youtube" ? Video : source.kind === "web" ? Globe : source.kind === "textbook" ? BookOpen : FileText;
                      return (
                        <article key={source.id} className={styles.sourceCard}>
                          <span className={styles.sourceThumb} data-kind={source.kind}>
                            {thumbnail ? <img src={thumbnail} alt="" loading="lazy" /> : <Icon size={22} aria-hidden="true" />}
                          </span>
                          <div className={styles.sourceBody}>
                            <strong title={source.title}>{source.title}</strong>
                            {source.excerpt && <small>{source.excerpt.replace(/[#*_`>]/g, "")}</small>}
                            <span className={styles.sourceMetaRow}>
                              <em className={styles.sourceKind}>{SOURCE_KIND_LABELS[source.kind] ?? source.kind}</em>
                              {source.sizeLabel && <span>{source.sizeLabel}</span>}
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {tab === "students" && isTeacher && (
          <section className={styles.tabPanel} aria-label="Senarai pelajar">
            <div className={styles.panelHead}>
              <div>
                <h2>Pelajar</h2>
                <p>{members.length} pelajar menyertai subjek ini.</p>
              </div>
            </div>
            {members.length === 0 ? (
              <div className={styles.placeholder}>
                <h3>Belum ada pelajar</h3>
                <p>Kongsikan kod sertai di tab Gambaran untuk menambah pelajar ke subjek ini.</p>
              </div>
            ) : (
              <div className={styles.studentGrid}>
                {members.map((member) => (
                  <article key={member.id} className={styles.studentTile}>
                    <header className={styles.studentHead}>
                      <span className={styles.studentAvatar} data-tone={avatarTone(member.name)} aria-hidden="true">{member.name.slice(0, 1)}</span>
                      <div className={styles.studentHeadBody}>
                        <strong>{member.name}</strong>
                        <span className={styles.studentChip}>{member.className !== "—" ? member.className : "Kelas belum ditetapkan"}</span>
                      </div>
                    </header>
                    <div className={styles.studentStats}>
                      <span className={styles.studentStat}>
                        <Zap size={14} aria-hidden="true" />
                        <span><strong>{member.xp} XP</strong><small>XP terkumpul</small></span>
                      </span>
                      <span className={styles.studentStat}>
                        <CalendarDays size={14} aria-hidden="true" />
                        <span><strong>{formatDate(member.joinedAt)}</strong><small>Menyertai</small></span>
                      </span>
                    </div>
                    <footer className={styles.studentFoot}>
                      {confirmRemove === member.id ? (
                        <button type="button" className={styles.removeButton} disabled={removing === member.id} onClick={() => removeMember(member.id)}>
                          {removing === member.id ? "Mengeluarkan…" : "Pasti? Keluarkan"}
                        </button>
                      ) : (
                        <button type="button" className={styles.removeButton} onClick={() => setConfirmRemove(member.id)}>
                          <UserMinus size={12} aria-hidden="true" /> Keluarkan
                        </button>
                      )}
                    </footer>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "progress" && isTeacher && (
          progress && progress.students.length > 0 ? (
            <section className={styles.tabPanel} aria-label="Kemajuan pelajar">
              <div className={styles.panelHead}>
                <div>
                  <h2>Kemajuan</h2>
                  <p>{progress.students.length} pelajar · {progress.assignments.length} buku kerja ditugaskan · {progress.attemptTotal} percubaan kuiz</p>
                </div>
              </div>
              <section className={styles.roster} aria-label="Jadual kemajuan">
                <div className={`${styles.rosterRow} ${styles.progressRow} ${styles.rosterHead}`}>
                  <span>Pelajar</span>
                  <span>Tugasan</span>
                  <span>Kuiz</span>
                  <span>Aktiviti terakhir</span>
                </div>
                {progress.students.map((student) => (
                  <div key={student.id} className={`${styles.rosterRow} ${styles.progressRow}`}>
                    <span className={styles.rosterName}>
                      <span className={styles.rosterAvatar} aria-hidden="true">{student.name.slice(0, 1)}</span>
                      <span><strong>{student.name}</strong><small>{student.className}</small></span>
                    </span>
                    <span className={styles.rosterCell}>
                      <strong className="font-bold text-[#10112f]">{student.completedCount}</strong>/{student.totalAssignments} selesai
                    </span>
                    <span className={styles.rosterCell}>
                      {student.attemptCount > 0
                        ? `${student.attemptCount} percubaan · terbaik ${student.bestPercent ?? 0}%`
                        : "Belum mencuba"}
                    </span>
                    <span className={styles.rosterCell}>
                      {student.lastActivityAt ? formatRelativeTime(student.lastActivityAt) : "—"}
                    </span>
                  </div>
                ))}
              </section>
              {progress.assignments.length > 0 && (
                <div className={styles.assignmentList}>
                  {progress.assignments.map((assignment) => (
                    <div key={assignment.id} className={styles.assignmentRow}>
                      <span className={styles.assignmentTile} aria-hidden="true"><BookOpen size={16} /></span>
                      <div className={styles.assignmentMain}>
                        <strong>{assignment.title}</strong>
                        <span>
                          {assignment.attemptCount > 0
                            ? `${assignment.attemptCount} percubaan kuiz · purata ${assignment.avgPercent ?? 0}%`
                            : "Belum ada percubaan kuiz"}
                        </span>
                      </div>
                      <div className={styles.assignmentSide}>
                        <span className={`${styles.badge} ${assignment.memberCount > 0 && assignment.completedCount >= assignment.memberCount ? styles.badgeDone : styles.badgeMuted}`}>
                          {assignment.completedCount}/{assignment.memberCount} selesai
                        </span>
                        <Link href={`/subjects/${detail.id}/workbooks/${assignment.workbookId}`} className={styles.analyticsLink}>Analitik</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <div className={styles.placeholder}>
              <h3>Belum ada data kemajuan</h3>
              <p>Kemajuan pelajar akan dipaparkan di sini apabila mereka mula menyiapkan tugasan dan kuiz.</p>
            </div>
          )
        )}



        {assignmentOpen && (
          <AssignmentDialog
            classId={detail.id}
            workbooks={ownedWorkbooks}
            onClose={() => setAssignmentOpen(false)}
            onCreated={() => { setAssignmentOpen(false); router.refresh(); }}
          />
        )}
      </main>
    </div>
  );
}
