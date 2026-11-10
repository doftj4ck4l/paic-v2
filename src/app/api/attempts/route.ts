import { randomBytes } from "crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { artifacts, quizAttempts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { viewableWorkbook } from "@/lib/ingestion/access";
import { awardXp, XP_PER_QUIZ } from "@/lib/xp";

const bodySchema = z.object({
  workbookId: z.string().trim().min(1),
  artifactId: z.string().trim().min(1),
  score: z.coerce.number().int().min(0),
  total: z.coerce.number().int().min(1),
  answers: z.array(z.coerce.number().int()).max(60).optional().default([]),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }
  const { workbookId, artifactId, score, total, answers } = parsed.data;
  if (score > total) return NextResponse.json({ error: "Skor tidak sah." }, { status: 400 });

  if (!(await viewableWorkbook(workbookId, user.id))) {
    return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  }

  const [artifact] = await db
    .select({ id: artifacts.id })
    .from(artifacts)
    .where(and(eq(artifacts.id, artifactId), eq(artifacts.workbookId, workbookId), eq(artifacts.kind, "quizzes")));
  if (!artifact) return NextResponse.json({ error: "Kuiz tidak dijumpai." }, { status: 404 });

  const prior = await db
    .select({ id: quizAttempts.id })
    .from(quizAttempts)
    .where(and(eq(quizAttempts.userId, user.id), eq(quizAttempts.artifactId, artifactId)))
    .limit(1);

  const id = `att_${randomBytes(8).toString("hex")}`;
  await db.insert(quizAttempts).values({
    id,
    userId: user.id,
    workbookId,
    artifactId,
    score,
    total,
    answers,
  });

  let xpAwarded = 0;
  if (prior.length === 0) {
    await awardXp(user.id, XP_PER_QUIZ);
    xpAwarded = XP_PER_QUIZ;
  }

  return NextResponse.json({ ok: true, id, xpAwarded }, { status: 201 });
}
