import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { auth } from "./auth";

export type SchoolLevel = "primary" | "secondary";

/**
 * Session view model. Shaped to match the former DemoStudent profile so the
 * whole app can consume it without page-level changes.
 */
export type SessionUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string | null;
  role: "student" | "teacher";
  preferredName: string;
  fullName: string;
  schoolId: string;
  school: string;
  className: string;
  yearLabel: string;
  level: SchoolLevel;
  language: "bm" | "en";
  xp: number;
  xpPerLevel: number;
  streakDays: number;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const user = session.user;
  const [school] = await db.select().from(schools).where(eq(schools.id, user.schoolId));
  const level: SchoolLevel = school?.type === "secondary" ? "secondary" : "primary";

  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    username: user.username ?? null,
    role: user.role === "teacher" ? "teacher" : "student",
    preferredName: user.displayName?.trim() || user.name.split(" ")[0],
    fullName: user.name,
    schoolId: user.schoolId,
    school: school?.name ?? "Sekolah anda",
    className: user.className ?? "—",
    yearLabel: user.yearLabel ?? "—",
    level,
    language: user.language === "en" ? "en" : "bm",
    xp: user.xp ?? 0,
    xpPerLevel: level === "secondary" ? 500 : 100,
    streakDays: user.streakDays ?? 0,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
