import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { artifacts } from "@/db/schema";
import { editableWorkbook } from "@/lib/ingestion/access";
import { getCurrentUser } from "@/lib/auth-session";
import { generateImage, isGenerationMock } from "@/lib/generation/router";
import { SLIDE_THEME_STYLE } from "@/lib/generation/prompts";
import { assetKey, putAsset } from "@/lib/storage";

const bodySchema = z.object({
  prompt: z.string().trim().min(4).max(600),
  mode: z.enum(["media", "slide"]).default("media"),
  slideIndex: z.number().int().min(0).max(40).optional(),
  theme: z.string().max(20).optional(),
  fullSlide: z.boolean().optional(),
});

/**
 * Owner-only AI image generation for the slide editor.
 * mode "media" → a standalone image element asset (ai-*.png).
 * mode "slide" → re-renders slide-<index>.png for a structured slide.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ artifactId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { artifactId } = await params;
  const [artifact] = await db.select().from(artifacts).where(eq(artifacts.id, artifactId));
  if (!artifact || artifact.userId !== user.id || !await editableWorkbook(artifact.workbookId, user.id)) {
    return NextResponse.json({ error: "Artifak tidak dijumpai." }, { status: 404 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Huraian imej tidak sah." }, { status: 422 });
  if (parsed.data.mode === "slide" && parsed.data.slideIndex === undefined) {
    return NextResponse.json({ error: "Indeks slaid diperlukan." }, { status: 422 });
  }
  if (isGenerationMock()) {
    return NextResponse.json({ error: "Penjanaan imej dimatikan dalam mod demo." }, { status: 503 });
  }
  const themeStyle = SLIDE_THEME_STYLE[parsed.data.theme ?? "clean"] ?? SLIDE_THEME_STYLE.clean;
  const isFullSlide = parsed.data.fullSlide === true;
  const prompt = isFullSlide
    ? parsed.data.prompt
    : `Create a clean flat vector illustration for a school presentation. Subject: ${parsed.data.prompt}. Style: ${themeStyle}. Do not include text, letters, numbers, people, faces, logos or watermarks. Compose in landscape 16:9 with generous negative space.`;
  try {
    const bytes = await generateImage(prompt);
    const key = parsed.data.mode === "slide" ? `slide-${parsed.data.slideIndex}.png` : `ai-${randomBytes(6).toString("hex")}.png`;
    await putAsset(assetKey(artifactId, key), bytes);
    return NextResponse.json({ assetKey: key }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Imej tidak dapat dijana.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
