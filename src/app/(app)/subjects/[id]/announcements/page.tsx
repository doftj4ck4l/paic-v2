import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { announcementsForSubject, subjectClassById } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Pengumuman Subjek" };

export default async function SubjectAnnouncementsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const klass = subjectClassById(id);
  const announcements = announcementsForSubject(klass.subjectId);

  return (
    <ul className="flex flex-col gap-3">
      {announcements.map((n) => (
        <li key={n.id} className="rounded-[22px] border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Megaphone className="size-3.5 text-[#00786a]" aria-hidden="true" />
            {n.author} · {n.time}
          </div>
          <h2 className="mt-2 text-sm font-extrabold">{n.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
        </li>
      ))}
      {announcements.length === 0 && (
        <p className="text-sm text-muted-foreground">Tiada pengumuman buat masa ini.</p>
      )}
    </ul>
  );
}
