"use client";
import { useEffect, useState } from "react";

/**
 * Saved workbooks (Jelajah → "Disimpan" collection). Device-local list of real
 * published workbook ids, shared across components through a window event.
 */

const KEY = "paicv3_saved_workbooks";
const EVENT = "paicv3:saved";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  window.localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
}

export function toggleSavedWorkbook(id: string) {
  const ids = read();
  write(ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]);
}

export function useSavedWorkbooks(): string[] {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const kick = setTimeout(() => setIds(read()), 0);
    const sync = () => setIds(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      clearTimeout(kick);
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return ids;
}
