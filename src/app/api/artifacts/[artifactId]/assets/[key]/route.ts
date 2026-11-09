import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { getAsset } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ artifactId: string; key: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { artifactId, key } = await params;
  const safeKey = key.replace(/[^a-z0-9.-]/gi, "");
  const asset = await getAsset(`artifacts/${artifactId}/${safeKey}`);
  if (!asset) return NextResponse.json({ error: "Aset belum sedia." }, { status: 404 });

  return new NextResponse(new Uint8Array(asset.bytes), {
    headers: {
      "Content-Type": asset.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
