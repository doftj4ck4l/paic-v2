import { Flame } from "lucide-react";
import styles from "./streak-path.module.css";

export function StreakPath({
  days,
  streakDays,
}: {
  days: { day: string; active: boolean }[];
  streakDays: number;
}) {
  return (
    <div className={styles.wrap}>
      <p className={styles.caption}>
        <Flame aria-hidden="true" /> {streakDays} hari rentetan
      </p>
      <ol className={styles.days}>
        {days.map((d) => (
          <li key={d.day} className={styles.day} data-active={d.active}>
            <span className={styles.dot} aria-hidden="true">
              {d.active && <Flame />}
            </span>
            <span className={styles.label}>{d.day}</span>
          </li>
        ))}
      </ol>
      <span className={styles.srOnly}>Aktiviti 7 hari terakhir</span>
    </div>
  );
}
