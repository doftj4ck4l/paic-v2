import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { workbookChatSessions, workbookChatTurns } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { viewableWorkbook } from "@/lib/ingestion/access";

const patchSchema = z.object({ title: z.string().trim().min(1).max(120) });

async function ownedSession(workbookId: string, sessionId: string, userId: string) {
  const [session] = await db.select().from(workbookChatSessions)
    .where(and(eq(workbookChatSessions.id, sessionId), eq(workbookChatSessions.workbookId, workbookId), eq(workbookChatSessions.userId, userId)));
  return session ?? null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id, sessionId } = await params;
  if (!await viewableWorkbook(id, user.id)) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tajuk tidak sah." }, { status: 422 });
  if (!await ownedSession(id, sessionId, user.id)) return NextResponse.json({ error: "Sesi tidak dijumpai." }, { status: 404 });
  await db.update(workbookChatSessions).set({ title: parsed.data.title, updatedAt: new Date() }).where(eq(workbookChatSessions.id, sessionId));
  return NextResponse.json({ ok: true, title: parsed.data.title });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id, sessionId } = await params;
  if (!await viewableWorkbook(id, user.id)) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  if (!await ownedSession(id, sessionId, user.id)) return NextResponse.json({ error: "Sesi tidak dijumpai." }, { status: 404 });
  await db.delete(workbookChatTurns).where(and(eq(workbookChatTurns.sessionId, sessionId), eq(workbookChatTurns.userId, user.id)));
  await db.delete(workbookChatSessions).where(eq(workbookChatSessions.id, sessionId));
  return NextResponse.json({ ok: true });
}
