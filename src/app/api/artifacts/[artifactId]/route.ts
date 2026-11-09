import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ artifactId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { artifactId } = await params;
  const [row] = await db.select().from(artifacts).where(eq(artifacts.id, artifactId));
  if (!row) return NextResponse.json({ error: "Artifak tidak dijumpai." }, { status: 404 });

  return NextResponse.json({
    id: row.id,
    workbookId: row.workbookId,
    kind: row.kind,
    title: row.title,
    status: row.status,
    error: row.error,
    params: row.params,
    data: row.data,
    createdAt: row.createdAt,
  });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ artifactId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { artifactId } = await params;
  await db.delete(artifacts).where(eq(artifacts.id, artifactId));
  return NextResponse.json({ ok: true });
}
