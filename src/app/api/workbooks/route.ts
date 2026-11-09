import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { workbooks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { SUBJECTS } from "@/lib/demo-data";

const bodySchema = z.object({
  title: z.string().trim().min(3, "Tajuk terlalu pendek.").max(160),
  subjectId: z.string().refine((value) => SUBJECTS.some((s) => s.id === value), "Subjek tidak sah."),
  topic: z.string().trim().max(300).optional().default(""),
  yearLabel: z.string().trim().max(40).optional().default(""),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Permintaan tidak sah." }, { status: 400 });
  }

  const id = `wb_${randomBytes(8).toString("hex")}`;
  await db.insert(workbooks).values({
    id,
    title: parsed.data.title,
    subjectId: parsed.data.subjectId,
    topic: parsed.data.topic,
    yearLabel: parsed.data.yearLabel || user.yearLabel,
    ownerId: user.id,
    ownerName: user.preferredName,
    ownerRole: user.role,
  });

  return NextResponse.json({ id }, { status: 201 });
}
