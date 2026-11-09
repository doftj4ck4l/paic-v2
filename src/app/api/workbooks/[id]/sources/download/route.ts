import { NextRequest, NextResponse } from "next/server";
import { zipSync } from "fflate";
import { getCurrentUser } from "@/lib/auth-session";
import { listSources } from "@/lib/sources";
import { accessibleWorkbook, canReadSource } from "@/lib/ingestion/access";
import { attachmentHeader, downloadName, sourceDownload } from "@/lib/workbook/downloads";
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await params; const workbook = await accessibleWorkbook(id, user.id);
  if (!workbook) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  const rows = (await listSources(id, user.id)).filter(row => row.status === "ready" && canReadSource(row, user.id));
  if (!rows.length) return NextResponse.json({ error: "Tiada sumber siap untuk dimuat turun." }, { status: 422 });
  const files: Record<string, Uint8Array> = {}; let size = 0;
  for (let index = 0; index < rows.length; index++) {
    try { const file = await sourceDownload(rows[index]); size += file.bytes.byteLength; if (size > 50 * 1024 * 1024) return NextResponse.json({ error: "Jumlah fail melebihi 50 MB. Muat turun sumber satu demi satu." }, { status: 422 }); files[`${index + 1}-${file.name}`] = file.bytes; }
    catch { return NextResponse.json({ error: `Sumber “${rows[index].title}” belum boleh dimuat turun. Cuba muat turun sumber lain satu demi satu.` }, { status: 422 }); }
  }
  return new NextResponse(new Uint8Array(zipSync(files, { level: 0 })), { headers: { "Content-Type": "application/zip", "Content-Disposition": attachmentHeader(`${downloadName(workbook.title)}-sumber.zip`), "Cache-Control": "private, no-store" } });
}
