"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, MapPin, School, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type SchoolOption = {
  id: string;
  name: string;
  type: string;
  state: string;
  district: string | null;
};

export function schoolTypeLabel(type: string) {
  return type === "secondary" ? "Sekolah Menengah" : "Sekolah Kebangsaan";
}

export function SchoolPicker({
  selected,
  onSelect,
  disabled,
}: {
  selected: SchoolOption | null;
  onSelect: (school: SchoolOption | null) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SchoolOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestState, setRequestState] = useState("");
  const [requestStatus, setRequestStatus] = useState<"idle" | "sending" | "sent">("idle");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/schools?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { schools: SchoolOption[] };
        setResults(data.schools ?? []);
        setActive(0);
      } catch {
        // aborted or offline — keep previous results
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function choose(school: SchoolOption) {
    onSelect(school);
    setOpen(false);
    setQuery("");
    setRequestOpen(false);
    setRequestStatus("idle");
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (event.key === "ArrowDown") setOpen(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (results[active]) choose(results[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  async function submitRequest() {
    if (requestState.trim().length < 3) return;
    setRequestStatus("sending");
    await fetch("/api/school-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolName: query.trim() || "Sekolah baharu", state: requestState.trim() }),
    }).catch(() => null);
    setRequestStatus("sent");
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#bfe9e2] bg-[#f4fbfa] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#E7F6F4] text-teal">
            <School className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{selected.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              {schoolTypeLabel(selected.type)}
              <span aria-hidden="true">·</span>
              <MapPin className="size-3" aria-hidden="true" />
              {selected.district ? `${selected.district}, ${selected.state}` : selected.state}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onSelect(null);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          disabled={disabled}
          className="shrink-0 text-xs font-semibold text-teal underline underline-offset-2 hover:text-[#00574a]"
        >
          Tukar
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          aria-controls="school-listbox"
          aria-autocomplete="list"
          aria-label="Cari sekolah anda"
          autoComplete="off"
          placeholder="Taip nama sekolah anda…"
          className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-9 text-sm shadow-soft outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {loading ? (
          <Loader2
            className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : (
          <ChevronDown
            className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </div>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-card shadow-soft-lg">
          <ul id="school-listbox" role="listbox" aria-label="Hasil carian sekolah" className="max-h-64 overflow-y-auto p-1.5">
            {results.map((school, index) => (
              <li key={school.id} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  onClick={() => choose(school)}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    index === active ? "bg-[#f2fbf9]" : "",
                  )}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#E7F6F4] text-teal">
                    <School className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{school.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {schoolTypeLabel(school.type)} · {school.state}
                    </span>
                  </span>
                  {index === active && <Check className="size-4 shrink-0 text-teal" aria-hidden="true" />}
                </button>
              </li>
            ))}
            {!loading && results.length === 0 && (
              <li className="px-3 py-3">
                <p className="text-sm font-semibold">Tiada sekolah sepadan</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Semak ejaan, atau minta sekolah anda ditambah.
                </p>
                {requestStatus === "sent" ? (
                  <p className="mt-2 rounded-lg bg-[#E7F6F4] px-3 py-2 text-xs font-semibold text-[#00786a]">
                    Permintaan diterima ✓ Sekolah akan ditambah tidak lama lagi.
                  </p>
                ) : requestOpen ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <input
                      value={requestState}
                      onChange={(event) => setRequestState(event.target.value)}
                      placeholder="Negeri (cth. Johor)"
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={submitRequest}
                      disabled={requestStatus === "sending" || requestState.trim().length < 3}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-foreground px-3 text-xs font-semibold text-background disabled:opacity-50"
                    >
                      {requestStatus === "sending" && <Loader2 className="size-3 animate-spin" aria-hidden="true" />}
                      Hantar permintaan
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRequestOpen(true)}
                    className="mt-2 text-xs font-semibold text-teal underline underline-offset-2"
                  >
                    Minta tambah sekolah
                  </button>
                )}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
