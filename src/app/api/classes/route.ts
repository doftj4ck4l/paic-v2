import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-session";
import { createClass, listClassesForUser } from "@/lib/classes";

const bodySchema = z.object({
  name: z.string().trim().min(2, "Nama kelas terlalu pendek.").max(60),
  formLevel: z.string().trim().max(40).optional().default(""),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const classes = await listClassesForUser(user);
  return NextResponse.json({ classes });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  if (user.role !== "teacher") {
    return NextResponse.json({ error: "Hanya akaun guru boleh mencipta kelas." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Permintaan tidak sah." }, { status: 400 });
  }

  const created = await createClass(user, parsed.data);
  return NextResponse.json(created, { status: 201 });
}
