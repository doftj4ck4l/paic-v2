import { and, asc, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { workbookChatSessions, workbookChatTurns } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { viewableWorkbook } from "@/lib/ingestion/access";
import { chatStreamText, isRouterConfigured } from "@/lib/generation/router";
import { buildChatContext, finalizeChatAnswer } from "@/lib/workbook/chat";

const bodySchema = z.object({
  requestId: z.string().uuid(),
  message: z.string().trim().min(1).max(4000),
  sourceIds: z.array(z.string().min(1)).min(1).max(100),
  sessionId: z.string().min(1).optional(),
});

async function sessionTurns(workbookId: string, userId: string, sessionId: string) {
  return db.select().from(workbookChatTurns)
    .where(and(eq(workbookChatTurns.workbookId, workbookId), eq(workbookChatTurns.userId, userId), eq(workbookChatTurns.sessionId, sessionId)))
    .orderBy(asc(workbookChatTurns.createdAt))
    .limit(200);
}

async function latestSession(workbookId: string, userId: string) {
  const [session] = await db.select().from(workbookChatSessions)
    .where(and(eq(workbookChatSessions.workbookId, workbookId), eq(workbookChatSessions.userId, userId)))
    .orderBy(desc(workbookChatSessions.updatedAt))
    .limit(1);
  return session ?? null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await params;
  if (!await viewableWorkbook(id, user.id)) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  const requested = request.nextUrl.searchParams.get("sessionId");
  const session = requested ? { id: requested } : await latestSession(id, user.id);
  const rows = session ? await sessionTurns(id, user.id, session.id) : [];
  return NextResponse.json({ turns: rows, sessionId: session?.id ?? null, available: isRouterConfigured() });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await params;
  const workbook = await viewableWorkbook(id, user.id);
  if (!workbook) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Pilih sumber yang siap dan tulis soalan (sehingga 4,000 aksara)." }, { status: 422 });
  if (!isRouterConfigured()) return NextResponse.json({ error: "Perkhidmatan AI belum dikonfigurasi." }, { status: 503 });

  const turnId = `chat_${parsed.data.requestId}`;
  const [existing] = await db.select().from(workbookChatTurns).where(and(eq(workbookChatTurns.id, turnId), eq(workbookChatTurns.workbookId, id), eq(workbookChatTurns.userId, user.id)));
  if (existing) return NextResponse.json({ turn: existing, sessionId: existing.sessionId });

  const question = parsed.data.message;
  const sourceIds = [...new Set(parsed.data.sourceIds)];
  const contextOwnerId = workbook.isDb && workbook.ownerId ? workbook.ownerId : user.id;

  // Resolve the session (existing or a fresh one titled from the first question).
  let session = null;
  if (parsed.data.sessionId) {
    const [found] = await db.select().from(workbookChatSessions).where(and(eq(workbookChatSessions.id, parsed.data.sessionId), eq(workbookChatSessions.workbookId, id), eq(workbookChatSessions.userId, user.id)));
    session = found ?? null;
  }
  if (!session) {
    const title = question.length > 80 ? `${question.slice(0, 77)}…` : question;
    [session] = await db.insert(workbookChatSessions).values({ id: `ses_${randomBytes(8).toString("hex")}`, workbookId: id, userId: user.id, title, sourceIds }).returning();
  }
  const history = (await sessionTurns(id, user.id, session.id)).map(row => ({ question: row.question, answer: row.answer }));

  // Context building happens before streaming so errors stay plain JSON.
  let messages, references;
  try {
    ({ messages, references } = await buildChatContext({ workbook, contextOwnerId, question, sourceIds, history, language: user.language }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Jawapan tidak dapat dijana. Sila cuba lagi.";
    const selectionError = message.startsWith("Pilih sekurang-kurangnya");
    return NextResponse.json({ error: message }, { status: selectionError ? 422 : 502 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        try { controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`)); } catch { /* stream already closed */ }
      };
      send({ type: "session", sessionId: session!.id, title: session!.title });
      try {
        const content = await chatStreamText(messages, { maxTokens: 2800, onDelta: (text) => send({ type: "delta", text }), signal: request.signal });
        const { answer, citations } = finalizeChatAnswer(content, references);
        const [turn] = await db.insert(workbookChatTurns)
          .values({ id: turnId, workbookId: id, userId: user.id, sessionId: session!.id, question, answer, citations, sourceIds })
          .onConflictDoNothing()
          .returning();
        await db.update(workbookChatSessions).set({ updatedAt: new Date(), sourceIds }).where(eq(workbookChatSessions.id, session!.id));
        if (turn) send({ type: "done", turn, sessionId: session!.id, title: session!.title });
        else send({ type: "error", message: "Permintaan ini sedang diproses. Sila muat semula sembang." });
      } catch (error) {
        if (request.signal.aborted) { try { controller.close(); } catch { /* already closed */ } return; }
        const message = error instanceof Error ? error.message : "Jawapan tidak dapat dijana buat masa ini.";
        send({ type: "error", message: message.startsWith("Ralat model") ? "Jawapan tidak dapat dijana buat masa ini. Sila cuba lagi." : message });
      }
      try { controller.close(); } catch { /* already closed */ }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}
