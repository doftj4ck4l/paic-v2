"use client";

import { useMemo, useState } from "react";
import { ArtifactCard } from "@/components/studio/cards";
import { EmptyState } from "@/components/studio/ui";
import { CREATIONS, CREATION_KIND_LABEL, type DemoCreation } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const KINDS = Object.keys(CREATION_KIND_LABEL) as DemoCreation["kind"][];

export function CreationsLibrary() {
  const [kind, setKind] = useState<DemoCreation["kind"] | "all">("all");

  const filtered = useMemo(
    () => (kind === "all" ? CREATIONS : CREATIONS.filter((c) => c.kind === kind)),
    [kind],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tapis mengikut jenis">
        <button
          type="button"
          onClick={() => setKind("all")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
            kind === "all"
              ? "border-transparent bg-foreground text-background"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          Semua
        </button>
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              kind === k
                ? "border-transparent bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {CREATION_KIND_LABEL[k]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tiada hasil untuk jenis ini"
          description="Jana bahan baharu daripada Studio dalam mana-mana buku kerja."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((c) => (
            <ArtifactCard key={c.id} creation={c} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {filtered.length} daripada {CREATIONS.length} hasil contoh · penjanaan AI baharu dalam Fasa 4.
      </p>
    </div>
  );
}
