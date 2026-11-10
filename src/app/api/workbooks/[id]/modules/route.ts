import { randomBytes } from "node:crypto";
import { and, count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { editableWorkbook, viewableWorkbook } from "@/lib/ingestion/access";
import { MODULE_KINDS } from "@/lib/module-kinds";
import { validateModuleForSave } from "@/lib/workbook/modules";
import { prepareModuleMedia } from "@/lib/workbook/module-media";

/** Ready artifact counts per module kind — used by the class assignment mapper. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await params;
  if (!(await viewableWorkbook(id, user.id))) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });

  const rows = await db
    .select({ kind: artifacts.kind, total: count() })
    .from(artifacts)
    .where(and(eq(artifacts.workbookId, id), eq(artifacts.status, "ready")))
    .groupBy(artifacts.kind);
  const counts = new Map(rows.map((row) => [row.kind, Number(row.total)]));

  return NextResponse.json({
    modules: MODULE_KINDS.map(({ kind, label }) => ({ kind, label, count: counts.get(kind) ?? 0 })),
  });
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await params; if (!await editableWorkbook(id, user.id)) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  try {
    const raw = await request.json(); const body = validateModuleForSave(raw);
    let original;
    if (raw.duplicateOf) {
      [original] = await db.select().from(artifacts).where(and(eq(artifacts.id, String(raw.duplicateOf)), eq(artifacts.workbookId, id), eq(artifacts.userId, user.id), eq(artifacts.kind, body.kind)));
      if (!original || original.status === "generating") return NextResponse.json({ error: "Bahan asal tidak boleh disalin." }, { status: 404 });
    }
    const artifactId = `art_${randomBytes(8).toString("hex")}`;
    const data = await prepareModuleMedia(body.kind, body.data, artifactId, original, true);
    await db.insert(artifacts).values({ id: artifactId, workbookId: id, userId: user.id, kind: body.kind, title: body.title, status: body.status, data, params: {} });
    return NextResponse.json({ id: artifactId }, { status: 201 });
  } catch { return NextResponse.json({ error: "Semak kandungan bahan. Simpan sebagai draf jika belum lengkap." }, { status: 422 }); }
}
