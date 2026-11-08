import { cookies } from "next/headers";
import {
  DEMO_LEVEL_COOKIE,
  DEMO_STUDENTS,
  type DemoStudent,
  type SchoolLevel,
} from "@/lib/demo-constants";

export {
  DEMO_LEVEL_COOKIE,
  DEMO_STUDENTS,
  themeForLevel,
} from "@/lib/demo-constants";
export type { DemoStudent, SchoolLevel } from "@/lib/demo-constants";

export async function getDemoLevel(): Promise<SchoolLevel> {
  const store = await cookies();
  return store.get(DEMO_LEVEL_COOKIE)?.value === "primary"
    ? "primary"
    : "secondary";
}

export async function getDemoStudent(): Promise<DemoStudent> {
  const level = await getDemoLevel();
  return DEMO_STUDENTS[level];
}
