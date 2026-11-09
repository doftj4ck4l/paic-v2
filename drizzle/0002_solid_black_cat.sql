CREATE TABLE "sources" (
	"id" text PRIMARY KEY NOT NULL,
	"workbook_id" text NOT NULL,
	"owner_id" text,
	"title" text NOT NULL,
	"kind" text NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"full_text" text,
	"file_key" text,
	"size_label" text,
	"error" text,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workbooks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subject_id" text NOT NULL,
	"topic" text DEFAULT '' NOT NULL,
	"year_label" text DEFAULT '' NOT NULL,
	"owner_id" text NOT NULL,
	"owner_name" text DEFAULT '' NOT NULL,
	"owner_role" text DEFAULT 'student' NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "sources_workbook_idx" ON "sources" USING btree ("workbook_id");--> statement-breakpoint
CREATE INDEX "workbooks_owner_idx" ON "workbooks" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "workbooks_visibility_idx" ON "workbooks" USING btree ("visibility");