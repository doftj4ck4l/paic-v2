import { and, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { workbookChatSessions, workbookChatTurns } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { viewableWorkbook } from "@/lib/ingestion/access";

/** The learner's private chat sessions for this workbook (owner and viewers alike). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await params;
  if (!await viewableWorkbook(id, user.id)) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  const rows = await db
    .select({
      id: workbookChatSessions.id,
      title: workbookChatSessions.title,
      sourceIds: workbookChatSessions.sourceIds,
      createdAt: workbookChatSessions.createdAt,
      updatedAt: workbookChatSessions.updatedAt,
      messageCount: sql<number>`count(${workbookChatTurns.id})`,
    })
    .from(workbookChatSessions)
    .leftJoin(workbookChatTurns, eq(workbookChatTurns.sessionId, workbookChatSessions.id))
    .where(and(eq(workbookChatSessions.workbookId, id), eq(workbookChatSessions.userId, user.id)))
    .groupBy(workbookChatSessions.id)
    .orderBy(desc(workbookChatSessions.updatedAt))
    .limit(50);
  return NextResponse.json({ sessions: rows.map(row => ({ ...row, messageCount: Number(row.messageCount) })) });
}
