import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-session";
import { setAssignmentCompletion } from "@/lib/assignments";

const bodySchema = z.object({
  completed: z.boolean(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  if (user.role !== "student") {
    return NextResponse.json({ error: "Hanya akaun pelajar boleh menandakan tugasan." }, { status: 403 });
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  const result = await setAssignmentCompletion(user, id, parsed.data.completed);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 404 });
  return NextResponse.json(result);
}
