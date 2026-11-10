import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { editableWorkbook } from "@/lib/ingestion/access";
import { getCurrentUser } from "@/lib/auth-session";
import { assetKey, putAsset } from "@/lib/storage";

const ALLOWED: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };

/** Owner-only upload of an image asset used by slide elements. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ artifactId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { artifactId } = await params;
  const [artifact] = await db.select().from(artifacts).where(eq(artifacts.id, artifactId));
  if (!artifact || artifact.userId !== user.id || !await editableWorkbook(artifact.workbookId, user.id)) {
    return NextResponse.json({ error: "Artifak tidak dijumpai." }, { status: 404 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Tiada fail diterima." }, { status: 400 });
  const extension = ALLOWED[file.type];
  if (!extension) return NextResponse.json({ error: "Format imej tidak disokong (PNG, JPG, WEBP atau GIF)." }, { status: 422 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Imej terlalu besar — maksimum 8 MB." }, { status: 422 });
  const key = `media-${randomBytes(6).toString("hex")}.${extension}`;
  await putAsset(assetKey(artifactId, key), new Uint8Array(await file.arrayBuffer()));
  return NextResponse.json({ assetKey: key }, { status: 201 });
}
