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
  const safeKey = key.replace(/[^a-z0-9-]/gi, "");
  const bytes = await getAsset(`artifacts/${artifactId}/${safeKey}.png`);
  if (!bytes) return NextResponse.json({ error: "Imej belum sedia." }, { status: 404 });

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
