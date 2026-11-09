import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { getSource } from "@/lib/sources";
import { accessibleWorkbook, canReadSource } from "@/lib/ingestion/access";
import { attachmentHeader, sourceDownload } from "@/lib/workbook/downloads";
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const source = await getSource((await params).id);
  if (!source || !canReadSource(source, user.id) || !await accessibleWorkbook(source.workbookId, user.id)) return NextResponse.json({ error: "Sumber tidak dijumpai." }, { status: 404 });
  try { const file = await sourceDownload(source); return new NextResponse(new Uint8Array(file.bytes), { headers: { "Content-Type": file.type, "Content-Disposition": attachmentHeader(file.name), "Cache-Control": "private, no-store" } }); }
  catch { return NextResponse.json({ error: "Sumber ini belum mempunyai kandungan untuk dimuat turun." }, { status: 422 }); }
}
