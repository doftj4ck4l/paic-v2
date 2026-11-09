import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WORKBOOKS } from "@/lib/demo-data";
import { WorkbookWorkspace } from "../workspace";

export const metadata: Metadata = { title: "Sumber — Buku Kerja" };

export default async function WorkbookSourcesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workbook = WORKBOOKS.find((w) => w.id === id);
  if (!workbook) notFound();
  return (
    <WorkbookWorkspace workbook={workbook} initialPanel="sources" />
  );
}
