import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { classMembers } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";
import { isClassMember } from "@/lib/classes";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  if (user.role !== "student") {
    return NextResponse.json({ error: "Hanya akaun pelajar boleh keluar kelas." }, { status: 403 });
  }

  const { id } = await params;
  if (!(await isClassMember(user.id, id))) {
    return NextResponse.json({ error: "Kelas tidak ditemui." }, { status: 404 });
  }

  await db.delete(classMembers).where(and(eq(classMembers.classId, id), eq(classMembers.studentId, user.id)));
  return NextResponse.json({ ok: true });
}
