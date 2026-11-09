import { Megaphone } from "lucide-react";
import { announcementsForSubject, subjectClassById } from "@/lib/demo-data";
import styles from "../../subjects.module.css";

export default async function SubjectAnnouncementsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const klass = subjectClassById(id);
  const announcements = announcementsForSubject(klass.subjectId);

  if (announcements.length === 0) {
    return (
      <div className={styles.empty}>
        <Megaphone size={32} aria-hidden="true" />
        <h3>Tiada pengumuman</h3>
        <p>Pengumuman daripada {klass.teacherName} akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <section aria-label="Pengumuman subjek">
      <div className={styles.announceList}>
        {announcements.map((n) => (
          <article key={n.id} className={styles.announceCard}>
            <p className={styles.announceMeta}>
              <Megaphone size={14} aria-hidden="true" />
              {n.author} · {n.time}
            </p>
            <h3>{n.title}</h3>
            <p>{n.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
