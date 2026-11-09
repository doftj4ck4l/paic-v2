import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { accessibleWorkbook } from "@/lib/ingestion/access";
import { validateQuizForSave } from "@/lib/workbook/quizzes";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await params; if (!await accessibleWorkbook(id, user.id)) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  try {
    const body = validateQuizForSave(await request.json()); const artifactId = `art_${randomBytes(8).toString("hex")}`;
    await db.insert(artifacts).values({ id: artifactId, workbookId: id, userId: user.id, kind: "quizzes", title: body.title, status: body.status, data: { title: body.title, description: body.description, questions: body.questions }, params: { difficulty: body.difficulty, cover: body.cover } });
    return NextResponse.json({ id: artifactId }, { status: 201 });
  } catch { return NextResponse.json({ error: "Semak tajuk dan soalan kuiz. Kuiz sedia memerlukan sekurang-kurangnya 3 soalan lengkap." }, { status: 422 }); }
}
