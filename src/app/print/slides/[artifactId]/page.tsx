import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { requireUser } from "@/lib/auth-session";
import { viewableWorkbook } from "@/lib/ingestion/access";
import type { DeckData } from "@/lib/generation/schemas";
import { PrintDeck } from "./print-deck";

export const metadata: Metadata = { title: "Cetak dek slaid" };

export default async function SlidePrintPage({ params }: { params: Promise<{ artifactId: string }> }) {
  const { artifactId } = await params;
  const user = await requireUser();
  const [row] = await db.select().from(artifacts).where(eq(artifacts.id, artifactId));
  if (!row || row.kind !== "slides" || !await viewableWorkbook(row.workbookId, user.id)) notFound();
  const deck = (row.data ?? { title: row.title, slides: [] }) as DeckData;
  return <PrintDeck artifactId={artifactId} deck={deck} />;
}
