"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";
import type { DeckData } from "@/lib/generation/schemas";
import { SlideCanvas } from "@/app/(app)/workbooks/[id]/slide-canvas";
import styles from "./print.module.css";

export function PrintDeck({ artifactId, deck }: { artifactId: string; deck: DeckData }) {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 1100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.sheet}>
      <div className={styles.toolbar}>
        <div>
          <span>{deck.title}</span>
          <p className={styles.toolbarTip}>Petua: dalam dialog cetak, pilih Margin &ldquo;None&rdquo;, tandakan &ldquo;Background graphics&rdquo; dan matikan &ldquo;Headers and footers&rdquo; untuk hasil penuh warna.</p>
        </div>
        <button type="button" onClick={() => window.print()}>
          <Printer size={15} aria-hidden="true" /> Cetak / Simpan PDF
        </button>
      </div>
      {deck.slides.map((slide, index) => (
        <div key={`${index}-${slide.title}`} className={styles.page}>
          <SlideCanvas
            artifactId={artifactId}
            slide={slide}
            index={index}
            total={deck.slides.length}
            deckTitle={deck.title}
            fullImage={deck.format === "images"}
            className={styles.canvas}
          />
        </div>
      ))}
    </div>
  );
}
