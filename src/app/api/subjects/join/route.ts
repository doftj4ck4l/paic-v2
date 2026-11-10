import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-session";
import { joinClassByCode } from "@/lib/classes";

const bodySchema = z.object({
  code: z.string().trim().min(1, "Masukkan kod subjek.").max(12),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  if (user.role !== "student") {
    return NextResponse.json({ error: "Hanya akaun pelajar boleh menyertai subjek." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Permintaan tidak sah." }, { status: 400 });
  }

  const result = await joinClassByCode(user, parsed.data.code);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 404 });
  return NextResponse.json(result);
}
