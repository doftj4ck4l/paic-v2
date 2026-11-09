/** Shared in-process job queue for artifact generation. */

type Job = () => Promise<void>;
const queue: Job[] = [];
let running = false;

export function enqueueArtifactJob(job: Job) {
  queue.push(job);
  void pump();
}

async function pump() {
  if (running) return;
  running = true;
  try {
    while (queue.length > 0) {
      const job = queue.shift()!;
      try {
        await job();
      } catch (error) {
        console.error("[generation] job failed:", error);
      }
    }
  } finally {
    running = false;
  }
}
