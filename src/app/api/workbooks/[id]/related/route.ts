import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { viewableWorkbook } from "@/lib/ingestion/access";
import { listWorkbooksForUser } from "@/lib/workbooks";
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const workbook = await viewableWorkbook((await params).id, user.id);
  if (!workbook) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  const rows = (await listWorkbooksForUser(user.id)).filter(row => row.id !== workbook.id).sort((a,b) => Number(b.subjectId === workbook.subjectId) - Number(a.subjectId === workbook.subjectId)).slice(0, 6);
  return NextResponse.json({ workbooks: rows.map(row => ({ id: row.id, title: row.title, subjectId: row.subjectId, yearLabel: row.yearLabel })) });
}
