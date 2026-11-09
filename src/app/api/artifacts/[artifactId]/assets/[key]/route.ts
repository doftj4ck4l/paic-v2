import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { editableWorkbook, viewableWorkbook } from "@/lib/ingestion/access";
import { getCurrentUser } from "@/lib/auth-session";
import { normalizeWaveHeader } from "@/lib/generation/wav";
import { getAsset } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ artifactId: string; key: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { artifactId, key } = await params;
  const [artifact] = await db.select().from(artifacts).where(eq(artifacts.id, artifactId));
  if (!artifact) return NextResponse.json({ error: "Aset tidak dijumpai." }, { status: 404 });
  const isOwner = artifact.userId === user.id && Boolean(await editableWorkbook(artifact.workbookId, user.id));
  if (!isOwner) {
    const workbook = await viewableWorkbook(artifact.workbookId, user.id);
    const viewerOk = Boolean(workbook && artifact.status === "ready" && (artifact.userId === null || (workbook.isDb && artifact.userId === workbook.ownerId)));
    if (!viewerOk) return NextResponse.json({ error: "Aset tidak dijumpai." }, { status: 404 });
  }
  const safeKey = key.replace(/[^a-z0-9.-]/gi, "");
  const asset = await getAsset(`artifacts/${artifactId}/${safeKey}`);
  if (!asset) return NextResponse.json({ error: "Aset belum sedia." }, { status: 404 });

  const bytes = asset.contentType === "audio/wav" ? normalizeWaveHeader(asset.bytes) : new Uint8Array(asset.bytes);
  const headers: Record<string, string> = { "Content-Type": asset.contentType, "Cache-Control": "private, max-age=3600", "Accept-Ranges": "bytes" };
  const range = _request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || !match[1] && !match[2]) return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${bytes.length}` } });
    const suffix = !match[1];
    const start = suffix ? Math.max(0, bytes.length - Number(match[2])) : Number(match[1]);
    const end = suffix || !match[2] ? bytes.length - 1 : Math.min(Number(match[2]), bytes.length - 1);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= bytes.length) return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${bytes.length}` } });
    return new NextResponse(new Uint8Array(bytes.slice(start, end + 1)), { status: 206, headers: { ...headers, "Content-Length": String(end - start + 1), "Content-Range": `bytes ${start}-${end}/${bytes.length}` } });
  }
  return new NextResponse(new Uint8Array(bytes), { headers: { ...headers, "Content-Length": String(bytes.length) } });
}
