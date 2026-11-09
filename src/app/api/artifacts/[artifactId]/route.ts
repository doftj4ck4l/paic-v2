import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { validateModuleForSave } from "@/lib/workbook/modules";
import { prepareModuleMedia } from "@/lib/workbook/module-media";
import { validateQuizForSave } from "@/lib/workbook/quizzes";
import { accessibleWorkbook } from "@/lib/ingestion/access";
import { getCurrentUser } from "@/lib/auth-session";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ artifactId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { artifactId } = await params;
  const [row] = await db.select().from(artifacts).where(eq(artifacts.id, artifactId));
  if (!row || (row.userId && row.userId !== user.id) || !await accessibleWorkbook(row.workbookId, user.id)) return NextResponse.json({ error: "Artifak tidak dijumpai." }, { status: 404 });

  return NextResponse.json({
    id: row.id,
    workbookId: row.workbookId,
    kind: row.kind,
    title: row.title,
    status: row.status,
    error: row.error,
    params: Object.fromEntries(Object.entries((row.params ?? {}) as Record<string, unknown>).filter(([key]) => !["workerToken", "leaseUntil"].includes(key))),
    data: row.data,
    createdAt: row.createdAt,
  });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ artifactId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { artifactId } = await params;
  await db.delete(artifacts).where(and(eq(artifacts.id, artifactId), eq(artifacts.userId, user.id)));
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ artifactId: string }> }) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { artifactId } = await params;
  const [row] = await db.select().from(artifacts).where(and(eq(artifacts.id, artifactId), eq(artifacts.userId, user.id)));
  if (!row || !await accessibleWorkbook(row.workbookId, user.id)) return NextResponse.json({ error: "Kuiz tidak dijumpai." }, { status: 404 });
  if (row.status === "generating") return NextResponse.json({ error: "Tunggu sehingga penjanaan selesai sebelum menyunting." }, { status: 409 });
  try {
    const raw = await request.json();
    if (row.kind !== "quizzes") {
      const body = validateModuleForSave({ ...raw, kind: row.kind });
      const data = await prepareModuleMedia(body.kind, body.data, artifactId, row);
      const changed = await db.update(artifacts).set({ title: body.title, status: body.status, error: null, updatedAt: new Date(), data }).where(and(eq(artifacts.id, artifactId), eq(artifacts.userId, user.id), eq(artifacts.status, row.status))).returning({ id: artifacts.id });
      if (!changed.length) return NextResponse.json({ error: "Bahan telah berubah. Muat semula sebelum menyimpan." }, { status: 409 });
      return NextResponse.json({ ok: true });
    }
    const body = validateQuizForSave(raw);
    await db.update(artifacts).set({ title: body.title, status: body.status, error: null, updatedAt: new Date(), data: { title: body.title, description: body.description, questions: body.questions }, params: { ...(row.params as Record<string, unknown> | null), difficulty: body.difficulty, cover: body.cover } }).where(and(eq(artifacts.id, artifactId), eq(artifacts.userId, user.id)));
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: row.kind === "quizzes" ? "Semak semua soalan dan pilihan jawapan. Kuiz sedia memerlukan sekurang-kurangnya 3 soalan lengkap." : "Lengkapkan kandungan sebelum menandakan bahan sedia, atau simpan sebagai draf." }, { status: 422 }); }
}
