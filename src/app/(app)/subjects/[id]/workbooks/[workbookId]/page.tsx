import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-session";
import { getClassForUser } from "@/lib/classes";
import { getWorkbookAnalytics } from "@/lib/workbook-analytics";
import { WorkbookAnalyticsView } from "./analytics-view";

export const metadata: Metadata = { title: "Analitik buku kerja" };

export const dynamic = "force-dynamic";

export default async function ClassWorkbookAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string; workbookId: string }>;
}) {
  const user = await requireUser();
  const { id, workbookId } = await params;

  const detail = await getClassForUser(user, id);
  if (!detail || user.role !== "teacher" || detail.teacherId !== user.id) notFound();

  const analytics = await getWorkbookAnalytics(id, workbookId);
  if (!analytics) notFound();

  return <WorkbookAnalyticsView classId={id} className={detail.name} analytics={analytics} />;
}
