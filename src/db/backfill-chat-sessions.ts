import { and, asc, eq, isNull } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { workbookChatSessions, workbookChatTurns } from "@/db/schema";

/**
 * Groups pre-session chat turns into one session per (workbook, learner).
 * Usage: npx tsx --env-file-if-exists=.env src/db/backfill-chat-sessions.ts
 */

async function main() {
  const orphans = await db.select().from(workbookChatTurns).where(isNull(workbookChatTurns.sessionId)).orderBy(asc(workbookChatTurns.createdAt));
  if (!orphans.length) {
    console.log("no legacy turns to group");
    process.exit(0);
  }
  const groups = new Map<string, typeof orphans>();
  for (const turn of orphans) {
    const key = `${turn.workbookId}::${turn.userId}`;
    groups.set(key, [...(groups.get(key) ?? []), turn]);
  }
  for (const [key, turns] of groups) {
    const first = turns[0];
    const last = turns[turns.length - 1];
    const title = first.question.length > 80 ? `${first.question.slice(0, 77)}…` : first.question;
    const [session] = await db.insert(workbookChatSessions).values({
      id: `ses_${randomBytes(8).toString("hex")}`,
      workbookId: first.workbookId,
      userId: first.userId,
      title,
      sourceIds: last.sourceIds,
      createdAt: first.createdAt,
      updatedAt: last.createdAt,
    }).returning();
    await db.update(workbookChatTurns).set({ sessionId: session.id })
      .where(and(eq(workbookChatTurns.workbookId, first.workbookId), eq(workbookChatTurns.userId, first.userId), isNull(workbookChatTurns.sessionId)));
    console.log(`session ${session.id} <- ${turns.length} turn(s) for ${key}`);
  }
  console.log(`done — ${groups.size} session(s) created`);
  process.exit(0);
}

main().catch((error) => {
  console.error("backfill failed", error);
  process.exit(1);
});
