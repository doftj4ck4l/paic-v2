import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { editableWorkbook } from "@/lib/ingestion/access";
import { searchLearningSources } from "@/lib/ingestion/search";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 500);
  if (query.length < 3) return NextResponse.json({ error: "Masukkan sekurang-kurangnya 3 aksara." }, { status: 400 });
  const workbookId = request.nextUrl.searchParams.get("workbookId");
  const workbook = workbookId ? await editableWorkbook(workbookId, user.id) : null;
  if (workbookId && !workbook) return NextResponse.json({ error: "Buku kerja tidak dijumpai." }, { status: 404 });
  try { return NextResponse.json({ results: await searchLearningSources(query, workbook, user.language === "en" ? "en" : "ms") }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Carian web gagal." }, { status: 502 }); }
}
