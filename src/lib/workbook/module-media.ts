import { assetKey, getAsset, putAsset } from "@/lib/storage";
import type { EditableModuleData, ModuleKind } from "./modules";
/** Media stays attached to its original content when slides are reordered or copied. */
export async function prepareModuleMedia(kind: ModuleKind, data: EditableModuleData, targetId: string, original?: { id: string; data: unknown }, duplicate = false) {
  if (kind === "slides" && data.slides) {
    const old = (original?.data as EditableModuleData | null)?.slides || [];
    data.slides = await Promise.all(data.slides.map(async (slide, index) => {
      const key = slide.image_key || (slide.image_status === "ready" && old[index]?.image_status === "ready" ? `slide-${index}.png` : undefined);
      const sourceId = duplicate ? original?.id : targetId;
      const asset = key && sourceId ? await getAsset(assetKey(sourceId, key)) : null;
      if (asset && duplicate) await putAsset(assetKey(targetId, key!), asset.bytes);
      return { ...slide, image_key: key, image_status: asset ? "ready" as const : "none" as const };
    }));
  }
  if (kind === "audio") {
    const old = original?.data as EditableModuleData | null;
    const unchanged = old && JSON.stringify(old.transcript) === JSON.stringify(data.transcript);
    const asset = unchanged && old?.audio_status === "ready" && original ? await getAsset(assetKey(original.id, "audio.wav")) : null;
    if (asset && duplicate) await putAsset(assetKey(targetId, "audio.wav"), asset.bytes);
    data.audio_status = asset ? "ready" : "none";
  }
  return data;
}
