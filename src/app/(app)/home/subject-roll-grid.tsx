"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { DemoSubject, SubjectId } from "@/lib/demo-data";
import styles from "./home.module.css";

const TILE_COUNT = 6;
const ROLL_EVERY_MS = 3000;
const ROLL_MS = 680;

type RollState = { index: number; nextId: SubjectId; go: boolean };

/**
 * Dashboard subject grid where one tile periodically rolls like a dice — the
 * next subject drops in from the top to face front. The grid always shows
 * distinct subjects; rolled-away subjects wait on the bench.
 */
export function SubjectRollGrid({ subjects }: { subjects: DemoSubject[] }) {
  const byId = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject])), [subjects]);
  const [tileIds, setTileIds] = useState(() => subjects.slice(0, TILE_COUNT).map((subject) => subject.id));
  const [benchIds, setBenchIds] = useState(() => subjects.slice(TILE_COUNT).map((subject) => subject.id));
  const [roll, setRoll] = useState<RollState | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const nextTile = useRef(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Start one roll every few seconds, moving round-robin across the tiles.
  useEffect(() => {
    if (reduced || paused || roll || !benchIds.length) return;
    const timer = setTimeout(() => {
      if (document.hidden) return;
      const index = nextTile.current % tileIds.length;
      nextTile.current = (index + 1) % tileIds.length;
      const nextId = benchIds[Math.floor(Math.random() * benchIds.length)];
      setRoll({ index, nextId, go: false });
    }, ROLL_EVERY_MS);
    return () => clearTimeout(timer);
  }, [reduced, paused, roll, benchIds, tileIds.length]);

  // Kick the CSS transition on the next frame so the faces animate.
  useEffect(() => {
    if (!roll || roll.go) return;
    const frame = requestAnimationFrame(() => setRoll((current) => current && { ...current, go: true }));
    return () => cancelAnimationFrame(frame);
  }, [roll]);

  // Commit the swap once the dice lands.
  useEffect(() => {
    if (!roll?.go) return;
    const timer = setTimeout(() => {
      const outgoingId = tileIds[roll.index];
      setTileIds((current) => current.map((id, index) => (index === roll.index ? roll.nextId : id)));
      setBenchIds((current) => [...current.filter((id) => id !== roll.nextId), outgoingId]);
      setRoll(null);
    }, ROLL_MS);
    return () => clearTimeout(timer);
  }, [roll, tileIds]);

  return (
    <div className={styles.subjectGrid} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {tileIds.map((id, index) => {
        const subject = byId.get(id);
        if (!subject) return null;
        const rolling = roll?.index === index ? roll : null;
        const incoming = rolling ? byId.get(rolling.nextId) : undefined;
        return (
          <Link
            key={`tile-${index}`}
            href={`/explore/subjects/${subject.id}`}
            className={styles.subjectCard}
            data-subject={subject.id}
            aria-label={`${subject.name} — ${subject.workbookCount} buku kerja`}
          >
            <span key={subject.id} className={styles.subjectFace} data-subject={subject.id} data-roll={rolling?.go ? "out" : undefined}>
              <Image src={subject.asset} alt="" width={95} height={95} className={styles.subjectIcon} />
              <h3>{subject.name}</h3>
              <p>{subject.workbookCount > 0 ? `${subject.workbookCount} buku kerja` : "Teroka sekarang"}</p>
            </span>
            {incoming && (
              <span className={styles.subjectFace} data-subject={incoming.id} data-roll={rolling?.go ? "in" : "prep"} aria-hidden="true">
                <Image src={incoming.asset} alt="" width={95} height={95} className={styles.subjectIcon} />
                <h3>{incoming.name}</h3>
                <p>{incoming.workbookCount > 0 ? `${incoming.workbookCount} buku kerja` : "Teroka sekarang"}</p>
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
