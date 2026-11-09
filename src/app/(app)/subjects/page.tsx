import type { Metadata } from "next";
import { PageHeader, PageShell, Section } from "@/components/studio/shell";
import { SubjectClassCard } from "@/components/studio/cards";
import { WORKBOOKS, joinedSubjectClasses, materialsForSubject, quizzesForSubject } from "@/lib/demo-data";
import { JoinSubjectForm } from "./join-subject-form";

export const metadata: Metadata = { title: "Subjek" };

export default function SubjectsPage() {
  const joined = joinedSubjectClasses();

  return (
    <PageShell>
      <PageHeader
        title="Subjek saya"
        description="Setiap subjek dipautkan kepada guru anda — semua buku kerja, kuiz dan bahan mereka ada di sini."
      />

      <Section title="Subjek yang disertai" description="Ketik subjek untuk melihat bahan dan kuiz guru.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {joined.map((c) => (
            <SubjectClassCard
              key={c.subjectId}
              klass={c}
              workbooks={WORKBOOKS.filter((w) => w.subjectId === c.subjectId).length}
              quizzes={quizzesForSubject(c.subjectId).length + materialsForSubject(c.subjectId).length > 0 ? quizzesForSubject(c.subjectId).length : 0}
            />
          ))}
        </div>
      </Section>

      <Section title="Sertai subjek">
        <JoinSubjectForm />
      </Section>
    </PageShell>
  );
}
