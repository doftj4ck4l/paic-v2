export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PHASE !== "phase-production-build") {
    const { startSourceWorker } = await import("@/lib/ingestion/worker");
    startSourceWorker();
    const { startArtifactWorker } = await import("@/lib/generation/worker");
    startArtifactWorker();
  }
}
