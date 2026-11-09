import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { editableWorkbook } from "@/lib/ingestion/access";
import { startSourceWorker } from "@/lib/ingestion/worker";
import { getSource, updateSource } from "@/lib/sources";
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const row = await getSource((await params).id);
  if (!row || row.ownerId !== user.id || !await editableWorkbook(row.workbookId, user.id)) return NextResponse.json({ error: "Sumber tidak dijumpai." }, { status: 404 });
  const meta = row.meta as Record<string, unknown> | null;
  if (row.status !== "failed" || meta?.review !== "pending" || row.kind !== "youtube" || !meta.url) return NextResponse.json({ error: "Sumber ini tidak memerlukan transkripsi semula." }, { status: 422 });
  await updateSource(row.id, { status: "processing", error: null, meta: { ...meta, job: "transcribe", stage: "queued", leaseUntil: null, workerToken: null } });
  startSourceWorker();
  return NextResponse.json({ status: "processing" }, { status: 202 });
}
