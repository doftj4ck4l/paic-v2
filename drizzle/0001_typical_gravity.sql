CREATE TABLE "artifacts" (
	"id" text PRIMARY KEY NOT NULL,
	"workbook_id" text NOT NULL,
	"user_id" text,
	"kind" text NOT NULL,
	"title" text DEFAULT 'Menjana…' NOT NULL,
	"status" text DEFAULT 'generating' NOT NULL,
	"error" text,
	"params" jsonb,
	"data" jsonb,
	"model" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "artifacts_workbook_kind_idx" ON "artifacts" USING btree ("workbook_id","kind");