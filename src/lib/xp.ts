import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

/** XP amounts awarded by learning events. */
export const XP_PER_QUIZ = 10;
export const XP_PER_ASSIGNMENT = 50;

/** Adjust a learner's XP (clamped at 0). */
export async function awardXp(userId: string, amount: number) {
  if (!amount) return;
  await db
    .update(users)
    .set({ xp: sql`GREATEST(0, ${users.xp} + ${amount})` })
    .where(eq(users.id, userId));
}
