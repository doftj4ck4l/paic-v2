import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-session";
import { createAssignment } from "@/lib/assignments";

const bodySchema = z.object({
  workbookId: z.string().trim().min(1, "Pilih buku kerja."),
  title: z.string().trim().min(2, "Tajuk tugasan terlalu pendek.").max(160),
  instructions: z.string().trim().max(2000).optional().default(""),
  moduleKinds: z.array(z.string()).max(7).optional().default([]),
  dueAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarikh akhir tidak sah.")
    .nullable()
    .optional()
    .default(null),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  if (user.role !== "teacher") {
    return NextResponse.json({ error: "Hanya akaun guru boleh memberi tugasan." }, { status: 403 });
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Permintaan tidak sah." }, { status: 400 });
  }

  const result = await createAssignment(user, id, parsed.data);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 404 });
  return NextResponse.json(result, { status: 201 });
}
