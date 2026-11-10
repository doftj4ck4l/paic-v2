import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { getClassForUser, isClassTeacher, uniqueJoinCodeFor } from "@/lib/classes";

const patchSchema = z.object({
  name: z.string().trim().min(2, "Nama subjek terlalu pendek.").max(60).optional(),
  formLevel: z.string().trim().max(40).optional(),
  rotateCode: z.boolean().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { id } = await params;
  const detail = await getClassForUser(user, id);
  if (!detail) return NextResponse.json({ error: "Subjek tidak ditemui." }, { status: 404 });
  return NextResponse.json({ class: detail });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { id } = await params;
  if (!(await isClassTeacher(user, id))) {
    return NextResponse.json({ error: "Subjek tidak ditemui." }, { status: 404 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Permintaan tidak sah." }, { status: 400 });
  }

  const update: Partial<{ name: string; formLevel: string; joinCode: string }> = {};
  if (parsed.data.name !== undefined) update.name = parsed.data.name;
  if (parsed.data.formLevel !== undefined) update.formLevel = parsed.data.formLevel;
  if (parsed.data.rotateCode) update.joinCode = await uniqueJoinCodeFor(id);

  if (Object.keys(update).length > 0) {
    await db.update(classes).set(update).where(and(eq(classes.id, id), eq(classes.teacherId, user.id)));
  }

  const detail = await getClassForUser(user, id);
  return NextResponse.json({ class: detail });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { id } = await params;
  if (!(await isClassTeacher(user, id))) {
    return NextResponse.json({ error: "Subjek tidak ditemui." }, { status: 404 });
  }

  await db.delete(classes).where(and(eq(classes.id, id), eq(classes.teacherId, user.id)));
  return NextResponse.json({ ok: true });
}
