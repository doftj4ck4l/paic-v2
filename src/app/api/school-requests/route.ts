import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { schoolRequests } from "@/db/schema";

const schema = z.object({
  schoolName: z.string().trim().min(3, "Masukkan nama sekolah.").max(120),
  state: z.string().trim().max(60).optional(),
  note: z.string().trim().max(500).optional(),
  requestedBy: z.string().trim().email().optional().or(z.literal("")),
});

/** "My school isn't listed" requests from the registration flow. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }
  const { schoolName, state, note, requestedBy } = parsed.data;
  await db.insert(schoolRequests).values({
    schoolName,
    state: state || null,
    note: note || null,
    requestedBy: requestedBy || null,
  });
  return NextResponse.json({ ok: true });
}
