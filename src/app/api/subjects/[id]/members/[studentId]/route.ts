import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { classMembers } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { isClassTeacher } from "@/lib/classes";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; studentId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { id, studentId } = await params;
  if (!(await isClassTeacher(user, id))) {
    return NextResponse.json({ error: "Subjek tidak ditemui." }, { status: 404 });
  }

  await db.delete(classMembers).where(and(eq(classMembers.classId, id), eq(classMembers.studentId, studentId)));
  return NextResponse.json({ ok: true });
}
