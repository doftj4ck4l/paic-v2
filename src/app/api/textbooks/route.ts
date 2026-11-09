import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { listTextbooks, textbooksConfigured } from "@/lib/textbooks";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  if (!textbooksConfigured()) {
    return NextResponse.json({ books: [], configured: false });
  }
  const query = request.nextUrl.searchParams.get("q") ?? "";
  try {
    const books = await listTextbooks(query);
    return NextResponse.json({ books, configured: true });
  } catch (error) {
    console.error("[textbooks] list failed:", error);
    return NextResponse.json({ books: [], configured: true, error: "Pangkalan buku teks tidak dapat diakses." }, { status: 502 });
  }
}
