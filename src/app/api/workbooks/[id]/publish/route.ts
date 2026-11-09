import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { workbooks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-session";

const bodySchema = z.object({ publish: z.boolean() });

/** Publish / unpublish a DB workbook (owner only). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });

  const { id } = await params;
  const [row] = await db.select().from(workbooks).where(eq(workbooks.id, id));
  if (!row) return NextResponse.json({ error: "Buku kerja ini tidak boleh diterbitkan." }, { status: 404 });
  if (row.ownerId !== user.id) {
    return NextResponse.json({ error: "Hanya pemilik boleh menerbitkan buku kerja ini." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });

  await db
    .update(workbooks)
    .set({
      visibility: parsed.data.publish ? "published" : "private",
      publishedAt: parsed.data.publish ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(workbooks.id, id));

  return NextResponse.json({ id, visibility: parsed.data.publish ? "published" : "private" });
}
