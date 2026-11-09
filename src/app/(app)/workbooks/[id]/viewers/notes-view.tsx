import { FileText } from "lucide-react";
import styles from "../workbook.module.css";

export type NotesData = {
  title: string;
  sections: { heading: string; bullets: string[]; citation?: string }[];
};

export function NotesView({ data }: { data: NotesData }) {
  return (
    <article className={styles.notesWrap} aria-label={data.title}>
      {data.sections.map((section, i) => (
        <section key={`${i}-${section.heading}`} className={styles.noteSection}>
          <span className={styles.noteNum} aria-hidden="true">{i + 1}</span>
          <div className={styles.noteBody}>
            <h3>{section.heading}</h3>
            <ul className={styles.noteBullets}>
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            {section.citation && (
              <p className={styles.noteCitation}>
                <FileText size={12} aria-hidden="true" />
                Sumber: {section.citation}
              </p>
            )}
          </div>
        </section>
      ))}
    </article>
  );
}
