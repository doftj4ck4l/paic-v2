import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WORKBOOKS } from "@/lib/demo-data";
import { WorkbookWorkspace } from "./workspace";

export const metadata: Metadata = { title: "Ruang Kerja Buku Kerja" };

export function generateStaticParams() {
  return WORKBOOKS.map((w) => ({ id: w.id }));
}

export default async function WorkbookWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workbook = WORKBOOKS.find((w) => w.id === id);
  if (!workbook) notFound();
  return (
    <WorkbookWorkspace workbook={workbook} initialPanel="chat" />
  );
}
