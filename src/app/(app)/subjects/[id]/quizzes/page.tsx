import { ListChecks } from "lucide-react";
import { quizzesForSubject, subjectClassById } from "@/lib/demo-data";
import { QuizCard } from "../quiz-card";
import styles from "../../subjects.module.css";

export default async function SubjectQuizzesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const klass = subjectClassById(id);
  const quizzes = quizzesForSubject(klass.subjectId);

  if (quizzes.length === 0) {
    return (
      <div className={styles.empty}>
        <ListChecks size={32} aria-hidden="true" />
        <h3>Tiada kuiz buat masa ini</h3>
        <p>Kuiz daripada {klass.teacherName} akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <section aria-label="Senarai kuiz subjek">
      <div className={styles.panelHeading}>
        <div>
          <h2>{quizzes.length} kuiz</h2>
          <p>Setiap kuiz dijana AI daripada buku kerja kelas — tersekat? Tanya Pixel AI semasa menjawab.</p>
        </div>
      </div>
      <div className={styles.quizGrid}>
        {quizzes.map((q) => (
          <QuizCard key={q.id} quiz={q} />
        ))}
      </div>
    </section>
  );
}
