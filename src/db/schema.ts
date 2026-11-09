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

/* ================= Workbooks + sources ================= */

/**
 * User-created workbooks (teachers and students). The seeded demo workbooks
 * live in code; DB rows are merged with them across the app.
 */
export const workbooks = pgTable(
  "workbooks",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    subjectId: text("subject_id").notNull(),
    topic: text("topic").notNull().default(""),
    yearLabel: text("year_label").notNull().default(""),
    ownerId: text("owner_id").notNull(),
    ownerName: text("owner_name").notNull().default(""),
    ownerRole: text("owner_role").notNull().default("student"),
    visibility: text("visibility").notNull().default("private"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("workbooks_owner_idx").on(t.ownerId), index("workbooks_visibility_idx").on(t.visibility)],
);

/**
 * Workbook sources: uploaded files, pasted text, web pages (TinyFish picks),
 * YouTube transcripts and textbook sections. `fullText` feeds AI generation.
 */
export const sources = pgTable(
  "sources",
  {
    id: text("id").primaryKey(),
    workbookId: text("workbook_id").notNull(),
    ownerId: text("owner_id"),
    title: text("title").notNull(),
    kind: text("kind").notNull(),
    status: text("status").notNull().default("processing"),
    fullText: text("full_text"),
    fileKey: text("file_key"),
    sizeLabel: text("size_label"),
    error: text("error"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("sources_workbook_idx").on(t.workbookId)],
);

/* ================= AI artifacts (workbook studio) ================= */

/** Real, resumable per-source embeddings; JSON vectors work in Postgres and PGlite. */
export const sourceChunks = pgTable("source_chunks", {
  id: text("id").primaryKey(),
  sourceId: text("source_id").notNull().references(() => sources.id, { onDelete: "cascade" }),
  workbookId: text("workbook_id").notNull(),
  ownerId: text("owner_id"),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  contentHash: text("content_hash").notNull(),
  embedding: jsonb("embedding").$type<number[]>().notNull(),
  embeddingModel: text("embedding_model").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("source_chunks_source_idx").on(table.sourceId), index("source_chunks_workbook_idx").on(table.workbookId)]);

/**
 * Generated study artifacts for a workbook (slides first; quiz/cards/mindmap/
 * guide/notes reuse the same table). `data` holds the validated artifact JSON
 * (for slides: { title, slides: [{ ..., image_status }] }); illustration
 * images live on the asset store, keyed by artifact id.
 */
export const artifacts = pgTable(
  "artifacts",
  {
    id: text("id").primaryKey(),
    workbookId: text("workbook_id").notNull(),
    userId: text("user_id"),
    kind: text("kind").notNull(),
    title: text("title").notNull().default("Menjana…"),
    status: text("status").notNull().default("generating"),
    error: text("error"),
    params: jsonb("params"),
    data: jsonb("data"),
    model: text("model"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("artifacts_workbook_kind_idx").on(t.workbookId, t.kind)],
);

/** Saved chat turns, isolated by workbook and learner. A turn is written atomically. */
/** Private chat sessions per workbook per learner (owner and viewers alike). */
export const workbookChatSessions = pgTable("workbook_chat_sessions", {
  id: text("id").primaryKey(),
  workbookId: text("workbook_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Sembang baharu"),
  sourceIds: jsonb("source_ids").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, table => [index("workbook_chat_sessions_scope_idx").on(table.workbookId, table.userId)]);

export const workbookChatTurns = pgTable("workbook_chat_turns", {
  id: text("id").primaryKey(),
  workbookId: text("workbook_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id"),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sourceIds: jsonb("source_ids").$type<string[]>().notNull(),
  citations: jsonb("citations").$type<{ index: number; sourceId: string; title: string; excerpt: string; url?: string }[]>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, table => [index("workbook_chat_turns_scope_idx").on(table.workbookId, table.userId), index("workbook_chat_turns_session_idx").on(table.sessionId)]);
