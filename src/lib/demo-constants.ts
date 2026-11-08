export const DEMO_LEVEL_COOKIE = "paicv3_demo_level";

export type SchoolLevel = "primary" | "secondary";

export type DemoStudent = {
  id: string;
  preferredName: string;
  fullName: string;
  school: string;
  className: string;
  yearLabel: string;
  level: SchoolLevel;
  language: "bm" | "en";
  xp: number;
  xpPerLevel: number;
  streakDays: number;
};

/**
 * Demo profiles for design validation only.
 * The real implementation (Phase 1) resolves the level from verified
 * enrollment data, never from a client-supplied value.
 */
export const DEMO_STUDENTS: Record<SchoolLevel, DemoStudent> = {
  primary: {
    id: "demo-primary-001",
    preferredName: "Aiman",
    fullName: "Aiman Hakim bin Roslan",
    school: "SK Taman Bunga Raya (demo)",
    className: "4 Bestari",
    yearLabel: "Tahun 4",
    level: "primary",
    language: "bm",
    xp: 240,
    xpPerLevel: 100,
    streakDays: 3,
  },
  secondary: {
    id: "demo-secondary-001",
    preferredName: "Nurul",
    fullName: "Nurul Izzah binti Rahman",
    school: "SMK Seri Impian (demo)",
    className: "4 Cemerlang",
    yearLabel: "Tingkatan 4",
    level: "secondary",
    language: "bm",
    xp: 1750,
    xpPerLevel: 500,
    streakDays: 12,
  },
};

export function themeForLevel(level: SchoolLevel): "play" | "studio" {
  return level === "primary" ? "play" : "studio";
}
