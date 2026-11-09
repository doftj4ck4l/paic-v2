"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MINDMAP, type DemoMindmapNode } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

function Node({ node, depth = 0 }: { node: DemoMindmapNode; depth?: number }) {
  const [open, setOpen] = useState(true);
  const hasChildren = !!node.children?.length;

  return (
    <li className="flex flex-col">
      <div className="flex items-center gap-1.5" style={{ paddingLeft: depth * 22 }}>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? `Tutup ${node.label}` : `Buka ${node.label}`}
            className="grid size-6 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
          >
            {open ? <ChevronDown className="size-4" aria-hidden="true" /> : <ChevronRight className="size-4" aria-hidden="true" />}
          </button>
        ) : (
          <span className="grid size-6 shrink-0 place-items-center" aria-hidden="true">
            <span className="size-1.5 rounded-full bg-[#00b6a2]" />
          </span>
        )}
        <span
          className={cn(
            "rounded-xl border px-3 py-1.5 text-sm font-semibold",
            depth === 0
              ? "border-transparent bg-gradient-to-r from-[#007a66] to-[#00856f] text-white"
              : depth === 1
                ? "border-[#bfe9e2] bg-[#f2fbf9] text-[#046b69]"
                : "border-border bg-card text-muted-foreground",
          )}
        >
          {node.label}
        </span>
      </div>
      {hasChildren && open && (
        <ul className="mt-2 flex flex-col gap-2">
          {node.children!.map((child) => (
            <Node key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function MindMapViewer() {
  return (
    <div className="rounded-[24px] border border-border bg-card p-6 shadow-soft">
      <ul className="flex flex-col gap-2" aria-label="Peta minda Kitaran Air">
        <Node node={MINDMAP} />
      </ul>
      <p className="mt-5 text-xs text-muted-foreground">
        Ketuk anak panah untuk kembang/tutup cabang. Zoom &amp; pan penuh serta eksport dalam Fasa 4.
      </p>
    </div>
  );
}
