"use client";

import { DEMO_LEVEL_COOKIE, type SchoolLevel } from "@/lib/demo-constants";

/**
 * Demo-session cookie helpers (design-validation build only).
 * Phase 1 replaces this with real server-issued session cookies.
 */
export function setDemoLevelCookie(level: SchoolLevel, remember = true) {
  document.cookie = `${DEMO_LEVEL_COOKIE}=${level}; ${remember ? "Max-Age=86400; " : ""}path=/; SameSite=Lax`;
}

export function clearDemoLevelCookie() {
  document.cookie = `${DEMO_LEVEL_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`;
}
