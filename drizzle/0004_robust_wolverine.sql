CREATE TABLE "workbook_chat_turns" (
	"id" text PRIMARY KEY NOT NULL,
	"workbook_id" text NOT NULL,
	"user_id" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"source_ids" jsonb NOT NULL,
	"citations" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workbook_chat_turns" ADD CONSTRAINT "workbook_chat_turns_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workbook_chat_turns_scope_idx" ON "workbook_chat_turns" USING btree ("workbook_id","user_id");