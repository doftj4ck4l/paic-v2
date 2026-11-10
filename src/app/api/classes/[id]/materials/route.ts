import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-session";
import { shareWorkbookWithClass } from "@/lib/assignments";

const bodySchema = z.object({
  workbookId: z.string().trim().min(1, "Pilih buku kerja."),
  shared: z.boolean(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  if (user.role !== "teacher") {
    return NextResponse.json({ error: "Hanya akaun guru boleh berkongsi bahan." }, { status: 403 });
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Permintaan tidak sah." }, { status: 400 });
  }

  const result = await shareWorkbookWithClass(user, id, parsed.data.workbookId, parsed.data.shared);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 404 });
  return NextResponse.json(result);
}
