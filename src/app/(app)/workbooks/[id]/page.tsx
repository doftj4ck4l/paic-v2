import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAppWorkbook } from "@/lib/workbooks";
import { getCurrentUser } from "@/lib/auth-session";
import { WorkbookWorkspace } from "./workspace";

export const metadata: Metadata = { title: "Ruang Kerja Buku Kerja" };

export default async function WorkbookWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workbook = await getAppWorkbook(id);
  if (!workbook) notFound();
  const user = await getCurrentUser();
  return (
    <WorkbookWorkspace workbook={workbook} viewerId={user?.id ?? null} />
  );
}
