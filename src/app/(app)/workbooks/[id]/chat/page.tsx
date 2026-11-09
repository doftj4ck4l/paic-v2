import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WORKBOOKS } from "@/lib/demo-data";
import { WorkbookWorkspace } from "../workspace";

export const metadata: Metadata = { title: "Sembang — Buku Kerja" };

export default async function WorkbookChatPage({
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
