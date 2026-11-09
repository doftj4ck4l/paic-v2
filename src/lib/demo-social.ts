"use client";

import { useEffect, useSyncExternalStore } from "react";
import { COMMUNITY_CLUBS, COMMUNITY_STUDENTS, SHARED_WORKBOOKS } from "@/lib/demo-data";

export type SocialState = {
  followed: string[];
  saved: string[];
  clubs: string[];
  remixed: string[];
  shared: string[];
  liked: string[];
};

const STORAGE_KEY = "paicv3_demo_social";

const DEFAULT_STATE: SocialState = {
  followed: COMMUNITY_STUDENTS.filter((s) => s.followed).map((s) => s.id),
  saved: SHARED_WORKBOOKS.filter((w) => w.defaultSaved).map((w) => w.id),
  clubs: COMMUNITY_CLUBS.filter((c) => c.defaultJoined).map((c) => c.id),
  remixed: [],
  shared: [],
  liked: [],
};

let state: SocialState = DEFAULT_STATE;

const listeners = new Set<() => void>();

function persist(next: SocialState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — session-only fallback
  }
}

function setState(next: SocialState) {
  state = next;
  persist(next);
  listeners.forEach((listener) => listener());
}

function subscribeToStore(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSocialState(): SocialState {
  return state;
}

let hydrated = false;

export function hydrateSocial() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<SocialState>;
    state = {
      followed: Array.isArray(parsed.followed) ? parsed.followed : DEFAULT_STATE.followed,
      saved: Array.isArray(parsed.saved) ? parsed.saved : DEFAULT_STATE.saved,
      clubs: Array.isArray(parsed.clubs) ? parsed.clubs : DEFAULT_STATE.clubs,
      remixed: Array.isArray(parsed.remixed) ? parsed.remixed : DEFAULT_STATE.remixed,
      shared: Array.isArray(parsed.shared) ? parsed.shared : DEFAULT_STATE.shared,
      liked: Array.isArray(parsed.liked) ? parsed.liked : DEFAULT_STATE.liked,
    };
    listeners.forEach((listener) => listener());
  } catch {
    // corrupted storage — keep defaults
  }
}

export function useSocial(): SocialState {
  const snapshot = useSyncExternalStore(subscribeToStore, getSocialState, getSocialState);
  useEffect(() => {
    hydrateSocial();
  }, []);
  return snapshot;
}

export function toggleFollow(id: string) {
  setState({
    ...state,
    followed: state.followed.includes(id) ? state.followed.filter((x) => x !== id) : [...state.followed, id],
  });
}

export function toggleSave(id: string) {
  setState({
    ...state,
    saved: state.saved.includes(id) ? state.saved.filter((x) => x !== id) : [...state.saved, id],
  });
}

export function toggleClub(id: string) {
  setState({
    ...state,
    clubs: state.clubs.includes(id) ? state.clubs.filter((x) => x !== id) : [...state.clubs, id],
  });
}

export function remixWorkbook(id: string) {
  if (state.remixed.includes(id)) return;
  setState({ ...state, remixed: [...state.remixed, id] });
}

export function shareWorkbook(id: string) {
  if (state.shared.includes(id)) return;
  setState({ ...state, shared: [...state.shared, id] });
}

export function toggleLike(id: string) {
  setState({
    ...state,
    liked: state.liked.includes(id) ? state.liked.filter((x) => x !== id) : [...state.liked, id],
  });
}
