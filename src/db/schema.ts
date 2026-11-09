import { boolean, index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/* ================= Schools (tenancy root) ================= */

export const schools = pgTable("schools", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  /** "primary" (SK) or "secondary" (SMK/SMS) — drives the student experience level. */
  type: text("type").notNull(),
  state: text("state").notNull(),
  district: text("district"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ================= Better Auth core tables ================= */

export const users = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    /* username plugin */
    username: text("username").unique(),
    displayUsername: text("display_username"),
    /* Pixelspace profile */
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id),
    role: text("role").notNull().default("student"),
    status: text("status").notNull().default("active"),
    displayName: text("display_name"),
    yearLabel: text("year_label"),
    className: text("class_name"),
    language: text("language").notNull().default("bm"),
    xp: integer("xp").notNull().default(0),
    streakDays: integer("streak_days").notNull().default(0),
  },
  (t) => [index("user_school_id_idx").on(t.schoolId)],
);

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verifications = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/* ================= Pixelspace auxiliary tables ================= */

/** Security + audit trail for authentication events. */
export const authEvents = pgTable(
  "auth_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id"),
    event: text("event").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    detail: jsonb("detail"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("auth_events_user_id_idx").on(t.userId)],
);

/** "My school isn't listed" requests from the registration flow. */
export const schoolRequests = pgTable("school_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolName: text("school_name").notNull(),
  state: text("state"),
  note: text("note"),
  requestedBy: text("requested_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
