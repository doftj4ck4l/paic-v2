"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, Check, Plus, RefreshCw, Trash2, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/lib/auth-session";
import type { ClassDetail } from "@/lib/classes";
import type { AssignmentView, ClassMaterial, ClassSourceGroup, OwnedWorkbookOption } from "@/lib/assignments";
import type { ClassProgress } from "@/lib/class-progress";
import { dueLabel, dueState, formatDue, formatRelativeTime } from "@/lib/assignment-status";
import { moduleKindLabel } from "@/lib/module-kinds";
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
  return (
    <span className={styles.moduleChips}>
      {assignment.moduleKinds.map((kind) =>
        linkable ? (
          <Link key={kind} href={`/workbooks/${assignment.workbookId}?tab=${kind}`} className={styles.moduleChipLink}>
            {moduleKindLabel(kind)}
          </Link>
        ) : (
          <em key={kind} className={styles.moduleChip}>{moduleKindLabel(kind)}</em>
        ),
      )}
    </span>
  );
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

  const members = detail.members;
  const assignedIds = new Set(assignments.map((assignment) => assignment.workbookId));
  const sharedOnly = materials.filter((material) => !assignedIds.has(material.workbookId));
  const sharedIds = new Set(materials.map((material) => material.workbookId));
  const shareable = ownedWorkbooks.filter((workbook) => !assignedIds.has(workbook.id) && !sharedIds.has(workbook.id));

  const visibleTabs = TABS.filter((item) => {
    if (item.key === "students" || item.key === "progress") return isTeacher;
    return true;
  });

  async function rotateCode() {
    if (rotating) return;
    setRotating(true);
    setError(null);
    const response = await fetch(`/api/classes/${detail.id}`, {
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
    const response = await fetch(`/api/classes/${detail.id}/members/${studentId}`, { method: "DELETE" }).catch(() => null);
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
    const response = await fetch(`/api/classes/${detail.id}`, { method: "DELETE" }).catch(() => null);
    if (!response?.ok) {
      setError("Kelas tidak dapat dipadamkan. Cuba lagi.");
      setDeleting(false);
      return;
    }
    router.push("/classes");
  }

  async function leaveClass() {
    if (leaving) return;
    setLeaving(true);
    setError(null);
    const response = await fetch(`/api/classes/${detail.id}/leave`, { method: "POST" }).catch(() => null);
    if (!response?.ok) {
      setError("Anda tidak dapat keluar kelas ini. Cuba lagi.");
      setLeaving(false);
      return;
    }
    router.push("/classes");
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
    const response = await fetch(`/api/classes/${detail.id}/materials`, {
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
        <div className={styles.detailHead}>
          <Link href="/classes" className={styles.back}><ArrowLeft size={14} aria-hidden="true" />Semua kelas</Link>
          <div className={styles.detailTitleRow}>
            <h1>{detail.name}</h1>
            {detail.formLevel && <span className={styles.chip}>{detail.formLevel}</span>}
          </div>
          <p className={styles.detailSub}>
            Cikgu <strong>{detail.teacherName}</strong> · {members.length} pelajar · dicipta {formatDate(detail.createdAt)}
          </p>
        </div>

        <div className={styles.tabBar} role="tablist" aria-label="Bahagian kelas">
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
              <h2>Maklumat kelas</h2>
              <dl>
                <div><dt>Guru kelas</dt><dd>{detail.teacherName}</dd></div>
                {detail.formLevel && <div><dt>Tahun / Tingkatan</dt><dd>{detail.formLevel}</dd></div>}
                <div><dt>Bilangan pelajar</dt><dd>{members.length}</dd></div>
                <div><dt>Buku kerja kelas</dt><dd>{assignedIds.size + sharedOnly.length}</dd></div>
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
                <h2>Keluar kelas</h2>
                <p>Anda akan berhenti melihat buku kerja dan bahan daripada kelas ini sehingga menyertai semula.</p>
                <div>
                  <Button type="button" variant="white" size="sm" onClick={leaveClass} disabled={leaving}>
                    {leaving ? "Keluar…" : "Keluar kelas"}
                  </Button>
                </div>
              </section>
            )}
          </div>
        )}

        {tab === "assignments" && (
          <section className={styles.tabPanel} aria-label="Buku kerja kelas">
            <div className={styles.panelHead}>
              <div>
                <h2>Buku kerja</h2>
                <p>{isTeacher ? "Buku kerja yang ditugaskan atau dikongsi dengan kelas ini." : "Buku kerja daripada cikgu anda."}</p>
              </div>
              {isTeacher && (
                <Button size="sm" onClick={() => setAssignmentOpen(true)} disabled={ownedWorkbooks.length === 0}>
                  <Plus size={15} aria-hidden="true" />Tugaskan buku kerja
                </Button>
              )}
            </div>
            {assignments.length === 0 && sharedOnly.length === 0 ? (
              <div className={styles.placeholder}>
                <h3>Belum ada buku kerja</h3>
                <p>
                  {isTeacher
                    ? ownedWorkbooks.length === 0
                      ? "Cipta buku kerja dahulu, kemudian tugaskannya kepada kelas ini."
                      : "Klik “Tugaskan buku kerja” untuk memberikan buku kerja pertama kepada kelas ini."
                    : "Buku kerja daripada cikgu anda akan muncul di sini."}
                </p>
              </div>
            ) : (
              <div className={styles.assignmentList}>
                {assignments.map((assignment) => {
                  const state = dueState(assignment.dueAt, assignment.completed);
                  return (
                    <div key={assignment.id} className={styles.assignmentRow}>
                      {isTeacher ? (
                        <span className={styles.assignmentTile} aria-hidden="true"><BookOpen size={16} /></span>
                      ) : (
                        <span className={`${styles.assignmentState} ${assignment.completed ? styles.assignmentStateDone : ""}`} aria-hidden="true">
                          {assignment.completed && <Check size={15} />}
                        </span>
                      )}
                      <div className={styles.assignmentMain}>
                        <strong>{assignment.title}</strong>
                        <span>
                          {assignment.workbookTitle}
                          {assignment.dueAt ? ` · Tarikh akhir ${formatDue(assignment.dueAt)}` : ""}
                        </span>
                        <ModuleChips assignment={assignment} linkable={!isTeacher} />
                        {!isTeacher && assignment.instructions && <span className={styles.assignmentNote}>{assignment.instructions}</span>}
                      </div>
                      <div className={styles.assignmentSide}>
                        {isTeacher ? (
                          <span className={`${styles.badge} ${assignment.completedCount >= assignment.memberCount && assignment.memberCount > 0 ? styles.badgeDone : styles.badgeMuted}`}>
                            {assignment.completedCount}/{assignment.memberCount} selesai
                          </span>
                        ) : (
                          dueLabel(assignment.dueAt, assignment.completed) && (
                            <span
                              className={`${styles.badge} ${
                                state === "done" ? styles.badgeDone : state === "overdue" ? styles.badgeWarn : styles.badgeMuted
                              }`}
                            >
                              {dueLabel(assignment.dueAt, assignment.completed)}
                            </span>
                          )
                        )}
                        {isTeacher ? (
                          <>
                            <Link href={`/classes/${detail.id}/workbooks/${assignment.workbookId}`} className={styles.analyticsLink}>Analitik</Link>
                            {confirmDeleteAssignment === assignment.id ? (
                              <button
                                type="button"
                                className={styles.removeButton}
                                disabled={deletingAssignment === assignment.id}
                                onClick={() => deleteAssignmentRow(assignment.id)}
                              >
                                {deletingAssignment === assignment.id ? "Menarik balik…" : "Pasti? Tarik balik"}
                              </button>
                            ) : (
                              <button type="button" className={styles.removeButton} onClick={() => setConfirmDeleteAssignment(assignment.id)}>
                                <Trash2 size={12} aria-hidden="true" /> Tarik balik
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <Link href={`/workbooks/${assignment.workbookId}`} className={styles.rowLink}>Buka</Link>
                            <button
                              type="button"
                              className={`${styles.toggleButton} ${assignment.completed ? styles.toggleButtonDone : ""}`}
                              disabled={pendingCompletion === assignment.id}
                              onClick={() => toggleCompletion(assignment)}
                            >
                              {pendingCompletion === assignment.id ? "Menyimpan…" : assignment.completed ? "Batal selesai" : "Tandakan selesai"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                {sharedOnly.map((material) => (
                  <div key={material.workbookId} className={styles.assignmentRow}>
                    <span className={styles.assignmentTile} aria-hidden="true"><BookOpen size={16} /></span>
                    <div className={styles.assignmentMain}>
                      <strong>{material.title}</strong>
                      <span>Dikongsi {formatDate(material.sharedAt)}</span>
                    </div>
                    <div className={styles.assignmentSide}>
                      <span className={`${styles.badge} ${styles.badgeMuted}`}>Dikongsi</span>
                      {isTeacher ? (
                        <>
                          <Link href={`/classes/${detail.id}/workbooks/${material.workbookId}`} className={styles.analyticsLink}>Analitik</Link>
                          <button
                            type="button"
                            className={`${styles.toggleButton} ${styles.toggleButtonDone}`}
                            disabled={materialPending === material.workbookId}
                            onClick={() => toggleMaterial(material.workbookId, false)}
                          >
                            {materialPending === material.workbookId ? "Menyimpan…" : "Nyahkongsi"}
                          </button>
                        </>
                      ) : (
                        <Link href={`/workbooks/${material.workbookId}`} className={styles.rowLink}>Buka</Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {isTeacher && shareable.length > 0 && (
              <div className={styles.sharePicker}>
                <h3>Kongsi tanpa tugasan</h3>
                <p>Berikan akses baca sahaja tanpa tarikh akhir atau modul khusus.</p>
                <div className={styles.assignmentList}>
                  {shareable.map((workbook) => (
                    <div key={workbook.id} className={styles.assignmentRow}>
                      <span className={styles.assignmentTile} aria-hidden="true"><BookOpen size={16} /></span>
                      <div className={styles.assignmentMain}>
                        <strong>{workbook.title}</strong>
                        <span>Belum dikongsi dengan kelas ini</span>
                      </div>
                      <div className={styles.assignmentSide}>
                        <button
                          type="button"
                          className={styles.toggleButton}
                          disabled={materialPending === workbook.id}
                          onClick={() => toggleMaterial(workbook.id, true)}
                        >
                          {materialPending === workbook.id ? "Menyimpan…" : "Kongsi"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {tab === "materials" && (
          <section className={styles.tabPanel} aria-label="Sumber kelas">
            <div className={styles.panelHead}>
              <div>
                <h2>Sumber</h2>
                <p>{isTeacher ? "Sumber daripada buku kerja kelas ini — asas semua bahan dan kuiz." : "Sumber pembelajaran daripada cikgu anda."}</p>
              </div>
            </div>
            {sources.length === 0 ? (
              <div className={styles.placeholder}>
                <h3>Belum ada sumber</h3>
                <p>{isTeacher ? "Tugaskan atau kongsi buku kerja untuk melihat sumbernya di sini." : "Sumber pembelajaran cikgu anda akan muncul di sini."}</p>
              </div>
            ) : (
              sources.map((group) => (
                <div key={group.workbookId} className={styles.sourceGroup}>
                  <div className={styles.sourceGroupHead}>
                    <h3>{group.workbookTitle}</h3>
                    <span>{group.sources.length} sumber</span>
                    {isTeacher && (
                      <Link href={`/workbooks/${group.workbookId}?tab=sumber`} className={styles.rowLink}>Urus dalam buku kerja</Link>
                    )}
                  </div>
                  <div className={styles.sourceRows}>
                    {group.sources.map((source) => (
                      <div key={source.id} className={styles.sourceRow}>
                        <span className={styles.sourceKind}>{SOURCE_KIND_LABELS[source.kind] ?? source.kind}</span>
                        <span className={styles.sourceTitle}>
                          <strong>{source.title}</strong>
                          {source.excerpt && <small>{source.excerpt.replace(/[#*_`>]/g, "")}</small>}
                        </span>
                        <span className={styles.sourceMeta}>{source.sizeLabel ?? ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {tab === "students" && isTeacher && (
          <section className={styles.roster} aria-label="Senarai pelajar">
            <div className={`${styles.rosterRow} ${styles.rosterHead}`}>
              <span>Pelajar</span>
              <span>Kelas</span>
              <span>Menyertai</span>
              <span />
            </div>
            {members.length === 0 ? (
              <p className={styles.rosterEmpty}>Belum ada pelajar menyertai. Kongsikan kod sertai di atas.</p>
            ) : (
              members.map((member) => (
                <div key={member.id} className={styles.rosterRow}>
                  <span className={styles.rosterName}>
                    <span className={styles.rosterAvatar} aria-hidden="true">{member.name.slice(0, 1)}</span>
                    <span><strong>{member.name}</strong><small>{member.xp} XP</small></span>
                  </span>
                  <span className={styles.rosterCell}>{member.className}</span>
                  <span className={styles.rosterCell}><CalendarDays size={13} aria-hidden="true" /> {formatDate(member.joinedAt)}</span>
                  <span>
                    {confirmRemove === member.id ? (
                      <button type="button" className={styles.removeButton} disabled={removing === member.id} onClick={() => removeMember(member.id)}>
                        {removing === member.id ? "Mengeluarkan…" : "Pasti? Klik untuk keluarkan"}
                      </button>
                    ) : (
                      <button type="button" className={styles.removeButton} onClick={() => setConfirmRemove(member.id)}>
                        <UserMinus size={12} aria-hidden="true" /> Keluarkan
                      </button>
                    )}
                  </span>
                </div>
              ))
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
                        <Link href={`/classes/${detail.id}/workbooks/${assignment.workbookId}`} className={styles.analyticsLink}>Analitik</Link>
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

        {isTeacher && (
          <section className={styles.dangerZone}>
            <div>
              <strong>Padam kelas</strong>
              <span>Semua rekod keahlian kelas ini akan dibuang. Pelajar tidak akan dapat menyertai semula dengan kod lama.</span>
            </div>
            {confirmDelete ? (
              <Button type="button" variant="destructive" size="sm" onClick={deleteClass} disabled={deleting}>
                <Trash2 size={14} aria-hidden="true" />{deleting ? "Memadam…" : "Pasti? Padam kelas"}
              </Button>
            ) : (
              <Button type="button" variant="white" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={14} aria-hidden="true" />Padam kelas
              </Button>
            )}
          </section>
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
