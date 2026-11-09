import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { workbookChatTurns } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { viewableWorkbook } from "@/lib/ingestion/access";
import { isRouterConfigured } from "@/lib/generation/router";
import { answerWorkbookQuestion } from "@/lib/workbook/chat";
const bodySchema = z.object({ requestId: z.string().uuid(), message: z.string().trim().min(1).max(4000), sourceIds: z.array(z.string().min(1)).min(1).max(100) });
async function turns(workbookId: string, userId: string) {
  return db.select().from(workbookChatTurns).where(and(eq(workbookChatTurns.workbookId, workbookId), eq(workbookChatTurns.userId, userId))).orderBy(desc(workbookChatTurns.createdAt)).limit(100);
}
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await params; if (!await viewableWorkbook(id, user.id)) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  const rows = await turns(id, user.id);
  return NextResponse.json({ turns: rows.reverse(), available: isRouterConfigured() });
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await params; const workbook = await viewableWorkbook(id, user.id);
  if (!workbook) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Pilih sumber yang siap dan tulis soalan (sehingga 4,000 aksara)." }, { status: 422 });
  if (!isRouterConfigured()) return NextResponse.json({ error: "Perkhidmatan AI belum dikonfigurasi." }, { status: 503 });
  const turnId = `chat_${parsed.data.requestId}`;
  const [existing] = await db.select().from(workbookChatTurns).where(and(eq(workbookChatTurns.id, turnId), eq(workbookChatTurns.workbookId, id), eq(workbookChatTurns.userId, user.id)));
  if (existing) return NextResponse.json({ turn: existing });
  try {
    const history = (await turns(id, user.id)).reverse();
    const contextOwnerId = workbook.isDb && workbook.ownerId ? workbook.ownerId : user.id;
    const result = await answerWorkbookQuestion({ workbook, userId: user.id, contextOwnerId, question: parsed.data.message, sourceIds: [...new Set(parsed.data.sourceIds)], history, language: user.language });
    const [turn] = await db.insert(workbookChatTurns).values({ id: turnId, workbookId: id, userId: user.id, question: parsed.data.message, answer: result.answer, citations: result.citations, sourceIds: parsed.data.sourceIds }).onConflictDoNothing().returning();
    if (!turn) return NextResponse.json({ error: "Permintaan ini sedang diproses. Sila muat semula sembang." }, { status: 409 });
    return NextResponse.json({ turn }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Jawapan tidak dapat dijana. Sila cuba lagi.";
    const selectionError = message.startsWith("Pilih sekurang-kurangnya");
    return NextResponse.json({ error: selectionError ? message : "Jawapan tidak dapat dijana buat masa ini. Sumber anda masih disimpan; sila cuba lagi." }, { status: selectionError ? 422 : 502 });
  }
}
