import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-session";
import { listClassesForUser } from "@/lib/classes";
import { SubjectsView } from "./subjects-view";

export const metadata: Metadata = { title: "Subjek" };

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const user = await requireUser();
  const subjects = await listClassesForUser(user);
  return <SubjectsView user={user} subjects={subjects} />;
}
