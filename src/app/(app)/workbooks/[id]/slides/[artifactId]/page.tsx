import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { requireUser } from "@/lib/auth-session";
import { getAppWorkbook } from "@/lib/workbooks";
import type { DeckData } from "@/lib/generation/schemas";
import { SlideEditor } from "./slide-editor";

export const metadata: Metadata = { title: "Editor slaid" };

export default async function SlideEditorPage({ params }: { params: Promise<{ id: string; artifactId: string }> }) {
  const { id, artifactId } = await params;
  const user = await requireUser();
  const workbook = await getAppWorkbook(id);
  if (!workbook) notFound();
  if (!workbook.isDb || workbook.ownerId !== user.id) redirect(`/workbooks/${id}`);
  const [row] = await db.select().from(artifacts).where(and(eq(artifacts.id, artifactId), eq(artifacts.workbookId, id)));
  if (!row || row.kind !== "slides" || row.userId !== user.id) notFound();
  const data = (row.data ?? { title: row.title, slides: [] }) as DeckData & { description?: string };
  return (
    <SlideEditor
      artifactId={artifactId}
      workbookId={id}
      initialDeck={data}
      initialTitle={row.title}
      initialDescription={typeof data.description === "string" ? data.description : ""}
      initialStatus={row.status === "ready" ? "ready" : "draft"}
    />
  );
}
