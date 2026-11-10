import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-session";
import { getClassForUser } from "@/lib/classes";
import { listAssignmentsForClass, listClassMaterials, listClassSources } from "@/lib/assignments";
import { getClassProgress } from "@/lib/class-progress";
import { listOwnedWorkbooks } from "@/lib/workbooks";
import { CLASS_TAB_IDS, type ClassTabId } from "./class-tabs";
import { ClassDetailView } from "./class-detail";

export const metadata: Metadata = { title: "Kelas" };

export const dynamic = "force-dynamic";

export default async function ClassPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { tab } = await searchParams;
  const detail = await getClassForUser(user, id);
  if (!detail) notFound();

  const isTeacher = user.role === "teacher" && detail.teacherId === user.id;
  const [assignments, materials, owned, progress, sources] = await Promise.all([
    listAssignmentsForClass(user, id),
    listClassMaterials(id),
    isTeacher ? listOwnedWorkbooks(user.id) : Promise.resolve([]),
    isTeacher ? getClassProgress(id) : Promise.resolve(null),
    listClassSources(id),
  ]);

  const initialTab = CLASS_TAB_IDS.includes(tab as ClassTabId) ? (tab as ClassTabId) : undefined;

  return (
    <ClassDetailView
      user={user}
      detail={detail}
      assignments={assignments}
      materials={materials}
      sources={sources}
      ownedWorkbooks={owned.map((workbook) => ({ id: workbook.id, title: workbook.title }))}
      progress={progress}
      initialTab={initialTab}
    />
  );
}
