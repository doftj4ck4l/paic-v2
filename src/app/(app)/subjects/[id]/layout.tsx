import { notFound } from "next/navigation";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { TabLinks } from "@/components/studio/tab-links";
import { SUBJECTS, subjectClassById } from "@/lib/demo-data";

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ id: s.id }));
}

export default async function SubjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subject = SUBJECTS.find((s) => s.id === id);
  if (!subject) notFound();
  const klass = subjectClassById(subject.id);

  return (
    <PageShell>
      <PageHeader
        title={subject.name}
        description={`${subject.blurb} · ${klass.teacherName} · ${klass.className} · ${klass.schedule} · ${klass.room}`}
      />
      <TabLinks
        items={[
          { href: `/subjects/${id}`, label: "Ringkasan" },
          { href: `/subjects/${id}/workbooks`, label: "Buku Kerja" },
          { href: `/subjects/${id}/quizzes`, label: "Kuiz" },
          { href: `/subjects/${id}/materials`, label: "Bahan" },
          { href: `/subjects/${id}/announcements`, label: "Pengumuman" },
        ]}
      />
      {children}
    </PageShell>
  );
}
