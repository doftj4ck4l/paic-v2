import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { deleteSource, getSource } from "@/lib/sources";
import { accessibleWorkbook, canReadSource, sourceView } from "@/lib/ingestion/access";
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const row = await getSource((await params).id);
  if (!row || !canReadSource(row, user.id) || !await accessibleWorkbook(row.workbookId, user.id)) return NextResponse.json({ error: "Sumber tidak dijumpai." }, { status: 404 });
  return NextResponse.json(sourceView(row, user.id, true));
}
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const row = await getSource((await params).id);
  if (!row || row.ownerId !== user.id || !await accessibleWorkbook(row.workbookId, user.id)) return NextResponse.json({ error: "Sumber tidak boleh dipadam." }, { status: 404 });
  await deleteSource(row.id);
  return NextResponse.json({ ok: true });
}
