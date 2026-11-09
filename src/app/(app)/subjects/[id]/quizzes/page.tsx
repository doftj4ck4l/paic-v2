import type { Metadata } from "next";
import { QuizRow } from "@/components/studio/cards";
import { quizzesForSubject, subjectClassById } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Kuiz Subjek" };

export default async function SubjectQuizzesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const klass = subjectClassById(id);
  const quizzes = quizzesForSubject(klass.subjectId);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {quizzes.length} kuiz daripada {klass.teacherName} — setiap kuiz dijana AI daripada buku kerja kelas.
      </p>
      {quizzes.map((q) => (
        <QuizRow key={q.id} quiz={q} />
      ))}
    </div>
  );
}
