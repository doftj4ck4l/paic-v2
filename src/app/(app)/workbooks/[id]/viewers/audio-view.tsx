import { AudioLines, Info, Loader2 } from "lucide-react";
import type { AudioData } from "@/lib/generation/schemas";
import styles from "../workbook.module.css";

export function AudioView({ artifactId, data }: { artifactId: string; data: AudioData }) {
  return (
    <div className={styles.audioWrap}>
      {data.audio_status === "ready" ? (
        <div className={styles.audioPlayer}>
          <span className={styles.audioPlayerIcon} aria-hidden="true"><AudioLines /></span>
          <audio controls preload="metadata" src={`/api/artifacts/${artifactId}/assets/audio.wav`} className={styles.audioElement} />
        </div>
      ) : data.audio_status === "pending" ? (
        <div className={styles.audioNotice}>
          <Loader2 className={styles.audioSpin} aria-hidden="true" />
          Audio sedang dijana — transkrip sedia di bawah.
        </div>
      ) : (
        <div className={styles.audioNotice} data-tone="warn">
          <Info aria-hidden="true" />
          Audio tidak dapat dijana buat masa ini — transkrip dipaparkan di bawah.
        </div>
      )}

      <section className={styles.audioTranscript} aria-label="Transkrip audio">
        <h3>Transkrip</h3>
        <ol>
          {data.transcript.map((line, i) => (
            <li key={`${i}-${line.slice(0, 12)}`}>
              <span className={styles.audioLineNum} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {line}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
