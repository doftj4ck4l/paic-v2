import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { deleteAssignment } from "@/lib/assignments";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  if (user.role !== "teacher") {
    return NextResponse.json({ error: "Hanya akaun guru boleh memadam tugasan." }, { status: 403 });
  }

  const { id } = await params;
  const result = await deleteAssignment(user, id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 404 });
  return NextResponse.json(result);
}
