CREATE TABLE "workbook_chat_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"workbook_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text DEFAULT 'Sembang baharu' NOT NULL,
	"source_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workbook_chat_turns" ADD COLUMN "session_id" text;--> statement-breakpoint
ALTER TABLE "workbook_chat_sessions" ADD CONSTRAINT "workbook_chat_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workbook_chat_sessions_scope_idx" ON "workbook_chat_sessions" USING btree ("workbook_id","user_id");--> statement-breakpoint
CREATE INDEX "workbook_chat_turns_session_idx" ON "workbook_chat_turns" USING btree ("session_id");