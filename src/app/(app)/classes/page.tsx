import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-session";
import { listClassesForUser } from "@/lib/classes";
import { ClassesView } from "./classes-view";

export const metadata: Metadata = { title: "Kelas" };

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const user = await requireUser();
  const classes = await listClassesForUser(user);
  return <ClassesView user={user} classes={classes} />;
}
