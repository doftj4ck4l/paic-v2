import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-session";
import { editableWorkbook } from "@/lib/ingestion/access";
import { embeddingConfigured } from "@/lib/ingestion/embeddings";
import { enqueueSourceEmbedding } from "@/lib/ingestion/worker";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await params;
  if (!await editableWorkbook(id, user.id)) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  const body = z.object({ sourceIds: z.array(z.string().min(1)).min(1).max(20) }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Pilih antara 1 hingga 20 sumber." }, { status: 400 });
  if (!embeddingConfigured()) return NextResponse.json({ error: "Model embedding belum dikonfigurasi pada pelayan." }, { status: 503 });
  try { const ids = await enqueueSourceEmbedding([...new Set(body.data.sourceIds)], id, user.id); return NextResponse.json({ sourceIds: ids, status: "processing" }, { status: 202 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Embedding gagal dimulakan." }, { status: 422 }); }
}
