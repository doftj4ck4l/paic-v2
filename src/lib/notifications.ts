import { randomBytes } from "crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";

export type NotificationView = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

type NotificationInput = {
  type: string;
  title: string;
  body?: string;
  href?: string | null;
};

export async function createNotification(userId: string, input: NotificationInput) {
  await db.insert(notifications).values({
    id: `ntf_${randomBytes(8).toString("hex")}`,
    userId,
    type: input.type,
    title: input.title,
    body: input.body ?? "",
    href: input.href ?? null,
  });
}

export async function createNotificationsForUsers(userIds: string[], input: NotificationInput) {
  const unique = [...new Set(userIds)];
  if (!unique.length) return;
  await db.insert(notifications).values(
    unique.map((userId) => ({
      id: `ntf_${randomBytes(8).toString("hex")}`,
      userId,
      type: input.type,
      title: input.title,
      body: input.body ?? "",
      href: input.href ?? null,
    })),
  );
}

export async function listNotifications(userId: string, limit = 50): Promise<NotificationView[]> {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function unreadNotificationCount(userId: string) {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return rows.length;
}

export async function markNotificationRead(userId: string, id: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId), isNull(notifications.readAt)));
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}

