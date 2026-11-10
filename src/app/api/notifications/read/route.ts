import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-session";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/notifications";

const bodySchema = z.object({
  id: z.string().trim().min(1).optional(),
  all: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  if (parsed.data.all) {
    await markAllNotificationsRead(user.id);
  } else if (parsed.data.id) {
    await markNotificationRead(user.id, parsed.data.id);
  } else {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
